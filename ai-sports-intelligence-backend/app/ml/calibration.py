"""Probability calibration, confidence and risk scoring."""
from app.ml.baseline_models import RawModelOutput
from app.models.enums import ConfidenceLevel, RiskLevel


def normalize_probabilities(output: RawModelOutput) -> RawModelOutput:
    """Ensure the 1X2 probabilities sum to exactly 1.0."""
    total = output.home_win + output.draw + output.away_win
    if total <= 0:
        output.home_win, output.draw, output.away_win = 1 / 3, 1 / 3, 1 / 3
        return output
    output.home_win = round(output.home_win / total, 4)
    output.draw = round(output.draw / total, 4)
    output.away_win = round(1.0 - output.home_win - output.draw, 4)
    output.over_25 = round(min(max(output.over_25, 0.0), 1.0), 4)
    output.btts = round(min(max(output.btts, 0.0), 1.0), 4)
    return output


def apply_shrinkage(output: RawModelOutput, factor: float = 0.10) -> RawModelOutput:
    """Shrink probabilities toward uniform to counter baseline overconfidence.

    Replace with isotonic/Platt calibration once enough settled
    predictions exist to fit a calibrator.
    """
    uniform = 1 / 3
    output.home_win = output.home_win * (1 - factor) + uniform * factor
    output.draw = output.draw * (1 - factor) + uniform * factor
    output.away_win = output.away_win * (1 - factor) + uniform * factor
    output.over_25 = output.over_25 * (1 - factor) + 0.5 * factor
    output.btts = output.btts * (1 - factor) + 0.5 * factor
    return normalize_probabilities(output)


def confidence_score(output: RawModelOutput) -> float:
    """Confidence in [0, 1]: margin between the top outcome and the rest."""
    probs = sorted([output.home_win, output.draw, output.away_win], reverse=True)
    margin = probs[0] - probs[1]
    return round(min(max(probs[0] * 0.5 + margin * 1.5, 0.0), 1.0), 4)


def confidence_level(score: float) -> ConfidenceLevel:
    if score >= 0.55:
        return ConfidenceLevel.HIGH
    if score >= 0.35:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


def risk_level(output: RawModelOutput, score: float) -> RiskLevel:
    top = max(output.home_win, output.draw, output.away_win)
    if top >= 0.60 and score >= 0.50:
        return RiskLevel.LOW
    if top >= 0.45:
        return RiskLevel.MEDIUM
    return RiskLevel.HIGH
