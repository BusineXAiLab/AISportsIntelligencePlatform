"""Entitlement checks tying features to subscription plans."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import SubscriptionPlan, UserRole
from app.models.user import User
from app.repositories.subscription_repository import SubscriptionRepository

PLAN_RANK = {SubscriptionPlan.FREE: 0, SubscriptionPlan.PREMIUM: 1, SubscriptionPlan.ELITE: 2}

ADMIN_ROLES = {UserRole.CONTENT_LEAD, UserRole.ADMIN, UserRole.SUPER_ADMIN}


class EntitlementService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.subscriptions = SubscriptionRepository(db)

    async def effective_plan(self, user: User) -> SubscriptionPlan:
        """The plan a user is entitled to right now.

        Admin roles get Elite-level access. Otherwise the active
        subscription is authoritative; the denormalised user.plan column is
        the fallback (kept in sync by the Stripe webhook handler).
        """
        if user.role in ADMIN_ROLES:
            return SubscriptionPlan.ELITE
        subscription = await self.subscriptions.get_active_for_user(user.id)
        if subscription is not None:
            return subscription.plan
        return SubscriptionPlan.FREE

    async def has_plan(self, user: User, minimum_plan: SubscriptionPlan) -> bool:
        effective = await self.effective_plan(user)
        return PLAN_RANK[effective] >= PLAN_RANK[minimum_plan]

    async def has_vip_telegram_access(self, user: User) -> bool:
        return await self.has_plan(user, SubscriptionPlan.PREMIUM)
