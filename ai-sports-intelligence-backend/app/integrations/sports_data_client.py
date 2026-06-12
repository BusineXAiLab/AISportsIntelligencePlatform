"""Sports data provider abstraction.

The active provider is selected via SPORTS_DATA_PROVIDER. Built-in providers:
`mock`, `http` (generic skeleton), `football_data_org` (free football-data.org tier).
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
    home_team_provider_id: str | None = None
    away_team_provider_id: str | None = None


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


_FOOTBALL_DATA_FINISHED = {"FINISHED", "AWARDED"}
_FOOTBALL_DATA_SCHEDULED = {
    "SCHEDULED",
    "TIMED",
    "IN_PLAY",
    "PAUSED",
    "SUSPENDED",
    "LIVE",
}


class FootballDataOrgProvider(SportsDataProvider):
    """Free-tier provider for major European leagues via football-data.org v4."""

    name = "football_data_org"

    def __init__(self) -> None:
        if not settings.SPORTS_DATA_API_KEY:
            raise ExternalServiceError("SPORTS_DATA_API_KEY is not configured")
        self.base_url = (
            settings.SPORTS_DATA_BASE_URL or "https://api.football-data.org/v4"
        ).rstrip("/")
        self.api_key = settings.SPORTS_DATA_API_KEY

    async def _get(self, path: str, params: dict | None = None) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{self.base_url}{path}",
                params=params,
                headers={"X-Auth-Token": self.api_key},
            )
        if response.status_code == 429:
            raise ExternalServiceError("Sports data provider rate limit exceeded")
        if response.status_code != 200:
            raise ExternalServiceError(
                f"Sports data provider returned {response.status_code}: {response.text[:200]}"
            )
        return response.json()

    def _map_match_to_fixture(self, match: dict) -> FixtureDTO:
        competition = match.get("competition") or {}
        home = match.get("homeTeam") or {}
        away = match.get("awayTeam") or {}
        referees = match.get("referees") or []
        venue = match.get("venue")
        venue_name = venue if isinstance(venue, str) else (venue or {}).get("name")
        kickoff_raw = match.get("utcDate", "")
        kickoff = datetime.fromisoformat(kickoff_raw.replace("Z", "+00:00"))
        return FixtureDTO(
            provider_fixture_id=str(match["id"]),
            league_code=competition.get("code") or str(competition.get("id", "UNK")),
            league_name=competition.get("name", "Unknown"),
            home_team=home.get("name", "Home"),
            away_team=away.get("name", "Away"),
            kickoff_time=kickoff,
            venue=venue_name,
            referee=referees[0].get("name") if referees else None,
            country=(match.get("area") or {}).get("name"),
            home_team_provider_id=str(home["id"]) if home.get("id") is not None else None,
            away_team_provider_id=str(away["id"]) if away.get("id") is not None else None,
        )

    async def _matches_between(self, date_from: date, date_to: date) -> list[dict]:
        data = await self._get(
            "/matches",
            {
                "dateFrom": date_from.isoformat(),
                "dateTo": date_to.isoformat(),
            },
        )
        return data.get("matches", [])

    async def _matches_for_date(self, target_date: date) -> list[dict]:
        return await self._matches_between(target_date, target_date)

    async def get_fixtures_range(self, date_from: date, date_to: date) -> list[FixtureDTO]:
        fixtures: list[FixtureDTO] = []
        for match in await self._matches_between(date_from, date_to):
            if match.get("status") in _FOOTBALL_DATA_FINISHED:
                continue
            fixtures.append(self._map_match_to_fixture(match))
        return fixtures

    async def get_results_range(self, date_from: date, date_to: date) -> list[ResultDTO]:
        results: list[ResultDTO] = []
        for match in await self._matches_between(date_from, date_to):
            if match.get("status") not in _FOOTBALL_DATA_FINISHED:
                continue
            score = match.get("score") or {}
            full_time = score.get("fullTime") or {}
            half_time = score.get("halfTime") or {}
            home_score = full_time.get("home")
            away_score = full_time.get("away")
            if home_score is None or away_score is None:
                continue
            results.append(
                ResultDTO(
                    provider_fixture_id=str(match["id"]),
                    home_score=int(home_score),
                    away_score=int(away_score),
                    half_time_home_score=(
                        int(half_time["home"]) if half_time.get("home") is not None else None
                    ),
                    half_time_away_score=(
                        int(half_time["away"]) if half_time.get("away") is not None else None
                    ),
                )
            )
        return results

    async def get_fixtures(self, target_date: date) -> list[FixtureDTO]:
        fixtures: list[FixtureDTO] = []
        for match in await self._matches_for_date(target_date):
            status = match.get("status", "")
            if status in _FOOTBALL_DATA_FINISHED:
                continue
            fixtures.append(self._map_match_to_fixture(match))
        return fixtures

    async def get_results(self, target_date: date) -> list[ResultDTO]:
        results: list[ResultDTO] = []
        for match in await self._matches_for_date(target_date):
            if match.get("status") not in _FOOTBALL_DATA_FINISHED:
                continue
            score = match.get("score") or {}
            full_time = score.get("fullTime") or {}
            half_time = score.get("halfTime") or {}
            home_score = full_time.get("home")
            away_score = full_time.get("away")
            if home_score is None or away_score is None:
                continue
            results.append(
                ResultDTO(
                    provider_fixture_id=str(match["id"]),
                    home_score=int(home_score),
                    away_score=int(away_score),
                    half_time_home_score=(
                        int(half_time["home"]) if half_time.get("home") is not None else None
                    ),
                    half_time_away_score=(
                        int(half_time["away"]) if half_time.get("away") is not None else None
                    ),
                )
            )
        return results

    async def get_team_form(self, team_id: str) -> TeamFormDTO:
        if not team_id.isdigit():
            return TeamFormDTO(
                team_name=team_id,
                matches_played=0,
                wins=0,
                draws=0,
                losses=0,
                goals_scored=0,
                goals_conceded=0,
                form_string="",
            )
        data = await self._get(
            f"/teams/{team_id}/matches",
            {"status": "FINISHED", "limit": 5},
        )
        matches = data.get("matches", [])
        outcomes: list[str] = []
        goals_scored = 0
        goals_conceded = 0
        team_id_int = int(team_id)
        for match in matches:
            home = match.get("homeTeam") or {}
            away = match.get("awayTeam") or {}
            full_time = (match.get("score") or {}).get("fullTime") or {}
            home_score = full_time.get("home")
            away_score = full_time.get("away")
            if home_score is None or away_score is None:
                continue
            is_home = home.get("id") == team_id_int
            scored = int(home_score if is_home else away_score)
            conceded = int(away_score if is_home else home_score)
            goals_scored += scored
            goals_conceded += conceded
            if scored > conceded:
                outcomes.append("W")
            elif scored < conceded:
                outcomes.append("L")
            else:
                outcomes.append("D")
        wins = outcomes.count("W")
        draws = outcomes.count("D")
        losses = outcomes.count("L")
        return TeamFormDTO(
            team_name=team_id,
            matches_played=len(outcomes),
            wins=wins,
            draws=draws,
            losses=losses,
            goals_scored=goals_scored,
            goals_conceded=goals_conceded,
            form_string="".join(outcomes),
        )


PROVIDERS: dict[str, type[SportsDataProvider]] = {
    "mock": MockSportsDataProvider,
    "http": HttpSportsDataProvider,
    "football_data_org": FootballDataOrgProvider,
}


def get_sports_data_provider() -> SportsDataProvider:
    provider_cls = PROVIDERS.get(settings.SPORTS_DATA_PROVIDER)
    if provider_cls is None:
        raise ExternalServiceError(
            f"Unknown sports data provider: {settings.SPORTS_DATA_PROVIDER}"
        )
    return provider_cls()
