"""Baseline model implementations and trainable-model interfaces.

The MVP ships a heuristic Poisson-style baseline. The interfaces allow
real trained artifacts (LogisticRegression, RandomForest, XGBoost,
LightGBM) to be dropped in later without changing the pipeline.
"""
import math
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.ml.features import FeatureVector


@dataclass
class RawModelOutput:
    home_win: float
    draw: float
    away_win: float
    over_25: float
    btts: float
    correct_score_ranges: dict[str, float] = field(default_factory=dict)


class BaseMatchModel(ABC):
    """Interface every match-outcome model must implement."""

    name: str
    version: str

    @abstractmethod
    def predict_proba(self, features: FeatureVector) -> RawModelOutput: ...


class HeuristicBaselineModel(BaseMatchModel):
    """Form-based Poisson baseline (mvp-baseline-v1).

    Estimates expected goals from recent scoring/conceding averages plus a
    home advantage term, then derives outcome probabilities from
    independent Poisson distributions.
    """

    name = "mvp-baseline"
    version = "mvp-baseline-v1"
    HOME_ADVANTAGE = 0.30
    MAX_GOALS = 6

    @staticmethod
    def _poisson(lam: float, k: int) -> float:
        return math.exp(-lam) * lam**k / math.factorial(k)

    def _expected_goals(self, features: FeatureVector) -> tuple[float, float]:
        v = features.values
        home_attack = v.get("home_goals_scored_avg", 1.2)
        away_attack = v.get("away_goals_scored_avg", 1.0)
        home_defence = v.get("home_goals_conceded_avg", 1.1)
        away_defence = v.get("away_goals_conceded_avg", 1.2)
        form_edge = v.get("form_differential", 0.0) * 0.02

        home_xg = max(0.2, (home_attack + away_defence) / 2 + self.HOME_ADVANTAGE + form_edge)
        away_xg = max(0.2, (away_attack + home_defence) / 2 - form_edge)
        return home_xg, away_xg

    def predict_proba(self, features: FeatureVector) -> RawModelOutput:
        home_xg, away_xg = self._expected_goals(features)
        grid = [
            [self._poisson(home_xg, h) * self._poisson(away_xg, a)
             for a in range(self.MAX_GOALS + 1)]
            for h in range(self.MAX_GOALS + 1)
        ]
        total = sum(sum(row) for row in grid) or 1.0

        home_win = sum(grid[h][a] for h in range(7) for a in range(7) if h > a) / total
        away_win = sum(grid[h][a] for h in range(7) for a in range(7) if h < a) / total
        draw = sum(grid[h][h] for h in range(7)) / total
        over_25 = sum(grid[h][a] for h in range(7) for a in range(7) if h + a >= 3) / total
        btts = sum(grid[h][a] for h in range(1, 7) for a in range(1, 7)) / total

        score_ranges = {
            "low_scoring_0_1_goals": sum(
                grid[h][a] for h in range(7) for a in range(7) if h + a <= 1
            ) / total,
            "moderate_2_3_goals": sum(
                grid[h][a] for h in range(7) for a in range(7) if 2 <= h + a <= 3
            ) / total,
            "high_scoring_4_plus": sum(
                grid[h][a] for h in range(7) for a in range(7) if h + a >= 4
            ) / total,
        }

        return RawModelOutput(
            home_win=home_win, draw=draw, away_win=away_win,
            over_25=over_25, btts=btts,
            correct_score_ranges={k: round(v, 4) for k, v in score_ranges.items()},
        )


class SklearnModelAdapter(BaseMatchModel):
    """Adapter for scikit-learn compatible artifacts (LogisticRegression,
    RandomForest). XGBoost and LightGBM expose the same predict_proba API
    so they plug into this adapter as well."""

    def __init__(self, model, name: str, version: str, feature_names: list[str]) -> None:
        self._model = model
        self.name = name
        self.version = version
        self.feature_names = feature_names

    def predict_proba(self, features: FeatureVector) -> RawModelOutput:
        import numpy as np

        x = np.array([features.as_list(self.feature_names)])
        # Expected class order: [away_win, draw, home_win]
        proba = self._model.predict_proba(x)[0]
        away, draw, home = float(proba[0]), float(proba[1]), float(proba[2])
        # Secondary markets fall back to heuristics until dedicated models exist.
        fallback = HeuristicBaselineModel().predict_proba(features)
        return RawModelOutput(
            home_win=home, draw=draw, away_win=away,
            over_25=fallback.over_25, btts=fallback.btts,
            correct_score_ranges=fallback.correct_score_ranges,
        )
