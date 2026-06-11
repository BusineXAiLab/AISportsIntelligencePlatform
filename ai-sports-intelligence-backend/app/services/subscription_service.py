"""Subscription lifecycle: checkout, webhooks, cancel/reactivate, status sync."""
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationAppError
from app.core.logging import get_logger
from app.integrations.stripe_client import StripeClient, stripe_client
from app.models.enums import (
    BillingInterval,
    SubscriptionPlan,
    SubscriptionStatus,
    UserRole,
)
from app.models.subscription import Subscription, SubscriptionEvent
from app.models.user import User
from app.repositories.subscription_repository import ACTIVE_STATUSES, SubscriptionRepository
from app.repositories.user_repository import UserRepository

logger = get_logger(__name__)

GRACE_PERIOD_DAYS = 3

PLANS = [
    {
        "plan": SubscriptionPlan.FREE,
        "name": "Free",
        "monthly_price_usd": 0.0,
        "annual_price_usd": 0.0,
        "features": [
            "Daily free predictions",
            "Public Telegram channel",
            "Basic match data",
        ],
    },
    {
        "plan": SubscriptionPlan.PREMIUM,
        "name": "Premium",
        "monthly_price_usd": 19.99,
        "annual_price_usd": 199.99,
        "features": [
            "All free features",
            "Full prediction insights with confidence and risk levels",
            "VIP Telegram channel",
            "Daily intelligence reports",
            "Prediction accuracy history",
        ],
    },
    {
        "plan": SubscriptionPlan.ELITE,
        "name": "Elite",
        "monthly_price_usd": 49.99,
        "annual_price_usd": 499.99,
        "features": [
            "All premium features",
            "Long-form premium reports",
            "Personalized reports",
            "Early access to model upgrades",
            "Priority support",
        ],
    },
]

STRIPE_STATUS_MAP = {
    "active": SubscriptionStatus.ACTIVE,
    "trialing": SubscriptionStatus.TRIALING,
    "past_due": SubscriptionStatus.PAST_DUE,
    "canceled": SubscriptionStatus.CANCELED,
    "unpaid": SubscriptionStatus.EXPIRED,
    "incomplete": SubscriptionStatus.INCOMPLETE,
    "incomplete_expired": SubscriptionStatus.EXPIRED,
}

ROLE_FOR_PLAN = {
    SubscriptionPlan.FREE: UserRole.FREE_USER,
    SubscriptionPlan.PREMIUM: UserRole.PREMIUM_USER,
    SubscriptionPlan.ELITE: UserRole.ELITE_USER,
}


