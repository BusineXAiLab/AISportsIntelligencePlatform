import uuid
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from app.models.enums import FixtureStatus
from app.models.league import League
from app.models.match import Fixture, Result
from app.models.team import Team
from app.repositories.base import BaseRepository

FIXTURE_LOAD_OPTIONS = (
    selectinload(Fixture.league),
    selectinload(Fixture.home_team),
    selectinload(Fixture.away_team),
    selectinload(Fixture.result),
)


class MatchRepository(BaseRepository[Fixture]):
    model = Fixture

    async def get_with_relations(self, fixture_id: uuid.UUID) -> Fixture | None:
        result = await self.db.execute(
            select(Fixture).options(*FIXTURE_LOAD_OPTIONS).where(Fixture.id == fixture_id)
        )
        return result.scalar_one_or_none()

    async def get_by_provider_id(self, provider_fixture_id: str) -> Fixture | None:
        result = await self.db.execute(
            select(Fixture).where(Fixture.provider_fixture_id == provider_fixture_id)
        )
        return result.scalar_one_or_none()

    async def list_for_date(self, target_date: date) -> list[Fixture]:
        start = datetime.combine(target_date, time.min, tzinfo=UTC)
        end = start + timedelta(days=1)
        result = await self.db.execute(
            select(Fixture)
            .options(*FIXTURE_LOAD_OPTIONS)
            .where(Fixture.kickoff_time >= start, Fixture.kickoff_time < end)
            .order_by(Fixture.kickoff_time)
        )
        return list(result.scalars().all())

    async def list_upcoming(self, days: int = 7, league_id: uuid.UUID | None = None) -> list[Fixture]:
        now = datetime.now(UTC)
        query = (
            select(Fixture)
            .options(*FIXTURE_LOAD_OPTIONS)
            .where(
                Fixture.kickoff_time >= now,
                Fixture.kickoff_time < now + timedelta(days=days),
                Fixture.status == FixtureStatus.SCHEDULED,
            )
            .order_by(Fixture.kickoff_time)
        )
        if league_id:
            query = query.where(Fixture.league_id == league_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_finished_without_settlement(self) -> list[Fixture]:
        """Finished fixtures whose predictions have not yet been settled."""
        from app.models.enums import PredictionStatus
        from app.models.prediction import Prediction

        result = await self.db.execute(
            select(Fixture)
            .join(Prediction, Prediction.fixture_id == Fixture.id)
            .options(*FIXTURE_LOAD_OPTIONS)
            .where(
                Fixture.status == FixtureStatus.FINISHED,
                Prediction.status != PredictionStatus.SETTLED,
                Prediction.status.in_(
                    [PredictionStatus.PUBLISHED, PredictionStatus.APPROVED]
                ),
            )
            .distinct()
        )
        return list(result.scalars().all())

    async def list_leagues(self, active_only: bool = True) -> list[League]:
        query = select(League).order_by(League.name)
        if active_only:
            query = query.where(League.is_active.is_(True))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_league_by_code(self, code: str) -> League | None:
        result = await self.db.execute(select(League).where(League.code == code))
        return result.scalar_one_or_none()

    async def get_team(self, team_id: uuid.UUID) -> Team | None:
        return await self.db.get(Team, team_id)

    async def get_team_by_name(self, name: str) -> Team | None:
        result = await self.db.execute(select(Team).where(Team.name == name))
        return result.scalar_one_or_none()

    async def list_recent_results_for_team(
        self, team_id: uuid.UUID, limit: int = 5
    ) -> list[Fixture]:
        result = await self.db.execute(
            select(Fixture)
            .options(*FIXTURE_LOAD_OPTIONS)
            .join(Result, Result.fixture_id == Fixture.id)
            .where(
                Fixture.status == FixtureStatus.FINISHED,
                or_(Fixture.home_team_id == team_id, Fixture.away_team_id == team_id),
            )
            .order_by(Fixture.kickoff_time.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
