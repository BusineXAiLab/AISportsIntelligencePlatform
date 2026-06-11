import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Player(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "players"

    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    position: Mapped[str | None] = mapped_column(String(32), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(64), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    shirt_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    provider_player_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
