from datetime import UTC, datetime

import pytest

from app.ml.baseline_models import HeuristicBaselineModel
from app.ml.calibration import (
    apply_shrinkage,
    confidence_level,
    confidence_score,
    normalize_probabilities,
    risk_level,
)
from app.ml.explainability import explain_prediction
from app.ml.features import FEATURE_NAMES_V1, build_feature_vector
from app.ml.model_loader import DEFAULT_MODEL_VERSION, load_model
from app.models.enums import ConfidenceLevel, RiskLevel


def make_features(home_strong: bool = True):
    home_form = {"wins": 4, "draws": 1, "losses": 0, "goals_scored": 12,
                 "goals_conceded": 3, "matches_played": 5}
    away_form = {"wins": 1, "draws": 1, "losses": 3, "goals_scored": 4,
                 "goals_conceded": 9, "matches_played": 5}
    if not home_strong:
        home_form, away_form = away_form, home_form
    return build_feature_vector(
        fixture_id="00000000-0000-0000-0000-000000000001",
        home_form=home_form,
        away_form=away_form,
        input_data_timestamp=datetime.now(UTC),
    )


class TestFeatures:
    def test_feature_vector_has_all_v1_features(self):
        features = make_features()
        assert features.feature_version == "v1"
        for name in FEATURE_NAMES_V1:
            assert name in features.values

    def test_form_differential(self):
        features = make_features()
        assert features.values["form_differential"] == 13 - 4


class TestBaselineModel:
    def test_probabilities_sum_to_one(self):
        model = HeuristicBaselineModel()
        output = normalize_probabilities(model.predict_proba(make_features()))
        total = output.home_win + output.draw + output.away_win
        assert total == pytest.approx(1.0, abs=1e-6)

    def test_stronger_home_side_favoured(self):
        model = HeuristicBaselineModel()
        output = model.predict_proba(make_features(home_strong=True))
        assert output.home_win > output.away_win

    def test_secondary_markets_in_range(self):
        model = HeuristicBaselineModel()
        output = model.predict_proba(make_features())
        assert 0.0 <= output.over_25 <= 1.0
        assert 0.0 <= output.btts <= 1.0
        assert output.correct_score_ranges


class TestCalibration:
    def test_shrinkage_keeps_valid_distribution(self):
        model = HeuristicBaselineModel()
        output = apply_shrinkage(model.predict_proba(make_features()))
        assert output.home_win + output.draw + output.away_win == pytest.approx(1.0, abs=1e-3)

    def test_confidence_and_risk_levels(self):
        model = HeuristicBaselineModel()
        output = apply_shrinkage(model.predict_proba(make_features()))
        score = confidence_score(output)
        assert 0.0 <= score <= 1.0
        assert confidence_level(score) in ConfidenceLevel
        assert risk_level(output, score) in RiskLevel


class TestExplainability:
    def test_explanation_contains_factors_and_narrative(self):
        model = HeuristicBaselineModel()
        features = make_features()
        output = model.predict_proba(features)
        explanation = explain_prediction(features, output)
        assert explanation.key_factors
        assert "likelihood" in explanation.narrative
        assert explanation.feature_importance


class TestModelLoader:
    def test_default_model_loads(self):
        model = load_model(DEFAULT_MODEL_VERSION)
        assert model.version == DEFAULT_MODEL_VERSION

    def test_unknown_version_falls_back(self):
        model = load_model("nonexistent-v99")
        assert model.version == DEFAULT_MODEL_VERSION
