"""End-to-end prediction pipeline: features -> predict -> calibrate -> explain -> save."""
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.integrations.sports_data_client import get_sports_data_provider
from app.ml.baseline_models import RawModelOutput
from app.ml.calibration import (
    apply_shrinkage,
    confidence_level,
    confidence_score,
    normalize_probabilities,
    risk_level,
)
from app.ml.explainability import Explanation, explain_prediction
from app.ml.features import FeatureVector, build_feature_vector
from app.ml.model_loader import DEFAULT_MODEL_VERSION, load_model
from app.models.enums import PredictionStatus
from app.models.match import Fixture
from app.models.prediction import Prediction, PredictionFeatureSnapshot

logger = get_logger(__name__)


@dataclass
class PredictionOutput:
    fixture_id: str
    model_version: str
    raw: RawModelOutput
    confidence_score: float = 0.0
    explanation: Explanation | None = None


class PredictionPipeline:
    def __init__(self, db: AsyncSession, model_version: str = DEFAULT_MODEL_VERSION) -> None:
        self.db = db
        self.model_version = model_version
        self.model = load_model(model_version)
        self.provider = get_sports_data_provider()

    async def build_features(self, fixture: Fixture) -> FeatureVector:
        home_key = fixture.home_team.provider_team_id or fixture.home_team.name
        away_key = fixture.away_team.provider_team_id or fixture.away_team.name
        home_form = await self.provider.get_team_form(home_key)
        away_form = await self.provider.get_team_form(away_key)
        return build_feature_vector(
            fixture_id=str(fixture.id),
            home_form=home_form.__dict__,
            away_form=away_form.__dict__,
        )

    def predict(self, features: FeatureVector) -> PredictionOutput:
        raw = self.model.predict_proba(features)
        return PredictionOutput(
            fixture_id=features.fixture_id,
            model_version=self.model.version,
            raw=normalize_probabilities(raw),
        )

    def calibrate(self, output: PredictionOutput) -> PredictionOutput:
        output.raw = apply_shrinkage(output.raw)
        output.confidence_score = confidence_score(output.raw)
        return output

    def explain(self, features: FeatureVector, output: PredictionOutput) -> Explanation:
        explanation = explain_prediction(features, output.raw)
        output.explanation = explanation
        return explanation

    async def save_prediction(
        self,
        features: FeatureVector,
        output: PredictionOutput,
        status: PredictionStatus = PredictionStatus.PENDING_REVIEW,
    ) -> Prediction:
        snapshot = PredictionFeatureSnapshot(
            fixture_id=uuid.UUID(features.fixture_id),
            features=features.values,
            feature_version=features.feature_version,
            input_data_timestamp=features.input_data_timestamp,
        )
        self.db.add(snapshot)
        await self.db.flush()

        score = output.confidence_score
        prediction = Prediction(
            fixture_id=uuid.UUID(output.fixture_id),
            model_version=output.model_version,
            status=status,
            home_win_probability=output.raw.home_win,
            draw_probability=output.raw.draw,
            away_win_probability=output.raw.away_win,
            over_25_probability=output.raw.over_25,
            under_25_probability=round(1.0 - output.raw.over_25, 4),
            both_teams_to_score_probability=output.raw.btts,
            correct_score_probability_ranges=output.raw.correct_score_ranges,
            confidence_score=score,
            confidence_level=confidence_level(score),
            risk_level=risk_level(output.raw, score),
            key_factors=output.explanation.key_factors if output.explanation else None,
            explanation={
                "narrative": output.explanation.narrative,
                "feature_importance": output.explanation.feature_importance,
            }
            if output.explanation
            else None,
            feature_snapshot_id=snapshot.id,
            input_data_timestamp=features.input_data_timestamp,
        )
        self.db.add(prediction)
        await self.db.flush()
        logger.info(
            "prediction_saved",
            fixture_id=output.fixture_id,
            model_version=output.model_version,
            confidence=score,
        )
        return prediction

    async def run(self, fixture: Fixture) -> Prediction:
        """Execute the full pipeline for one fixture."""
        features = await self.build_features(fixture)
        output = self.predict(features)
        output = self.calibrate(output)
        self.explain(features, output)
        return await self.save_prediction(features, output)


def utcnow() -> datetime:
    return datetime.now(UTC)
