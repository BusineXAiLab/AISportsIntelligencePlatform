"""Telegram account linking, VIP entitlement enforcement and message workflow."""
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationAppError
from app.core.logging import get_logger
from app.integrations.telegram_client import TelegramClient, telegram_client
from app.models.enums import (
    SubscriptionPlan,
    TelegramAccountStatus,
    TelegramChannelType,
    TelegramMessageStatus,
)
from app.models.telegram import TelegramAccount, TelegramMessage
from app.models.user import User
from app.repositories.telegram_repository import TelegramRepository
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService
from app.services.entitlement_service import EntitlementService

logger = get_logger(__name__)

VERIFICATION_TTL_MINUTES = 15


class TelegramService:
    def __init__(self, db: AsyncSession, client: TelegramClient | None = None) -> None:
        self.db = db
        self.client = client or telegram_client
        self.telegram = TelegramRepository(db)
        self.users = UserRepository(db)
        self.entitlements = EntitlementService(db)
        self.audit = AuditService(db)

    async def get_status(self, user: User) -> dict:
        account = await self.telegram.get_for_user(user.id)
        if account is None:
            return {
                "status": TelegramAccountStatus.NOT_CONNECTED,
                "telegram_username": None,
                "vip_active": False,
                "vip_granted_at": None,
            }
        return {
            "status": account.status,
            "telegram_username": account.telegram_username,
            "vip_active": account.status == TelegramAccountStatus.VIP_ACTIVE,
            "vip_granted_at": account.vip_granted_at,
        }

    async def start_connect(self, user: User) -> dict:
        account = await self.telegram.get_for_user(user.id)
        if account is None:
            account = TelegramAccount(user_id=user.id)
            self.db.add(account)
        if account.status in (
            TelegramAccountStatus.CONNECTED,
            TelegramAccountStatus.VIP_ACTIVE,
        ):
            raise ConflictError("Telegram account is already connected")

        code = f"{secrets.randbelow(10**6):06d}"
        expires = datetime.now(UTC) + timedelta(minutes=VERIFICATION_TTL_MINUTES)
        account.verification_code = code
        account.verification_expires_at = expires
        account.status = TelegramAccountStatus.PENDING_VERIFICATION
        await self.db.flush()
        return {
            "verification_code": code,
            "bot_username_hint": "Send this code to the platform bot in Telegram",
            "expires_at": expires,
            "instructions": (
                "Open Telegram, start a chat with the platform bot and send the "
                f"verification code {code} within {VERIFICATION_TTL_MINUTES} minutes."
            ),
        }

    async def verify(self, user: User, telegram_user_id: str, verification_code: str,
                     telegram_username: str | None = None) -> TelegramAccount:
        account = await self.telegram.get_for_user(user.id)
        if account is None or account.status != TelegramAccountStatus.PENDING_VERIFICATION:
            raise ValidationAppError("No pending Telegram verification for this user")
        if (
            account.verification_expires_at is None
            or account.verification_expires_at < datetime.now(UTC)
        ):
            raise ValidationAppError("Verification code has expired")
        if account.verification_code != verification_code:
            raise ValidationAppError("Invalid verification code")
        existing = await self.telegram.get_by_telegram_user_id(telegram_user_id)
        if existing is not None and existing.user_id != user.id:
            raise ConflictError("This Telegram account is linked to another user")

        account.telegram_user_id = telegram_user_id
        account.telegram_username = telegram_username
        account.verification_code = None
        account.verification_expires_at = None
        account.status = TelegramAccountStatus.CONNECTED
        await self.db.flush()

        # Grant VIP immediately when the subscription allows it.
        if await self.entitlements.has_vip_telegram_access(user):
            await self.grant_vip(account)
        await self.audit.log(action="telegram.connected", actor_user_id=user.id)
        return account

    async def disconnect(self, user: User) -> None:
        account = await self.telegram.get_for_user(user.id)
        if account is None:
            raise NotFoundError("No Telegram account connected")
        if account.status == TelegramAccountStatus.VIP_ACTIVE and account.telegram_user_id:
            try:
                await self.client.kick_from_vip(account.telegram_user_id)
            except Exception as exc:  # noqa: BLE001 - VIP removal is best-effort here
                logger.warning("vip_kick_failed", error=str(exc))
        account.telegram_user_id = None
        account.telegram_username = None
        account.status = TelegramAccountStatus.NOT_CONNECTED
        account.vip_invite_link = None
        await self.db.flush()
        await self.audit.log(action="telegram.disconnected", actor_user_id=user.id)

    async def grant_vip(self, account: TelegramAccount) -> None:
        try:
            invite_link = await self.client.create_vip_invite_link()
        except Exception as exc:  # noqa: BLE001 - keep account consistent if bot is offline
            logger.error("vip_invite_failed", error=str(exc))
            invite_link = None
        account.status = TelegramAccountStatus.VIP_ACTIVE
        account.vip_granted_at = datetime.now(UTC)
        account.vip_revoked_at = None
        account.vip_invite_link = invite_link
        await self.db.flush()

    async def revoke_vip(self, account: TelegramAccount) -> None:
        if account.telegram_user_id:
            try:
                await self.client.kick_from_vip(account.telegram_user_id)
            except Exception as exc:  # noqa: BLE001
                logger.warning("vip_kick_failed", error=str(exc))
        account.status = TelegramAccountStatus.CONNECTED
        account.vip_revoked_at = datetime.now(UTC)
        account.vip_invite_link = None
        await self.db.flush()

    async def revoke_expired_vip_access(self) -> int:
        """Revoke VIP for users whose subscription no longer qualifies."""
        revoked = 0
        for account in await self.telegram.list_vip_active():
            user = await self.users.get(account.user_id)
            if user is None or not await self.entitlements.has_plan(
                user, SubscriptionPlan.PREMIUM
            ):
                await self.revoke_vip(account)
                revoked += 1
                logger.info("vip_access_revoked", user_id=str(account.user_id))
        return revoked

    # ------------------------------------------------------------------ #
    # Message workflow
    # ------------------------------------------------------------------ #

    async def queue_message(
        self,
        content: str,
        channel_type: TelegramChannelType,
        requires_approval: bool = True,
        related_prediction_id: uuid.UUID | None = None,
        related_report_id: uuid.UUID | None = None,
        scheduled_for: datetime | None = None,
    ) -> TelegramMessage:
        from app.services.responsible_language_service import ResponsibleLanguageService

        clean, _ = ResponsibleLanguageService().filter_text(content)
        message = TelegramMessage(
            channel_type=channel_type,
            content=clean,
            requires_approval=requires_approval,
            status=(
                TelegramMessageStatus.PENDING_APPROVAL
                if requires_approval
                else TelegramMessageStatus.APPROVED
            ),
            related_prediction_id=related_prediction_id,
            related_report_id=related_report_id,
            scheduled_for=scheduled_for,
        )
        self.db.add(message)
        await self.db.flush()
        return message

    async def approve_message(self, message_id: uuid.UUID, admin: User,
                              note: str | None = None) -> TelegramMessage:
        message = await self.telegram.get_message(message_id)
        if message is None:
            raise NotFoundError("Telegram message not found")
        if message.status != TelegramMessageStatus.PENDING_APPROVAL:
            raise ConflictError("Message is not pending approval")
        message.status = TelegramMessageStatus.APPROVED
        message.approved_by = admin.id
        message.approved_at = datetime.now(UTC)
        await self.audit.log_admin_action(
            admin_user_id=admin.id, action="telegram_post.approved",
            target_type="telegram_message", target_id=str(message_id), note=note,
        )
        return message

    async def send_message(self, message: TelegramMessage) -> TelegramMessage:
        if message.status != TelegramMessageStatus.APPROVED:
            raise ConflictError("Only approved messages can be sent")
        try:
            result = await self.client.send_channel_message(
                message.channel_type, message.content
            )
            message.status = TelegramMessageStatus.SENT
            message.sent_at = datetime.now(UTC)
            message.telegram_message_id = str(result.get("message_id", ""))
            message.delivery_metadata = {"chat_id": str(result.get("chat", {}).get("id", ""))}
        except Exception as exc:  # noqa: BLE001 - failures must be recorded, not raised
            message.status = TelegramMessageStatus.FAILED
            message.error_detail = str(exc)[:1024]
            logger.error("telegram_send_failed", message_id=str(message.id), error=str(exc))
        await self.db.flush()
        return message

    async def send_test(self, admin: User, content: str,
                        channel_type: TelegramChannelType) -> TelegramMessage:
        if not await self.entitlements.has_plan(admin, SubscriptionPlan.FREE):
            raise ForbiddenError("Not permitted")
        message = await self.queue_message(content, channel_type, requires_approval=False)
        return await self.send_message(message)
