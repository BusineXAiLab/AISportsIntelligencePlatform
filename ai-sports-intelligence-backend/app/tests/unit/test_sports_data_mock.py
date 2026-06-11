from datetime import date

import pytest

from app.integrations.sports_data_client import MockSportsDataProvider

provider = MockSportsDataProvider()


class TestMockProvider:
    @pytest.mark.asyncio
    async def test_fixtures_are_deterministic(self):
        target = date(2026, 6, 12)
        first = await provider.get_fixtures(target)
        second = await provider.get_fixtures(target)
        assert [f.provider_fixture_id for f in first] == [
            f.provider_fixture_id for f in second
        ]
        assert first, "mock provider should return fixtures"

    @pytest.mark.asyncio
    async def test_results_match_fixtures(self):
        target = date(2026, 6, 12)
        fixtures = await provider.get_fixtures(target)
        results = await provider.get_results(target)
        fixture_ids = {f.provider_fixture_id for f in fixtures}
        assert {r.provider_fixture_id for r in results} == fixture_ids

    @pytest.mark.asyncio
    async def test_team_form_shape(self):
        form = await provider.get_team_form("Manchester City")
        assert form.matches_played == 5
        assert form.wins + form.draws + form.losses == 5
        assert len(form.form_string) == 5
