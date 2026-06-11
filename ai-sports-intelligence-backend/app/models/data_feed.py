from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import DataFeedStatus


class DataFeed(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "data_feeds"

    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    feed_type: Mapped[str] = mapped_column(String(32), nullable=False)  # fixtures | results | ...
    status: Mapped[DataFeedStatus] = mapped_column(
        Enum(DataFeedStatus, native_enum=False, length=12),
        default=DataFeedStatus.HEALTHY,
        nullable=False,
    )
    last_success_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_failure_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_error: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    statistics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
