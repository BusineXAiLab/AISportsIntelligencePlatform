"""In-app/email notification dispatch."""
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.integrations.email_client import get_email_client
from app.models.enums import NotificationChannel, NotificationStatus
from app.models.notification import Notification
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)


class NotificationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.email = get_email_client()

    async def notify(
        self,
        user_id: uuid.UUID,
        title: str,
        body: str,
        channel: NotificationChannel = NotificationChannel.IN_APP,
        payload: dict | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id, channel=channel, title=title, body=body, payload=payload
        )
        self.db.add(notification)
        await self.db.flush()

        if channel == NotificationChannel.EMAIL:
            user = await self.users.get(user_id)
            if user is not None:
                try:
                    await self.email.send_email(user.email, title, body)
                    notification.status = NotificationStatus.SENT
                    notification.sent_at = datetime.now(UTC)
                except Exception as exc:  # noqa: BLE001
                    notification.status = NotificationStatus.FAILED
                    logger.error("notification_email_failed", error=str(exc))
        else:
            notification.status = NotificationStatus.SENT
            notification.sent_at = datetime.now(UTC)
        await self.db.flush()
        return notification

    async def list_for_user(self, user_id: uuid.UUID, limit: int = 50) -> list[Notification]:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def mark_read(self, user_id: uuid.UUID, notification_id: uuid.UUID) -> None:
        notification = await self.db.get(Notification, notification_id)
        if notification is not None and notification.user_id == user_id:
            notification.read_at = datetime.now(UTC)
            await self.db.flush()
