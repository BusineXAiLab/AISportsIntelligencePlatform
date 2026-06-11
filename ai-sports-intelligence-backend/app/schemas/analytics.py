from pydantic import BaseModel


class BusinessAnalytics(BaseModel):
    total_users: int
    active_users: int
    free_users: int
    premium_users: int
    elite_users: int
    conversion_rate_pct: float
    mrr_usd: float


class SubscriptionAnalytics(BaseModel):
    active_subscriptions: int
    new_this_month: int
    canceled_this_month: int
    churn_rate_pct: float
    renewal_failures: int
    by_plan: dict[str, int]


class PredictionAnalytics(BaseModel):
    total_predictions: int
    published_predictions: int
    settled_predictions: int
    pending_review: int
    by_status: dict[str, int]


class ModelAccuracyAnalytics(BaseModel):
    overall_accuracy_pct: float
    total_settled: int
    by_league: dict[str, float]
    by_market: dict[str, float]
    by_model_version: dict[str, float]
    average_brier_score: float | None = None
    confidence_calibration: list[dict] = []


class TelegramAnalytics(BaseModel):
    connected_accounts: int
    vip_active_accounts: int
    messages_sent: int
    messages_failed: int
    delivery_success_rate_pct: float
    engagement_placeholder: dict = {}
