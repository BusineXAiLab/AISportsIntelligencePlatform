import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.common import IDTimestamped, MessageResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationRead(IDTimestamped):
    channel: str
    title: str
    body: str
    status: str
    read_at: datetime | None = None


@router.get("", response_model=list[NotificationRead])
async def list_notifications(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[NotificationRead]:
    notifications = await NotificationService(db).list_for_user(user.id)
    return [NotificationRead.model_validate(n) for n in notifications]


@router.post("/{notification_id}/read", response_model=MessageResponse)
async def mark_notification_read(
    notification_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await NotificationService(db).mark_read(user.id, notification_id)
    return MessageResponse(message="Notification marked as read")
