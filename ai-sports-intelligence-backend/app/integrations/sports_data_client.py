"""Sports data provider abstraction.

The active provider is selected via SPORTS_DATA_PROVIDER. New providers
(API-Football, Sportmonks, Opta, ...) implement SportsDataProvider and are
registered in PROVIDERS.
"""
import hashlib
import random
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import UTC, date, datetime, time, timedelta

import httpx

from app.core.config import settings
from app.core.exceptions import ExternalServiceError


@dataclass
class FixtureDTO:
    provider_fixture_id: str
    league_code: str
    league_name: str
    home_team: str
    away_team: str
    kickoff_time: datetime
    venue: str | None = None
    referee: str | None = None
    country: str | None = None


@dataclass
class ResultDTO:
    provider_fixture_id: str
    home_score: int
    away_score: int
    half_time_home_score: int | None = None
    half_time_away_score: int | None = None
    events: list = field(default_factory=list)


@dataclass
class TeamFormDTO:
    team_name: str
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_scored: int
    goals_conceded: int
    form_string: str


class SportsDataProvider(ABC):
    name: str

    @abstractmethod
    async def get_fixtures(self, target_date: date) -> list[FixtureDTO]: ...

    @abstractmethod
    async def get_results(self, target_date: date) -> list[ResultDTO]: ...

    @abstractmethod
    async def get_team_form(self, team_id: str) -> TeamFormDTO: ...


_MOCK_LEAGUES = [
    ("EPL", "Premier League", "England"),
    ("LALIGA", "La Liga", "Spain"),
    ("SERIEA", "Serie A", "Italy"),
    ("BUNDESLIGA", "Bundesliga", "Germany"),
    ("UCL", "UEFA Champions League", "Europe"),
]

_MOCK_TEAMS = {
    "EPL": ["Manchester City", "Chelsea", "Arsenal", "Liverpool", "Tottenham", "Manchester United"],
    "LALIGA": ["Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla"],
    "SERIEA": ["Inter Milan", "AC Milan", "Juventus", "Napoli"],
    "BUNDESLIGA": ["Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen"],
    "UCL": ["Manchester City", "Real Madrid", "Bayern Munich", "Inter Milan"],
}


class MockSportsDataProvider(SportsDataProvider):
    """Deterministic mock provider for local development and tests."""

    name = "mock"

    def _rng(self, seed: str) -> random.Random:
        return random.Random(int(hashlib.sha256(seed.encode()).hexdigest(), 16) % (2**32))

    async def get_fixtures(self, target_date: date) -> list[FixtureDTO]:
        fixtures: list[FixtureDTO] = []
        for code, league_name, country in _MOCK_LEAGUES:
            rng = self._rng(f"{target_date.isoformat()}-{code}")
            teams = _MOCK_TEAMS[code][:]
            rng.shuffle(teams)
            for i in range(0, len(teams) - 1, 2):
                kickoff = datetime.combine(
                    target_date, time(hour=rng.choice([13, 16, 18, 20]), minute=0), tzinfo=UTC
                )
                fixtures.append(
                    FixtureDTO(
                        provider_fixture_id=(
                            f"mock-{target_date.isoformat()}-{code}-{i // 2}"
                        ),
                        league_code=code,
                        league_name=league_name,
                        home_team=teams[i],
                        away_team=teams[i + 1],
                        kickoff_time=kickoff,
                        venue=f"{teams[i]} Stadium",
                        referee=rng.choice(["M. Oliver", "A. Taylor", "F. Brych", "D. Orsato"]),
                        country=country,
                    )
                )
        return fixtures

    async def get_results(self, target_date: date) -> list[ResultDTO]:
        results: list[ResultDTO] = []
        for fixture in await self.get_fixtures(target_date):
            rng = self._rng(f"result-{fixture.provider_fixture_id}")
            home_score = rng.choices([0, 1, 2, 3, 4], weights=[20, 32, 28, 14, 6])[0]
            away_score = rng.choices([0, 1, 2, 3], weights=[30, 35, 25, 10])[0]
            results.append(
                ResultDTO(
                    provider_fixture_id=fixture.provider_fixture_id,
                    home_score=home_score,
                    away_score=away_score,
                    half_time_home_score=min(home_score, rng.randint(0, max(home_score, 1))),
                    half_time_away_score=min(away_score, rng.randint(0, max(away_score, 1))),
                )
            )
        return results

    async def get_team_form(self, team_id: str) -> TeamFormDTO:
        rng = self._rng(f"form-{team_id}-{date.today().isocalendar().week}")
        outcomes = rng.choices(["W", "D", "L"], weights=[45, 27, 28], k=5)
        wins, draws, losses = (outcomes.count(o) for o in ("W", "D", "L"))
        return TeamFormDTO(
            team_name=team_id,
            matches_played=5,
            wins=wins,
            draws=draws,
            losses=losses,
            goals_scored=wins * 2 + draws,
            goals_conceded=losses * 2 + draws,
            form_string="".join(outcomes),
        )


class HttpSportsDataProvider(SportsDataProvider):
    """Generic HTTP provider skeleton. Adapt `_map_*` methods per vendor."""

    name = "http"

    def __init__(self) -> None:
        if not settings.SPORTS_DATA_BASE_URL:
            raise ExternalServiceError("SPORTS_DATA_BASE_URL is not configured")
        self.base_url = settings.SPORTS_DATA_BASE_URL.rstrip("/")
        self.api_key = settings.SPORTS_DATA_API_KEY

    async def _get(self, path: str, params: dict | None = None) -> dict:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self.base_url}{path}",
                params=params,
                headers={"x-api-key": self.api_key},
            )
        if response.status_code != 200:
            raise ExternalServiceError(
                f"Sports data provider returned {response.status_code}"
            )
        return response.json()

    async def get_fixtures(self, target_date: date) -> list[FixtureDTO]:
        data = await self._get("/fixtures", {"date": target_date.isoformat()})
        return [
            FixtureDTO(
                provider_fixture_id=str(item["id"]),
                league_code=item["league"]["code"],
                league_name=item["league"]["name"],
                home_team=item["home_team"]["name"],
                away_team=item["away_team"]["name"],
                kickoff_time=datetime.fromisoformat(item["kickoff_time"]),
                venue=item.get("venue"),
                referee=item.get("referee"),
            )
            for item in data.get("fixtures", [])
        ]

    async def get_results(self, target_date: date) -> list[ResultDTO]:
        data = await self._get("/results", {"date": target_date.isoformat()})
        return [
            ResultDTO(
                provider_fixture_id=str(item["fixture_id"]),
                home_score=item["home_score"],
                away_score=item["away_score"],
                half_time_home_score=item.get("ht_home_score"),
                half_time_away_score=item.get("ht_away_score"),
                events=item.get("events", []),
            )
            for item in data.get("results", [])
        ]

    async def get_team_form(self, team_id: str) -> TeamFormDTO:
        data = await self._get(f"/teams/{team_id}/form")
        return TeamFormDTO(**data)


PROVIDERS: dict[str, type[SportsDataProvider]] = {
    "mock": MockSportsDataProvider,
    "http": HttpSportsDataProvider,
}


def get_sports_data_provider() -> SportsDataProvider:
    provider_cls = PROVIDERS.get(settings.SPORTS_DATA_PROVIDER)
    if provider_cls is None:
        raise ExternalServiceError(
            f"Unknown sports data provider: {settings.SPORTS_DATA_PROVIDER}"
        )
    return provider_cls()
