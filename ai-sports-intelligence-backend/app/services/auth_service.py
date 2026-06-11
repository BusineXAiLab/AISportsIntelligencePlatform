"""Registration, login, token refresh, logout and password flows."""
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, UnauthorizedError, ValidationAppError
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_verification_token,
    hash_password,
    verify_password,
)
from app.integrations.email_client import get_email_client
from app.models.user import RefreshToken, User, UserPreferences
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService

logger = get_logger(__name__)

RESET_TOKEN_TTL_HOURS = 2


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.audit = AuditService(db)
        self.email = get_email_client()

    async def register(self, email: str, password: str, full_name: str) -> User:
        email = email.lower()
        if await self.users.get_by_email(email):
            raise ConflictError("An account with this email already exists")

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            email_verification_token=generate_verification_token(),
        )
        self.db.add(user)
        await self.db.flush()
        self.db.add(UserPreferences(user_id=user.id))
        await self.db.flush()

        await self.email.send_email(
            to=email,
            subject="Verify your email",
            body=f"Your verification token: {user.email_verification_token}",
        )
        await self.audit.log(action="user.registered", actor_user_id=user.id)
        return user

    async def login(self, email: str, password: str, user_agent: str | None = None
                    ) -> tuple[User, str, str]:
        user = await self.users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account is disabled")

        user.last_login_at = datetime.now(UTC)
        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token = await self._issue_refresh_token(user, user_agent)
        await self.audit.log(action="user.login", actor_user_id=user.id)
        return user, access_token, refresh_token

    async def _issue_refresh_token(self, user: User, user_agent: str | None = None) -> str:
        token = create_refresh_token(str(user.id))
        payload = decode_token(token, "refresh")
        self.db.add(
            RefreshToken(
                user_id=user.id,
                jti=payload["jti"],
                expires_at=datetime.fromtimestamp(payload["exp"], tz=UTC),
                user_agent=(user_agent or "")[:255] or None,
            )
        )
        await self.db.flush()
        return token

    async def refresh(self, refresh_token: str) -> tuple[str, str]:
        payload = decode_token(refresh_token, "refresh")
        stored = await self.users.get_refresh_token(payload["jti"])
        if stored is None or not stored.is_valid:
            raise UnauthorizedError("Refresh token is revoked or expired")

        user = await self.users.get(uuid.UUID(payload["sub"]))
        if user is None or not user.is_active:
            raise UnauthorizedError("User not found or disabled")

        # Rotate: revoke old token, issue a new pair.
        stored.revoked_at = datetime.now(UTC)
        new_access = create_access_token(str(user.id), user.role.value)
        new_refresh = await self._issue_refresh_token(user)
        return new_access, new_refresh

    async def logout(self, refresh_token: str) -> None:
        payload = decode_token(refresh_token, "refresh")
        stored = await self.users.get_refresh_token(payload["jti"])
        if stored is not None and stored.revoked_at is None:
            stored.revoked_at = datetime.now(UTC)

    async def forgot_password(self, email: str) -> None:
        user = await self.users.get_by_email(email)
        if user is None:
            # Do not leak account existence.
            return
        user.password_reset_token = generate_verification_token()
        user.password_reset_expires_at = datetime.now(UTC) + timedelta(
            hours=RESET_TOKEN_TTL_HOURS
        )
        await self.email.send_email(
            to=user.email,
            subject="Reset your password",
            body=f"Your password reset token: {user.password_reset_token}",
        )

    async def reset_password(self, token: str, new_password: str) -> None:
        user = await self.users.get_by_reset_token(token)
        if (
            user is None
            or user.password_reset_expires_at is None
            or user.password_reset_expires_at < datetime.now(UTC)
        ):
            raise ValidationAppError("Invalid or expired reset token")
        user.hashed_password = hash_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires_at = None
        # Revoke all sessions after a password reset.
        for rt in await self._active_refresh_tokens(user.id):
            rt.revoked_at = datetime.now(UTC)
        await self.audit.log(action="user.password_reset", actor_user_id=user.id)

    async def _active_refresh_tokens(self, user_id: uuid.UUID) -> list[RefreshToken]:
        from sqlalchemy import select

        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
            )
        )
        return list(result.scalars().all())

    async def verify_email(self, token: str) -> None:
        user = await self.users.get_by_verification_token(token)
        if user is None:
            raise ValidationAppError("Invalid verification token")
        user.is_email_verified = True
        user.email_verification_token = None
