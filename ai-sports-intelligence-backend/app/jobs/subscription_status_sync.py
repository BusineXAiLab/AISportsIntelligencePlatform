"""Reconcile local subscription state with Stripe (drift protection)."""
from app.jobs.base import get_session, job_wrapper, logger, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.repositories.subscription_repository import SubscriptionRepository
from app.services.subscription_service import SubscriptionService


async def _sync() -> dict:
    async with get_session() as session:
        service = SubscriptionService(session)
        repository = SubscriptionRepository(session)

        synced = 0
        failed = 0
        for subscription in await repository.list_needing_sync():
            try:
                stripe_obj = await service.stripe.retrieve_subscription(
                    subscription.stripe_subscription_id
                )
                await service._upsert_from_stripe_object(dict(stripe_obj))
                synced += 1
            except Exception as exc:  # noqa: BLE001 - keep syncing remaining rows
                failed += 1
                logger.error("subscription_sync_failed",
                             subscription_id=str(subscription.id), error=str(exc))
        expired = await service.expire_lapsed_grace_periods()
        await session.commit()
        return {"synced": synced, "failed": failed, "grace_periods_expired": expired}


@celery_app.task(name="jobs.subscription_status_sync", bind=True, max_retries=2,
                 default_retry_delay=300)
@job_wrapper("subscription_status_sync")
def subscription_status_sync(self) -> dict:
    try:
        return run_async(with_lock("subscription_sync", 900, _sync()))
    except Exception as exc:
        raise self.retry(exc=exc)
