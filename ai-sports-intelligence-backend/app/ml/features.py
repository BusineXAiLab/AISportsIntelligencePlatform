"""Feature engineering for match outcome prediction."""
from dataclasses import dataclass, field
from datetime import UTC, datetime


@dataclass
class FeatureVector:
    """Versioned feature vector for a single fixture."""

    fixture_id: str
    feature_version: str
    input_data_timestamp: datetime
    values: dict[str, float] = field(default_factory=dict)

    def as_list(self, feature_names: list[str]) -> list[float]:
        return [self.values.get(name, 0.0) for name in feature_names]


FEATURE_NAMES_V1 = [
    "home_form_points",       # points from last 5 matches (0-15)
    "away_form_points",
    "home_goals_scored_avg",
    "away_goals_scored_avg",
    "home_goals_conceded_avg",
    "away_goals_conceded_avg",
    "home_advantage",         # constant 1.0 placeholder for home edge
    "form_differential",      # home_form_points - away_form_points
]


def build_feature_vector(
    fixture_id: str,
    home_form: dict,
    away_form: dict,
    input_data_timestamp: datetime | None = None,
) -> FeatureVector:
    """Build a v1 feature vector from team form summaries.

    `home_form`/`away_form` are dicts with wins, draws, losses,
    goals_scored, goals_conceded and matches_played keys.
    """
    def points(form: dict) -> float:
        return form.get("wins", 0) * 3 + form.get("draws", 0)

    def avg(form: dict, key: str) -> float:
        played = max(form.get("matches_played", 0), 1)
        return form.get(key, 0) / played

    home_points = points(home_form)
    away_points = points(away_form)

    return FeatureVector(
        fixture_id=fixture_id,
        feature_version="v1",
        input_data_timestamp=input_data_timestamp or datetime.now(UTC),
        values={
            "home_form_points": home_points,
            "away_form_points": away_points,
            "home_goals_scored_avg": avg(home_form, "goals_scored"),
            "away_goals_scored_avg": avg(away_form, "goals_scored"),
            "home_goals_conceded_avg": avg(home_form, "goals_conceded"),
            "away_goals_conceded_avg": avg(away_form, "goals_conceded"),
            "home_advantage": 1.0,
            "form_differential": home_points - away_points,
        },
    )
