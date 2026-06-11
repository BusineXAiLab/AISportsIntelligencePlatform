"""Explanation metadata generation for predictions."""
from dataclasses import dataclass, field

from app.ml.baseline_models import RawModelOutput
from app.ml.features import FeatureVector


@dataclass
class Explanation:
    key_factors: list[str] = field(default_factory=list)
    feature_importance: dict[str, float] = field(default_factory=dict)
    narrative: str = ""


def explain_prediction(features: FeatureVector, output: RawModelOutput) -> Explanation:
    """Produce human-readable key factors plus pseudo feature importances.

    For trained tree models, replace the importance computation with SHAP
    values; the output contract stays the same.
    """
    v = features.values
    factors: list[str] = []

    form_diff = v.get("form_differential", 0.0)
    if form_diff >= 4:
        factors.append("Home side holds a clear recent-form advantage")
    elif form_diff <= -4:
        factors.append("Away side holds a clear recent-form advantage")
    else:
        factors.append("Both sides show comparable recent form")

    if v.get("home_goals_scored_avg", 0) >= 1.8:
        factors.append("Home attack has been scoring above average")
    if v.get("away_goals_conceded_avg", 0) >= 1.6:
        factors.append("Away defence has conceded frequently in recent matches")
    if v.get("away_goals_scored_avg", 0) >= 1.8:
        factors.append("Away attack has been scoring above average")
    if output.btts >= 0.6:
        factors.append("Model signals an elevated likelihood both teams score")
    if output.over_25 >= 0.6:
        factors.append("Model leans toward a higher-scoring match profile")

    factors.append("Home advantage factored into the model output")

    total = sum(abs(x) for x in v.values()) or 1.0
    importance = {name: round(abs(val) / total, 4) for name, val in v.items()}

    top = max(
        ("home win", output.home_win),
        ("draw", output.draw),
        ("away win", output.away_win),
        key=lambda item: item[1],
    )
    narrative = (
        f"Model probability indicates higher likelihood of a {top[0]} "
        f"({top[1]:.0%}) based on recent form, scoring trends and home advantage."
    )

    return Explanation(
        key_factors=factors[:5],
        feature_importance=importance,
        narrative=narrative,
    )
