"""Admin portal aggregations and privileged user management."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.data_feed import DataFeed
from app.models.enums import PredictionStatus, SubscriptionPlan
from app.models.user import User
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.subscription_repository import SubscriptionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.users import AdminUserUpdate
from app.services.audit_service import AuditService


class AdminService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.subscriptions = SubscriptionRepository(db)
        self.predictions = PredictionRepository(db)
        self.analytics = AnalyticsRepository(db)
        self.audit = AuditService(db)

    async def overview(self) -> dict:
        plan_counts = await self.users.count_by_plan()
        prediction_counts = await self.predictions.count_by_status()
        healthy, total_feeds = await self.analytics.data_feed_health()
        return {
            "total_users": await self.users.count_total(),
            "active_users": await self.users.count_active(),
            "free_users": plan_counts.get(SubscriptionPlan.FREE.value, 0),
            "premium_users": plan_counts.get(SubscriptionPlan.PREMIUM.value, 0),
            "elite_users": plan_counts.get(SubscriptionPlan.ELITE.value, 0),
            "active_subscriptions": await self.subscriptions.count_active(),
            "pending_predictions": prediction_counts.get(
                PredictionStatus.PENDING_REVIEW.value, 0
            ),
            "pending_reports": await self.analytics.pending_report_count(),
            "pending_telegram_posts": await self.analytics.pending_telegram_count(),
            "data_feeds_healthy": healthy,
            "data_feeds_total": total_feeds,
        }

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self.users.get(user_id)
        if user is None:
            raise NotFoundError("User not found")
        return user

    async def update_user(self, user_id: uuid.UUID, data: AdminUserUpdate, admin: User
                          ) -> User:
        user = await self.get_user(user_id)
        before = {
            "full_name": user.full_name,
            "role": user.role.value,
            "plan": user.plan.value,
            "is_active": user.is_active,
        }
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.role is not None:
            user.role = data.role
        if data.plan is not None:
            user.plan = data.plan
        if data.is_active is not None:
            user.is_active = data.is_active
        await self.db.flush()
        await self.audit.log_admin_action(
            admin_user_id=admin.id,
            action="user.updated",
            target_type="user",
            target_id=str(user_id),
            before_state=before,
            after_state={
                "full_name": user.full_name,
                "role": user.role.value,
                "plan": user.plan.value,
                "is_active": user.is_active,
            },
        )
        return user

    async def list_data_feeds(self) -> list[DataFeed]:
        result = await self.db.execute(select(DataFeed).order_by(DataFeed.name))
        return list(result.scalars().all())
