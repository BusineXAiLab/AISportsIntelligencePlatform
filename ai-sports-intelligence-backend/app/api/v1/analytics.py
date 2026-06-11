from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import require_admin
from app.models.accuracy import PredictionAccuracy
from app.models.enums import PredictionStatus, SubscriptionPlan
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.repositories.telegram_repository import TelegramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.analytics import (
    BusinessAnalytics,
    ModelAccuracyAnalytics,
    PredictionAnalytics,
    SubscriptionAnalytics,
    TelegramAnalytics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

PLAN_PRICES = {SubscriptionPlan.PREMIUM.value: 19.99, SubscriptionPlan.ELITE.value: 49.99}


@router.get("/business", response_model=BusinessAnalytics)
async def business_analytics(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> BusinessAnalytics:
    users = UserRepository(db)
    plan_counts = await users.count_by_plan()
    total = await users.count_total()
    free = plan_counts.get(SubscriptionPlan.FREE.value, 0)
    premium = plan_counts.get(SubscriptionPlan.PREMIUM.value, 0)
    elite = plan_counts.get(SubscriptionPlan.ELITE.value, 0)
    paid = premium + elite
    return BusinessAnalytics(
        total_users=total,
        active_users=await users.count_active(),
        free_users=free,
        premium_users=premium,
        elite_users=elite,
        conversion_rate_pct=round(100.0 * paid / total, 2) if total else 0.0,
        mrr_usd=round(
            premium * PLAN_PRICES[SubscriptionPlan.PREMIUM.value]
            + elite * PLAN_PRICES[SubscriptionPlan.ELITE.value],
            2,
        ),
    )


@router.get("/subscriptions", response_model=SubscriptionAnalytics)
async def subscription_analytics(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> SubscriptionAnalytics:
    subs = SubscriptionRepository(db)
    active = await subs.count_active()
    events = await subs.monthly_event_counts()
    new_this_month = events.get("customer.subscription.created", 0) + events.get(
        "checkout.session.completed", 0
    )
    canceled = events.get("customer.subscription.deleted", 0)
    failures = events.get("invoice.payment_failed", 0)
    return SubscriptionAnalytics(
        active_subscriptions=active,
        new_this_month=new_this_month,
        canceled_this_month=canceled,
        churn_rate_pct=round(100.0 * canceled / active, 2) if active else 0.0,
        renewal_failures=failures,
        by_plan=await subs.count_by_plan(),
    )


@router.get("/predictions", response_model=PredictionAnalytics)
async def prediction_analytics(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> PredictionAnalytics:
    counts = await PredictionRepository(db).count_by_status()
    return PredictionAnalytics(
        total_predictions=sum(counts.values()),
        published_predictions=counts.get(PredictionStatus.PUBLISHED.value, 0),
        settled_predictions=counts.get(PredictionStatus.SETTLED.value, 0),
        pending_review=counts.get(PredictionStatus.PENDING_REVIEW.value, 0),
        by_status=counts,
    )


@router.get("/model-accuracy", response_model=ModelAccuracyAnalytics)
async def model_accuracy_analytics(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> ModelAccuracyAnalytics:
    analytics = AnalyticsRepository(db)
    total, correct, avg_brier = await analytics.overall_accuracy()
    return ModelAccuracyAnalytics(
        overall_accuracy_pct=round(100.0 * correct / total, 2) if total else 0.0,
        total_settled=total,
        by_league=await analytics.accuracy_by_dimension(PredictionAccuracy.league_code),
        by_market=await analytics.accuracy_by_dimension(PredictionAccuracy.market),
        by_model_version=await analytics.accuracy_by_dimension(
            PredictionAccuracy.model_version
        ),
        average_brier_score=avg_brier,
        confidence_calibration=await analytics.confidence_calibration(),
    )


@router.get("/telegram", response_model=TelegramAnalytics)
async def telegram_analytics(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> TelegramAnalytics:
    telegram = TelegramRepository(db)
    stats = await telegram.message_stats()
    sent = stats.get("SENT", 0)
    failed = stats.get("FAILED", 0)
    attempted = sent + failed
    return TelegramAnalytics(
        connected_accounts=await telegram.count_connected(),
        vip_active_accounts=await telegram.count_vip_active(),
        messages_sent=sent,
        messages_failed=failed,
        delivery_success_rate_pct=(
            round(100.0 * sent / attempted, 2) if attempted else 100.0
        ),
        engagement_placeholder={"views": None, "reactions": None},
    )
