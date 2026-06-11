import uuid
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.accuracy import PredictionAccuracy
from app.models.enums import PredictionStatus
from app.models.match import Fixture
from app.models.model_registry import ModelRegistryEntry
from app.models.prediction import Prediction
from app.repositories.base import BaseRepository

PREDICTION_LOAD_OPTIONS = (
    selectinload(Prediction.fixture).selectinload(Fixture.league),
    selectinload(Prediction.fixture).selectinload(Fixture.home_team),
    selectinload(Prediction.fixture).selectinload(Fixture.away_team),
)

PUBLIC_STATUSES = {PredictionStatus.PUBLISHED, PredictionStatus.SETTLED}


class PredictionRepository(BaseRepository[Prediction]):
    model = Prediction

    async def get_with_fixture(self, prediction_id: uuid.UUID) -> Prediction | None:
        result = await self.db.execute(
            select(Prediction)
            .options(*PREDICTION_LOAD_OPTIONS)
            .where(Prediction.id == prediction_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_for_fixture(
        self, fixture_id: uuid.UUID, public_only: bool = True
    ) -> Prediction | None:
        query = (
            select(Prediction)
            .options(*PREDICTION_LOAD_OPTIONS)
            .where(Prediction.fixture_id == fixture_id)
            .order_by(Prediction.created_at.desc())
            .limit(1)
        )
        if public_only:
            query = query.where(Prediction.status.in_(PUBLIC_STATUSES))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_for_date(self, target_date: date, public_only: bool = True) -> list[Prediction]:
        start = datetime.combine(target_date, time.min, tzinfo=UTC)
        end = start + timedelta(days=1)
        query = (
            select(Prediction)
            .options(*PREDICTION_LOAD_OPTIONS)
            .join(Fixture, Fixture.id == Prediction.fixture_id)
            .where(Fixture.kickoff_time >= start, Fixture.kickoff_time < end)
            .order_by(Fixture.kickoff_time)
        )
        if public_only:
            query = query.where(Prediction.status.in_(PUBLIC_STATUSES))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    def history_query(self, public_only: bool = True):
        query = (
            select(Prediction)
            .options(*PREDICTION_LOAD_OPTIONS)
            .order_by(Prediction.created_at.desc())
        )
        if public_only:
            query = query.where(Prediction.status.in_(PUBLIC_STATUSES))
        return query

    async def list_pending_review(self) -> list[Prediction]:
        result = await self.db.execute(
            select(Prediction)
            .options(*PREDICTION_LOAD_OPTIONS)
            .where(Prediction.status == PredictionStatus.PENDING_REVIEW)
            .order_by(Prediction.created_at)
        )
        return list(result.scalars().all())

    async def list_unsettled_for_fixture(self, fixture_id: uuid.UUID) -> list[Prediction]:
        result = await self.db.execute(
            select(Prediction).where(
                Prediction.fixture_id == fixture_id,
                Prediction.status.in_(
                    [PredictionStatus.PUBLISHED, PredictionStatus.APPROVED]
                ),
            )
        )
        return list(result.scalars().all())

    async def count_by_status(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Prediction.status, func.count(Prediction.id)).group_by(Prediction.status)
        )
        return {status.value: count for status, count in result.all()}

    async def get_active_model(self) -> ModelRegistryEntry | None:
        from app.models.enums import ModelStatus

        result = await self.db.execute(
            select(ModelRegistryEntry)
            .where(ModelRegistryEntry.status == ModelStatus.ACTIVE)
            .order_by(ModelRegistryEntry.activated_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def list_models(self) -> list[ModelRegistryEntry]:
        result = await self.db.execute(
            select(ModelRegistryEntry).order_by(ModelRegistryEntry.created_at.desc())
        )
        return list(result.scalars().all())

    async def accuracy_rows(self, model_version: str | None = None) -> list[PredictionAccuracy]:
        query = select(PredictionAccuracy)
        if model_version:
            query = query.where(PredictionAccuracy.model_version == model_version)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def has_settlement(self, prediction_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(func.count(PredictionAccuracy.id)).where(
                PredictionAccuracy.prediction_id == prediction_id
            )
        )
        return result.scalar_one() > 0
