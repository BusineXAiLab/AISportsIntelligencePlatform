import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select

from app.models.enums import SubscriptionStatus
from app.models.subscription import Subscription, SubscriptionEvent
from app.repositories.base import BaseRepository

ACTIVE_STATUSES = {
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.GRACE_PERIOD,
}


class SubscriptionRepository(BaseRepository[Subscription]):
    model = Subscription

    async def get_active_for_user(self, user_id: uuid.UUID) -> Subscription | None:
        result = await self.db.execute(
            select(Subscription)
            .where(
                Subscription.user_id == user_id,
                Subscription.status.in_(ACTIVE_STATUSES),
            )
            .order_by(Subscription.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_latest_for_user(self, user_id: uuid.UUID) -> Subscription | None:
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .order_by(Subscription.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_by_stripe_id(self, stripe_subscription_id: str) -> Subscription | None:
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == stripe_subscription_id
            )
        )
        return result.scalar_one_or_none()

    async def get_stripe_event(self, stripe_event_id: str) -> SubscriptionEvent | None:
        result = await self.db.execute(
            select(SubscriptionEvent).where(
                SubscriptionEvent.stripe_event_id == stripe_event_id
            )
        )
        return result.scalar_one_or_none()

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count(Subscription.id)).where(
                Subscription.status.in_(ACTIVE_STATUSES)
            )
        )
        return result.scalar_one()

    async def count_by_plan(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Subscription.plan, func.count(Subscription.id))
            .where(Subscription.status.in_(ACTIVE_STATUSES))
            .group_by(Subscription.plan)
        )
        return {plan.value: count for plan, count in result.all()}

    async def list_expired_grace_periods(self) -> list[Subscription]:
        now = datetime.now(UTC)
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.status == SubscriptionStatus.GRACE_PERIOD,
                Subscription.grace_period_ends_at < now,
            )
        )
        return list(result.scalars().all())

    async def monthly_event_counts(self) -> dict[str, int]:
        month_start = datetime.now(UTC).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        result = await self.db.execute(
            select(SubscriptionEvent.event_type, func.count(SubscriptionEvent.id))
            .where(SubscriptionEvent.created_at >= month_start)
            .group_by(SubscriptionEvent.event_type)
        )
        return dict(result.all())

    async def list_needing_sync(self, stale_after_hours: int = 24) -> list[Subscription]:
        cutoff = datetime.now(UTC) - timedelta(hours=stale_after_hours)
        result = await self.db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id.is_not(None),
                Subscription.status.in_(ACTIVE_STATUSES),
                Subscription.updated_at < cutoff,
            )
        )
        return list(result.scalars().all())
