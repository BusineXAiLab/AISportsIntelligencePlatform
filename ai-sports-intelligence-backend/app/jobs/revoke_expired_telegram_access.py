"""Revoke VIP Telegram access for users without a qualifying subscription."""
from app.jobs.base import get_session, job_wrapper, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.services.subscription_service import SubscriptionService
from app.services.telegram_service import TelegramService


async def _revoke() -> dict:
    async with get_session() as session:
        # First expire any subscriptions whose grace period has lapsed.
        expired = await SubscriptionService(session).expire_lapsed_grace_periods()
        revoked = await TelegramService(session).revoke_expired_vip_access()
        await session.commit()
        return {"subscriptions_expired": expired, "vip_revoked": revoked}


@celery_app.task(name="jobs.revoke_expired_telegram_access", bind=True, max_retries=3,
                 default_retry_delay=120)
@job_wrapper("revoke_expired_telegram_access")
def revoke_expired_telegram_access(self) -> dict:
    try:
        return run_async(with_lock("revoke_telegram_access", 300, _revoke()))
    except Exception as exc:
        raise self.retry(exc=exc)
