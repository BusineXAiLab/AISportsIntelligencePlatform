import uuid

from sqlalchemy import func, select

from app.models.enums import TelegramAccountStatus, TelegramMessageStatus
from app.models.telegram import TelegramAccount, TelegramMessage
from app.repositories.base import BaseRepository


class TelegramRepository(BaseRepository[TelegramAccount]):
    model = TelegramAccount

    async def get_for_user(self, user_id: uuid.UUID) -> TelegramAccount | None:
        result = await self.db.execute(
            select(TelegramAccount).where(TelegramAccount.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_telegram_user_id(self, telegram_user_id: str) -> TelegramAccount | None:
        result = await self.db.execute(
            select(TelegramAccount).where(
                TelegramAccount.telegram_user_id == telegram_user_id
            )
        )
        return result.scalar_one_or_none()

    async def list_vip_active(self) -> list[TelegramAccount]:
        result = await self.db.execute(
            select(TelegramAccount).where(
                TelegramAccount.status == TelegramAccountStatus.VIP_ACTIVE
            )
        )
        return list(result.scalars().all())

    async def list_messages(
        self, status: TelegramMessageStatus | None = None
    ) -> list[TelegramMessage]:
        query = select(TelegramMessage).order_by(TelegramMessage.created_at.desc())
        if status:
            query = query.where(TelegramMessage.status == status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_message(self, message_id: uuid.UUID) -> TelegramMessage | None:
        return await self.db.get(TelegramMessage, message_id)

    async def list_sendable_messages(self) -> list[TelegramMessage]:
        result = await self.db.execute(
            select(TelegramMessage).where(
                TelegramMessage.status == TelegramMessageStatus.APPROVED
            )
        )
        return list(result.scalars().all())

    async def message_stats(self) -> dict[str, int]:
        result = await self.db.execute(
            select(TelegramMessage.status, func.count(TelegramMessage.id)).group_by(
                TelegramMessage.status
            )
        )
        return {status.value: count for status, count in result.all()}

    async def count_connected(self) -> int:
        result = await self.db.execute(
            select(func.count(TelegramAccount.id)).where(
                TelegramAccount.status.in_(
                    [TelegramAccountStatus.CONNECTED, TelegramAccountStatus.VIP_ACTIVE]
                )
            )
        )
        return result.scalar_one()

    async def count_vip_active(self) -> int:
        result = await self.db.execute(
            select(func.count(TelegramAccount.id)).where(
                TelegramAccount.status == TelegramAccountStatus.VIP_ACTIVE
            )
        )
        return result.scalar_one()