class SubscriptionService:
    def __init__(self, db: AsyncSession, stripe: StripeClient | None = None) -> None:
        self.db = db
        self.stripe = stripe or stripe_client
        self.subscriptions = SubscriptionRepository(db)
        self.users = UserRepository(db)

    def list_plans(self) -> list[dict]:
        return PLANS

    async def get_status(self, user: User) -> dict:
        subscription = await self.subscriptions.get_active_for_user(user.id)
        if subscription is None:
            return {
                "plan": SubscriptionPlan.FREE,
                "status": None,
                "is_active": False,
                "current_period_end": None,
                "cancel_at_period_end": False,
            }
        return {
            "plan": subscription.plan,
            "status": subscription.status,
            "is_active": subscription.status in ACTIVE_STATUSES,
            "current_period_end": subscription.current_period_end,
            "cancel_at_period_end": subscription.cancel_at_period_end,
        }

    async def create_checkout_session(
        self,
        user: User,
        plan: SubscriptionPlan,
        billing_interval: BillingInterval,
        success_url: str,
        cancel_url: str,
    ) -> dict[str, str]:
        if plan == SubscriptionPlan.FREE:
            raise ValidationAppError("The free plan does not require checkout")
        if user.stripe_customer_id is None:
            user.stripe_customer_id = await self.stripe.create_customer(
                user.email, user.full_name, str(user.id)
            )
            await self.db.flush()
        price_id = self.stripe.price_id_for(plan, billing_interval)
        return await self.stripe.create_checkout_session(
            customer_id=user.stripe_customer_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            user_id=str(user.id),
        )

    async def create_portal_session(self, user: User, return_url: str) -> str:
        if user.stripe_customer_id is None:
            raise NotFoundError("No billing profile found for this user")
        return await self.stripe.create_portal_session(user.stripe_customer_id, return_url)

    async def cancel(self, user: User) -> Subscription:
        subscription = await self.subscriptions.get_active_for_user(user.id)
        if subscription is None or subscription.stripe_subscription_id is None:
            raise NotFoundError("No active subscription to cancel")
        await self.stripe.cancel_subscription(subscription.stripe_subscription_id)
        subscription.cancel_at_period_end = True
        await self._record_event(subscription, "subscription.cancel_requested")
        return subscription

    async def reactivate(self, user: User) -> Subscription:
        subscription = await self.subscriptions.get_latest_for_user(user.id)
        if subscription is None or subscription.stripe_subscription_id is None:
            raise NotFoundError("No subscription to reactivate")
        if not subscription.cancel_at_period_end:
            raise ValidationAppError("Subscription is not pending cancellation")
        await self.stripe.reactivate_subscription(subscription.stripe_subscription_id)
        subscription.cancel_at_period_end = False
        await self._record_event(subscription, "subscription.reactivated")
        return subscription

    # ------------------------------------------------------------------ #
    # Stripe webhook handling
    # ------------------------------------------------------------------ #

    async def handle_webhook_event(self, event: dict[str, Any]) -> None:
        event_id = event.get("id", "")
        event_type = event.get("event_type") or event.get("type", "")

        if event_id and await self.subscriptions.get_stripe_event(event_id):
            logger.info("stripe_event_duplicate_skipped", event_id=event_id)
            return

        handlers = {
            "checkout.session.completed": self._on_checkout_completed,
            "customer.subscription.created": self._on_subscription_updated,
            "customer.subscription.updated": self._on_subscription_updated,
            "customer.subscription.deleted": self._on_subscription_deleted,
            "invoice.payment_failed": self._on_payment_failed,
            "invoice.payment_succeeded": self._on_payment_succeeded,
        }
        handler = handlers.get(event_type)
        subscription = None
        if handler is not None:
            subscription = await handler(event["data"]["object"])
        else:
            logger.info("stripe_event_ignored", event_type=event_type)

        self.db.add(
            SubscriptionEvent(
                subscription_id=subscription.id if subscription else None,
                user_id=subscription.user_id if subscription else None,
                event_type=event_type,
                stripe_event_id=event_id or None,
                payload={"object_id": event["data"]["object"].get("id")},
            )
        )
        await self.db.flush()

    def _plan_from_price(self, price_id: str | None) -> SubscriptionPlan:
        from app.core.config import settings

        if price_id in (settings.STRIPE_ELITE_PRICE_ID, settings.STRIPE_ELITE_ANNUAL_PRICE_ID):
            return SubscriptionPlan.ELITE
        return SubscriptionPlan.PREMIUM

    def _interval_from_price(self, price_id: str | None) -> BillingInterval:
        from app.core.config import settings

        if price_id in (
            settings.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
            settings.STRIPE_ELITE_ANNUAL_PRICE_ID,
        ):
            return BillingInterval.ANNUAL
        return BillingInterval.MONTHLY

    async def _sync_user_plan(self, subscription: Subscription) -> None:
        user = await self.users.get(subscription.user_id)
        if user is None:
            return
        if subscription.status in ACTIVE_STATUSES:
            user.plan = subscription.plan
            if user.role in (UserRole.FREE_USER, UserRole.PREMIUM_USER, UserRole.ELITE_USER):
                user.role = ROLE_FOR_PLAN[subscription.plan]
        else:
            user.plan = SubscriptionPlan.FREE
            if user.role in (UserRole.PREMIUM_USER, UserRole.ELITE_USER):
                user.role = UserRole.FREE_USER

    async def _upsert_from_stripe_object(self, obj: dict[str, Any]) -> Subscription:
        stripe_sub_id = obj["id"]
        subscription = await self.subscriptions.get_by_stripe_id(stripe_sub_id)
        price_id = None
        items = obj.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id")

        if subscription is None:
            user = await self.users.get_by_stripe_customer(obj.get("customer", ""))
            if user is None:
                raise NotFoundError("No platform user for Stripe customer")
            subscription = Subscription(
                user_id=user.id,
                plan=self._plan_from_price(price_id),
                stripe_subscription_id=stripe_sub_id,
            )
            self.db.add(subscription)

        subscription.plan = self._plan_from_price(price_id)
        subscription.billing_interval = self._interval_from_price(price_id)
        subscription.stripe_price_id = price_id
        subscription.status = STRIPE_STATUS_MAP.get(
            obj.get("status", ""), SubscriptionStatus.INCOMPLETE
        )
        if obj.get("current_period_start"):
            subscription.current_period_start = datetime.fromtimestamp(
                obj["current_period_start"], tz=UTC
            )
        if obj.get("current_period_end"):
            subscription.current_period_end = datetime.fromtimestamp(
                obj["current_period_end"], tz=UTC
            )
        subscription.cancel_at_period_end = bool(obj.get("cancel_at_period_end"))
        await self.db.flush()
        await self._sync_user_plan(subscription)
        return subscription

    async def _on_checkout_completed(self, obj: dict[str, Any]) -> Subscription | None:
        stripe_sub_id = obj.get("subscription")
        if not stripe_sub_id:
            return None
        stripe_obj = await self.stripe.retrieve_subscription(stripe_sub_id)
        return await self._upsert_from_stripe_object(dict(stripe_obj))

    async def _on_subscription_updated(self, obj: dict[str, Any]) -> Subscription:
        return await self._upsert_from_stripe_object(obj)

    async def _on_subscription_deleted(self, obj: dict[str, Any]) -> Subscription | None:
        subscription = await self.subscriptions.get_by_stripe_id(obj["id"])
        if subscription is None:
            return None
        subscription.status = SubscriptionStatus.CANCELED
        subscription.canceled_at = datetime.now(UTC)
        await self._sync_user_plan(subscription)
        return subscription

    async def _on_payment_failed(self, obj: dict[str, Any]) -> Subscription | None:
        stripe_sub_id = obj.get("subscription")
        if not stripe_sub_id:
            return None
        subscription = await self.subscriptions.get_by_stripe_id(stripe_sub_id)
        if subscription is None:
            return None
        subscription.status = SubscriptionStatus.GRACE_PERIOD
        subscription.grace_period_ends_at = datetime.now(UTC) + timedelta(
            days=GRACE_PERIOD_DAYS
        )
        logger.warning("subscription_payment_failed", subscription_id=str(subscription.id))
        return subscription

    async def _on_payment_succeeded(self, obj: dict[str, Any]) -> Subscription | None:
        stripe_sub_id = obj.get("subscription")
        if not stripe_sub_id:
            return None
        subscription = await self.subscriptions.get_by_stripe_id(stripe_sub_id)
        if subscription is None:
            return None
        if subscription.status in (
            SubscriptionStatus.GRACE_PERIOD,
            SubscriptionStatus.PAST_DUE,
        ):
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.grace_period_ends_at = None
            await self._sync_user_plan(subscription)
        return subscription

    async def _record_event(self, subscription: Subscription, event_type: str) -> None:
        self.db.add(
            SubscriptionEvent(
                subscription_id=subscription.id,
                user_id=subscription.user_id,
                event_type=event_type,
            )
        )
        await self.db.flush()

    async def expire_lapsed_grace_periods(self) -> int:
        """Mark grace-period subscriptions past their deadline as expired."""
        expired = await self.subscriptions.list_expired_grace_periods()
        for subscription in expired:
            subscription.status = SubscriptionStatus.EXPIRED
            await self._sync_user_plan(subscription)
            await self._record_event(subscription, "subscription.grace_period_expired")
        await self.db.flush()
        return len(expired)
