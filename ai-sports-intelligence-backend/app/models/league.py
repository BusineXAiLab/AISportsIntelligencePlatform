import uuid

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class League(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "leagues"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    country: Mapped[str | None] = mapped_column(String(64), nullable=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    provider_league_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)

    seasons: Mapped[list["Season"]] = relationship(
        back_populates="league", cascade="all, delete-orphan"
    )


class Season(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "seasons"
    __table_args__ = (UniqueConstraint("league_id", "name", name="uq_season_league_name"),)

    league_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leagues.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g. "2025/2026"
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    league: Mapped[League] = relationship(back_populates="seasons")
