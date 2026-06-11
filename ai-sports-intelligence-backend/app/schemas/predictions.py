import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import ConfidenceLevel, PredictionStatus, RiskLevel
from app.schemas.common import IDTimestamped


class PredictionRead(IDTimestamped):
    fixture_id: uuid.UUID
    model_version: str
    status: PredictionStatus
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    over_25_probability: float | None
    under_25_probability: float | None
    both_teams_to_score_probability: float | None
    correct_score_probability_ranges: dict | None
    confidence_score: float
    confidence_level: ConfidenceLevel
    risk_level: RiskLevel
    key_factors: list | None
    explanation: dict | None
    feature_snapshot_id: uuid.UUID | None
    input_data_timestamp: datetime
    published_at: datetime | None


class PredictionWithMatch(PredictionRead):
    league: str
    kickoff_time: datetime
    home_team: str
    away_team: str


class AccuracySummary(BaseModel):
    total_settled: int
    correct: int
    accuracy_pct: float
    average_brier_score: float | None = None
    by_market: dict[str, float] = {}
    by_league: dict[str, float] = {}
    model_version: str | None = None


class ModelStatusInfo(BaseModel):
    name: str
    version: str
    model_type: str
    status: str
    activated_at: datetime | None = None
    metrics: dict | None = None


class PredictionReviewRequest(BaseModel):
    note: str | None = None
