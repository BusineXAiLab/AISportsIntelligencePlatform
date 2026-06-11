import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import FixtureStatus
from app.models.league import League, Season
from app.models.team import Team


class Venue(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "venues"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str | None] = mapped_column(String(64), nullable=True)
    country: Mapped[str | None] = mapped_column(String(64), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    provider_venue_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Fixture(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "fixtures"
    __table_args__ = (
        Index("ix_fixtures_kickoff", "kickoff_time"),
        Index("ix_fixtures_league_kickoff", "league_id", "kickoff_time"),
    )

    league_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leagues.id", ondelete="CASCADE"), nullable=False
    )
    season_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("seasons.id", ondelete="SET NULL"), nullable=True
    )
    home_team_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    away_team_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    venue_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("venues.id", ondelete="SET NULL"), nullable=True
    )
    kickoff_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[FixtureStatus] = mapped_column(
        Enum(FixtureStatus, native_enum=False, length=16),
        default=FixtureStatus.SCHEDULED,
        nullable=False,
    )
    referee: Mapped[str | None] = mapped_column(String(128), nullable=True)
    weather: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # placeholder
    injuries_news: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # placeholder
    provider_fixture_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    provider_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    provider_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    league: Mapped[League] = relationship()
    season: Mapped[Season | None] = relationship()
    home_team: Mapped[Team] = relationship(foreign_keys=[home_team_id])
    away_team: Mapped[Team] = relationship(foreign_keys=[away_team_id])
    venue: Mapped[Venue | None] = relationship()
    result: Mapped["Result | None"] = relationship(back_populates="fixture", uselist=False)


class Result(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "results"

    fixture_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("fixtures.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    home_score: Mapped[int] = mapped_column(Integer, nullable=False)
    away_score: Mapped[int] = mapped_column(Integer, nullable=False)
    half_time_home_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    half_time_away_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    events: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # goals, cards, subs
    statistics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    finalized_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    fixture: Mapped[Fixture] = relationship(back_populates="result")

    @property
    def outcome(self) -> str:
        if self.home_score > self.away_score:
            return "HOME_WIN"
        if self.home_score < self.away_score:
            return "AWAY_WIN"
        return "DRAW"
