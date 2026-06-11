"""Thin wrapper around the Stripe SDK so services stay testable."""
from typing import Any

import stripe

from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.models.enums import BillingInterval, SubscriptionPlan

stripe.api_key = settings.STRIPE_SECRET_KEY

PRICE_MAP: dict[tuple[SubscriptionPlan, BillingInterval], str] = {
    (SubscriptionPlan.PREMIUM, BillingInterval.MONTHLY): settings.STRIPE_PREMIUM_PRICE_ID,
    (SubscriptionPlan.PREMIUM, BillingInterval.ANNUAL): settings.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    (SubscriptionPlan.ELITE, BillingInterval.MONTHLY): settings.STRIPE_ELITE_PRICE_ID,
    (SubscriptionPlan.ELITE, BillingInterval.ANNUAL): settings.STRIPE_ELITE_ANNUAL_PRICE_ID,
}


class StripeClient:
    def price_id_for(self, plan: SubscriptionPlan, interval: BillingInterval) -> str:
        price_id = PRICE_MAP.get((plan, interval), "")
        if not price_id:
            raise ExternalServiceError(f"No Stripe price configured for {plan} {interval}")
        return price_id

    async def create_customer(self, email: str, name: str, user_id: str) -> str:
        try:
            customer = stripe.Customer.create(
                email=email, name=name, metadata={"platform_user_id": user_id}
            )
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe customer creation failed: {exc}") from exc
        return customer.id

    async def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        user_id: str,
    ) -> dict[str, str]:
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                mode="subscription",
                line_items=[{"price": price_id, "quantity": 1}],
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"platform_user_id": user_id},
                subscription_data={"metadata": {"platform_user_id": user_id}},
            )
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe checkout session failed: {exc}") from exc
        return {"checkout_url": session.url or "", "session_id": session.id}

    async def create_portal_session(self, customer_id: str, return_url: str) -> str:
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id, return_url=return_url
            )
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe portal session failed: {exc}") from exc
        return session.url

    async def cancel_subscription(self, stripe_subscription_id: str, at_period_end: bool = True):
        try:
            return stripe.Subscription.modify(
                stripe_subscription_id, cancel_at_period_end=at_period_end
            )
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe cancel failed: {exc}") from exc

    async def reactivate_subscription(self, stripe_subscription_id: str):
        try:
            return stripe.Subscription.modify(
                stripe_subscription_id, cancel_at_period_end=False
            )
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe reactivate failed: {exc}") from exc

    async def retrieve_subscription(self, stripe_subscription_id: str):
        try:
            return stripe.Subscription.retrieve(stripe_subscription_id)
        except stripe.StripeError as exc:
            raise ExternalServiceError(f"Stripe retrieve failed: {exc}") from exc

    def verify_webhook(self, payload: bytes, signature_header: str) -> dict[str, Any]:
        """Verify webhook signature and return the parsed event."""
        try:
            return stripe.Webhook.construct_event(
                payload, signature_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.SignatureVerificationError) as exc:
            raise ExternalServiceError(f"Invalid Stripe webhook: {exc}") from exc


stripe_client = StripeClient()
