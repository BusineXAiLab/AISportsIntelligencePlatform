"""Ingestion -> prediction generation -> approval -> public retrieval."""
from datetime import UTC, datetime, timedelta

import pytest

from app.models.enums import PredictionStatus, UserRole
from app.tests.conftest import requires_database

pytestmark = [requires_database, pytest.mark.asyncio]


async def _create_admin(db_session):
    from app.core.security import hash_password
    from app.models.user import User

    admin = User(
        email="admin-test@example.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Test Admin",
        role=UserRole.SUPER_ADMIN,
        is_email_verified=True,
    )
    db_session.add(admin)
    await db_session.commit()
    return admin


class TestPredictionFlow:
    async def test_ingest_generate_approve(self, db_session):
        from app.services.prediction_service import PredictionService
        from app.services.sports_data_service import SportsDataService

        admin = await _create_admin(db_session)

        # Ingest mock fixtures for tomorrow
        tomorrow = (datetime.now(UTC) + timedelta(days=1)).date()
        created = await SportsDataService(db_session).ingest_fixtures(tomorrow)
        await db_session.commit()
        assert created > 0

        # Pick one fixture and generate a prediction
        from app.repositories.match_repository import MatchRepository

        fixtures = await MatchRepository(db_session).list_for_date(tomorrow)
        assert fixtures
        fixture = fixtures[0]

        service = PredictionService(db_session)
        prediction = await service.generate_for_fixture(fixture.id)
        await db_session.commit()

        assert prediction.status == PredictionStatus.PENDING_REVIEW
        assert prediction.model_version == "mvp-baseline-v1"
        assert prediction.input_data_timestamp is not None
        assert prediction.feature_snapshot_id is not None
        total = (
            prediction.home_win_probability
            + prediction.draw_probability
            + prediction.away_win_probability
        )
        assert total == pytest.approx(1.0, abs=1e-3)

        # Approve and verify it becomes publicly visible
        approved = await service.approve(prediction.id, admin)
        await db_session.commit()
        assert approved.status == PredictionStatus.PUBLISHED

        public = await service.get_for_match(fixture.id)
        assert public.id == prediction.id
