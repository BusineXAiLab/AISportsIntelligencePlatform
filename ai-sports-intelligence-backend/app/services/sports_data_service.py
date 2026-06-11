"""Ingestion of fixtures and results from the configured sports data provider."""
from datetime import UTC, date, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.integrations.sports_data_client import (
    FixtureDTO,
    SportsDataProvider,
    get_sports_data_provider,
)
from app.models.data_feed import DataFeed
from app.models.enums import DataFeedStatus, FixtureStatus
from app.models.league import League
from app.models.match import Fixture, Result, Venue
from app.models.team import Team
from app.repositories.match_repository import MatchRepository

logger = get_logger(__name__)


class SportsDataService:
    def __init__(self, db: AsyncSession, provider: SportsDataProvider | None = None) -> None:
        self.db = db
        self.provider = provider or get_sports_data_provider()
        self.matches = MatchRepository(db)

    async def _get_or_create_league(self, dto: FixtureDTO) -> League:
        league = await self.matches.get_league_by_code(dto.league_code)
        if league is None:
            league = League(
                name=dto.league_name,
                code=dto.league_code,
                country=dto.country,
                provider_league_id=dto.league_code,
            )
            self.db.add(league)
            await self.db.flush()
        return league

    async def _get_or_create_team(self, name: str, league: League) -> Team:
        team = await self.matches.get_team_by_name(name)
        if team is None:
            team = Team(name=name, league_id=league.id, provider_team_id=name)
            self.db.add(team)
            await self.db.flush()
        return team

    async def ingest_fixtures(self, target_date: date) -> int:
        """Upsert fixtures for a date. Returns the number of new fixtures."""
        created = 0
        fixtures = await self.provider.get_fixtures(target_date)
        for dto in fixtures:
            existing = await self.matches.get_by_provider_id(dto.provider_fixture_id)
            if existing is not None:
                existing.kickoff_time = dto.kickoff_time
                existing.referee = dto.referee
                continue
            league = await self._get_or_create_league(dto)
            home = await self._get_or_create_team(dto.home_team, league)
            away = await self._get_or_create_team(dto.away_team, league)
            venue = None
            if dto.venue:
                venue = Venue(name=dto.venue)
                self.db.add(venue)
                await self.db.flush()
            self.db.add(
                Fixture(
                    league_id=league.id,
                    home_team_id=home.id,
                    away_team_id=away.id,
                    venue_id=venue.id if venue else None,
                    kickoff_time=dto.kickoff_time,
                    referee=dto.referee,
                    provider_fixture_id=dto.provider_fixture_id,
                    provider_name=self.provider.name,
                )
            )
            created += 1
        await self.db.flush()
        await self._mark_feed("fixtures", success=True)
        logger.info("fixtures_ingested", date=str(target_date), created=created)
        return created

    async def ingest_results(self, target_date: date) -> int:
        """Attach results to finished fixtures. Returns the number settled."""
        updated = 0
        results = await self.provider.get_results(target_date)
        for dto in results:
            fixture = await self.matches.get_by_provider_id(dto.provider_fixture_id)
            if fixture is None or fixture.result is not None:
                continue
            fixture.status = FixtureStatus.FINISHED
            self.db.add(
                Result(
                    fixture_id=fixture.id,
                    home_score=dto.home_score,
                    away_score=dto.away_score,
                    half_time_home_score=dto.half_time_home_score,
                    half_time_away_score=dto.half_time_away_score,
                    events=dto.events or None,
                    finalized_at=datetime.now(UTC),
                )
            )
            updated += 1
        await self.db.flush()
        await self._mark_feed("results", success=True)
        logger.info("results_ingested", date=str(target_date), updated=updated)
        return updated

    async def _mark_feed(self, feed_type: str, success: bool, error: str | None = None) -> None:
        from sqlalchemy import select

        name = f"{settings.SPORTS_DATA_PROVIDER}-{feed_type}"
        feed = (
            await self.db.execute(select(DataFeed).where(DataFeed.name == name))
        ).scalar_one_or_none()
        if feed is None:
            feed = DataFeed(
                name=name, provider=settings.SPORTS_DATA_PROVIDER, feed_type=feed_type
            )
            self.db.add(feed)
        now = datetime.now(UTC)
        if success:
            feed.status = DataFeedStatus.HEALTHY
            feed.last_success_at = now
            feed.consecutive_failures = 0
            feed.last_error = None
        else:
            feed.last_failure_at = now
            feed.consecutive_failures += 1
            feed.last_error = (error or "")[:1024] or None
            feed.status = (
                DataFeedStatus.DOWN if feed.consecutive_failures >= 3 else DataFeedStatus.DEGRADED
            )
        await self.db.flush()

    async def record_feed_failure(self, feed_type: str, error: str) -> None:
        await self._mark_feed(feed_type, success=False, error=error)
