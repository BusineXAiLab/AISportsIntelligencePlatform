import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    TelegramAccountStatus,
    TelegramChannelType,
    TelegramMessageStatus,
)


class TelegramAccount(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "telegram_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True,
        nullable=False,
    )
    telegram_user_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    telegram_username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[TelegramAccountStatus] = mapped_column(
        Enum(TelegramAccountStatus, native_enum=False, length=24),
        default=TelegramAccountStatus.NOT_CONNECTED,
        nullable=False,
    )
    verification_code: Mapped[str | None] = mapped_column(String(16), nullable=True)
    verification_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    vip_granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    vip_revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    vip_invite_link: Mapped[str | None] = mapped_column(String(255), nullable=True)


class TelegramMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "telegram_messages"

    channel_type: Mapped[TelegramChannelType] = mapped_column(
        Enum(TelegramChannelType, native_enum=False, length=8), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[TelegramMessageStatus] = mapped_column(
        Enum(TelegramMessageStatus, native_enum=False, length=24),
        default=TelegramMessageStatus.PENDING_APPROVAL,
        nullable=False,
    )
    requires_approval: Mapped[bool] = mapped_column(default=True, nullable=False)
    related_prediction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True
    )
    related_report_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reports.id", ondelete="SET NULL"), nullable=True
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    telegram_message_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_detail: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    delivery_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
