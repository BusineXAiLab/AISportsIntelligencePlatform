"""Unit tests for the football-data.org sports data provider."""
from datetime import date
from unittest.mock import AsyncMock, patch

import pytest

from app.integrations.sports_data_client import FootballDataOrgProvider

SAMPLE_MATCHES_RESPONSE = {
    "matches": [
        {
            "id": 1001,
            "utcDate": "2026-06-12T15:00:00Z",
            "status": "TIMED",
            "homeTeam": {"id": 57, "name": "Arsenal FC"},
            "awayTeam": {"id": 61, "name": "Chelsea FC"},
            "competition": {"id": 2021, "name": "Premier League", "code": "PL"},
            "area": {"name": "England"},
            "venue": "Emirates Stadium",
            "referees": [{"name": "M. Oliver"}],
            "score": {
                "fullTime": {"home": None, "away": None},
                "halfTime": {"home": None, "away": None},
            },
        },
        {
            "id": 1002,
            "utcDate": "2026-06-12T17:30:00Z",
            "status": "FINISHED",
            "homeTeam": {"id": 64, "name": "Liverpool FC"},
            "awayTeam": {"id": 65, "name": "Manchester City FC"},
            "competition": {"id": 2021, "name": "Premier League", "code": "PL"},
            "area": {"name": "England"},
            "score": {
                "fullTime": {"home": 2, "away": 1},
                "halfTime": {"home": 1, "away": 0},
            },
        },
    ]
}

TEAM_MATCHES_RESPONSE = {
    "matches": [
        {
            "homeTeam": {"id": 57},
            "awayTeam": {"id": 99},
            "score": {"fullTime": {"home": 2, "away": 0}},
        },
        {
            "homeTeam": {"id": 88},
            "awayTeam": {"id": 57},
            "score": {"fullTime": {"home": 1, "away": 1}},
        },
        {
            "homeTeam": {"id": 57},
            "awayTeam": {"id": 77},
            "score": {"fullTime": {"home": 0, "away": 1}},
        },
    ]
}


@pytest.fixture
def provider() -> FootballDataOrgProvider:
    with patch("app.integrations.sports_data_client.settings") as mock_settings:
        mock_settings.SPORTS_DATA_API_KEY = "test-token"
        mock_settings.SPORTS_DATA_BASE_URL = "https://api.football-data.org/v4"
        return FootballDataOrgProvider()


class TestFootballDataOrgProvider:
    @pytest.mark.asyncio
    async def test_get_fixtures_excludes_finished(self, provider: FootballDataOrgProvider):
        provider._get = AsyncMock(return_value=SAMPLE_MATCHES_RESPONSE)  # type: ignore[method-assign]
        fixtures = await provider.get_fixtures(date(2026, 6, 12))
        assert len(fixtures) == 1
        assert fixtures[0].provider_fixture_id == "1001"
        assert fixtures[0].league_code == "PL"
        assert fixtures[0].home_team_provider_id == "57"

    @pytest.mark.asyncio
    async def test_get_results_includes_finished_only(self, provider: FootballDataOrgProvider):
        provider._get = AsyncMock(return_value=SAMPLE_MATCHES_RESPONSE)  # type: ignore[method-assign]
        results = await provider.get_results(date(2026, 6, 12))
        assert len(results) == 1
        assert results[0].provider_fixture_id == "1002"
        assert results[0].home_score == 2
        assert results[0].away_score == 1

    @pytest.mark.asyncio
    async def test_get_team_form_from_recent_matches(self, provider: FootballDataOrgProvider):
        provider._get = AsyncMock(return_value=TEAM_MATCHES_RESPONSE)  # type: ignore[method-assign]
        form = await provider.get_team_form("57")
        assert form.matches_played == 3
        assert form.wins == 1
        assert form.draws == 1
        assert form.losses == 1
        assert form.form_string == "WDL"

    @pytest.mark.asyncio
    async def test_get_team_form_with_name_returns_empty(self, provider: FootballDataOrgProvider):
        form = await provider.get_team_form("Arsenal FC")
        assert form.matches_played == 0
        assert form.form_string == ""
