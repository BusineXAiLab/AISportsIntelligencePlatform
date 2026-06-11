from datetime import datetime

from pydantic import BaseModel

from app.models.enums import BillingInterval, SubscriptionPlan, SubscriptionStatus
from app.schemas.common import IDTimestamped


class PlanInfo(BaseModel):
    plan: SubscriptionPlan
    name: str
    monthly_price_usd: float
    annual_price_usd: float | None = None
    features: list[str]


class SubscriptionRead(IDTimestamped):
    plan: SubscriptionPlan
    status: SubscriptionStatus
    billing_interval: BillingInterval
    current_period_start: datetime | None
    current_period_end: datetime | None
    cancel_at_period_end: bool
    grace_period_ends_at: datetime | None


class SubscriptionStatusResponse(BaseModel):
    plan: SubscriptionPlan
    status: SubscriptionStatus | None = None
    is_active: bool
    current_period_end: datetime | None = None
    cancel_at_period_end: bool = False


class CheckoutSessionRequest(BaseModel):
    plan: SubscriptionPlan
    billing_interval: BillingInterval = BillingInterval.MONTHLY
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str


class CustomerPortalRequest(BaseModel):
    return_url: str


class CustomerPortalResponse(BaseModel):
    portal_url: str
