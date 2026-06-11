from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.integrations.stripe_client import stripe_client
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.subscriptions import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CustomerPortalRequest,
    CustomerPortalResponse,
    PlanInfo,
    SubscriptionRead,
    SubscriptionStatusResponse,
)
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=list[PlanInfo])
async def list_plans(db: AsyncSession = Depends(get_db)) -> list[PlanInfo]:
    return [PlanInfo(**plan) for plan in SubscriptionService(db).list_plans()]


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_status(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> SubscriptionStatusResponse:
    return SubscriptionStatusResponse(**await SubscriptionService(db).get_status(user))


@router.post("/checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CheckoutSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutSessionResponse:
    result = await SubscriptionService(db).create_checkout_session(
        user=user,
        plan=payload.plan,
        billing_interval=payload.billing_interval,
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
    )
    return CheckoutSessionResponse(**result)


@router.post("/customer-portal", response_model=CustomerPortalResponse)
async def create_customer_portal(
    payload: CustomerPortalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CustomerPortalResponse:
    portal_url = await SubscriptionService(db).create_portal_session(user, payload.return_url)
    return CustomerPortalResponse(portal_url=portal_url)


@router.post("/webhook/stripe", response_model=MessageResponse)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    payload = await request.body()
    event = stripe_client.verify_webhook(payload, stripe_signature)
    await SubscriptionService(db).handle_webhook_event(event)
    return MessageResponse(message="ok")


@router.post("/cancel", response_model=SubscriptionRead)
async def cancel_subscription(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> SubscriptionRead:
    subscription = await SubscriptionService(db).cancel(user)
    return SubscriptionRead.model_validate(subscription)


@router.post("/reactivate", response_model=SubscriptionRead)
async def reactivate_subscription(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> SubscriptionRead:
    subscription = await SubscriptionService(db).reactivate(user)
    return SubscriptionRead.model_validate(subscription)
