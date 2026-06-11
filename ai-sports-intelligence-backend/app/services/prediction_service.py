"""Prediction retrieval, generation orchestration and review workflow."""
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.core.logging import get_logger
from app.ml.model_loader import DEFAULT_MODEL_VERSION
from app.ml.prediction_pipeline import PredictionPipeline
from app.models.enums import PredictionStatus, SubscriptionPlan
from app.models.prediction import Prediction
from app.models.user import User
from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.services.audit_service import AuditService
from app.services.entitlement_service import EntitlementService

logger = get_logger(__name__)


class PredictionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.predictions = PredictionRepository(db)
        self.matches = MatchRepository(db)
        self.audit = AuditService(db)
        self.entitlements = EntitlementService(db)

    @staticmethod
    def to_match_payload(prediction: Prediction) -> dict:
        fixture = prediction.fixture
        return {
            **{c: getattr(prediction, c) for c in (
                "id", "fixture_id", "model_version", "status",
                "home_win_probability", "draw_probability", "away_win_probability",
                "over_25_probability", "under_25_probability",
                "both_teams_to_score_probability", "correct_score_probability_ranges",
                "confidence_score", "confidence_level", "risk_level",
                "key_factors", "explanation", "feature_snapshot_id",
                "input_data_timestamp", "published_at", "created_at", "updated_at",
            )},
            "league": fixture.league.name,
            "kickoff_time": fixture.kickoff_time,
            "home_team": fixture.home_team.name,
            "away_team": fixture.away_team.name,
        }

    async def redact_for_plan(self, user: User | None, payload: dict) -> dict:
        """Free users see headline probabilities only; premium insight is gated."""
        is_premium = user is not None and await self.entitlements.has_plan(
            user, SubscriptionPlan.PREMIUM
        )
        if is_premium:
            return payload
        redacted = dict(payload)
        for field in (
            "correct_score_probability_ranges",
            "key_factors",
            "explanation",
            "both_teams_to_score_probability",
            "over_25_probability",
            "under_25_probability",
        ):
            redacted[field] = None
        return redacted

    async def get_today(self) -> list[Prediction]:
        return await self.predictions.list_for_date(datetime.now(UTC).date())

    async def get_for_match(self, match_id: uuid.UUID, public_only: bool = True) -> Prediction:
        prediction = await self.predictions.get_latest_for_fixture(
            match_id, public_only=public_only
        )
        if prediction is None:
            raise NotFoundError("No prediction available for this match")
        return prediction

    async def generate_for_fixture(
        self, fixture_id: uuid.UUID, model_version: str = DEFAULT_MODEL_VERSION
    ) -> Prediction:
        fixture = await self.matches.get_with_relations(fixture_id)
        if fixture is None:
            raise NotFoundError("Match not found")
        existing = await self.predictions.get_latest_for_fixture(fixture_id, public_only=False)
        if existing is not None and existing.status not in (
            PredictionStatus.REJECTED,
        ):
            raise ConflictError("A prediction already exists for this match")
        pipeline = PredictionPipeline(self.db, model_version=model_version)
        return await pipeline.run(fixture)

    async def approve(self, prediction_id: uuid.UUID, admin: User, note: str | None = None
                      ) -> Prediction:
        prediction = await self.predictions.get_with_fixture(prediction_id)
        if prediction is None:
            raise NotFoundError("Prediction not found")
        if prediction.status != PredictionStatus.PENDING_REVIEW:
            raise ConflictError("Prediction is not pending review")
        now = datetime.now(UTC)
        prediction.status = PredictionStatus.PUBLISHED
        prediction.reviewed_by = admin.id
        prediction.reviewed_at = now
        prediction.review_note = note
        prediction.published_at = now
        await self.audit.log_admin_action(
            admin_user_id=admin.id,
            action="prediction.approved",
            target_type="prediction",
            target_id=str(prediction_id),
            note=note,
        )
        return prediction

    async def reject(self, prediction_id: uuid.UUID, admin: User, note: str | None = None
                     ) -> Prediction:
        prediction = await self.predictions.get_with_fixture(prediction_id)
        if prediction is None:
            raise NotFoundError("Prediction not found")
        if prediction.status != PredictionStatus.PENDING_REVIEW:
            raise ConflictError("Prediction is not pending review")
        prediction.status = PredictionStatus.REJECTED
        prediction.reviewed_by = admin.id
        prediction.reviewed_at = datetime.now(UTC)
        prediction.review_note = note
        await self.audit.log_admin_action(
            admin_user_id=admin.id,
            action="prediction.rejected",
            target_type="prediction",
            target_id=str(prediction_id),
            note=note,
        )
        return prediction

    async def model_status(self) -> list[dict]:
        models = await self.predictions.list_models()
        if not models:
            return [
                {
                    "name": "mvp-baseline",
                    "version": DEFAULT_MODEL_VERSION,
                    "model_type": "heuristic_poisson",
                    "status": "ACTIVE",
                    "activated_at": None,
                    "metrics": None,
                }
            ]
        return [
            {
                "name": m.name,
                "version": m.version,
                "model_type": m.model_type,
                "status": m.status.value,
                "activated_at": m.activated_at,
                "metrics": m.metrics,
            }
            for m in models
        ]
