"""Settle predictions against final results and update accuracy records."""
from app.jobs.base import get_session, job_wrapper, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.services.accuracy_service import AccuracyService


async def _calculate() -> dict:
    async with get_session() as session:
        settled = await AccuracyService(session).settle_finished_fixtures()
        await session.commit()
        return {"predictions_settled": settled}


@celery_app.task(name="jobs.calculate_accuracy", bind=True, max_retries=3,
                 default_retry_delay=120)
@job_wrapper("calculate_accuracy")
def calculate_accuracy(self) -> dict:
    try:
        return run_async(with_lock("calculate_accuracy", 600, _calculate()))
    except Exception as exc:
        raise self.retry(exc=exc)
