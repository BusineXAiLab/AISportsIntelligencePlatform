"""Read APIs for matches, leagues and teams."""
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.league import League
from app.models.match import Fixture
from app.models.team import Team
from app.repositories.match_repository import MatchRepository


class MatchService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.matches = MatchRepository(db)

    async def get_today(self) -> list[Fixture]:
        return await self.matches.list_for_date(datetime.now(UTC).date())

    async def get_upcoming(self, days: int = 7, league_id: uuid.UUID | None = None
                           ) -> list[Fixture]:
        return await self.matches.list_upcoming(days=days, league_id=league_id)

    async def get_match(self, match_id: uuid.UUID) -> Fixture:
        fixture = await self.matches.get_with_relations(match_id)
        if fixture is None:
            raise NotFoundError("Match not found")
        return fixture

    async def get_timeline(self, match_id: uuid.UUID) -> dict:
        fixture = await self.get_match(match_id)
        events = []
        if fixture.result is not None and fixture.result.events:
            events = fixture.result.events
        return {"match_id": fixture.id, "status": fixture.status, "events": events}

    async def list_leagues(self) -> list[League]:
        return await self.matches.list_leagues()

    async def get_team(self, team_id: uuid.UUID) -> Team:
        team = await self.matches.get_team(team_id)
        if team is None:
            raise NotFoundError("Team not found")
        return team

    async def get_team_form(self, team_id: uuid.UUID, last_n: int = 5) -> dict:
        team = await self.get_team(team_id)
        fixtures = await self.matches.list_recent_results_for_team(team_id, limit=last_n)

        entries = []
        wins = draws = losses = goals_for_total = goals_against_total = 0
        for fixture in fixtures:
            assert fixture.result is not None
            is_home = fixture.home_team_id == team_id
            goals_for = fixture.result.home_score if is_home else fixture.result.away_score
            goals_against = fixture.result.away_score if is_home else fixture.result.home_score
            if goals_for > goals_against:
                outcome = "W"
                wins += 1
            elif goals_for == goals_against:
                outcome = "D"
                draws += 1
            else:
                outcome = "L"
                losses += 1
            goals_for_total += goals_for
            goals_against_total += goals_against
            entries.append(
                {
                    "fixture_id": fixture.id,
                    "opponent": (
                        fixture.away_team.name if is_home else fixture.home_team.name
                    ),
                    "kickoff_time": fixture.kickoff_time,
                    "home_or_away": "HOME" if is_home else "AWAY",
                    "goals_for": goals_for,
                    "goals_against": goals_against,
                    "outcome": outcome,
                }
            )

        return {
            "team_id": team.id,
            "team_name": team.name,
            "last_matches": entries,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goals_scored": goals_for_total,
            "goals_conceded": goals_against_total,
            "form_string": "".join(e["outcome"] for e in entries),
        }
