"""Ingest final results for recently played fixtures."""
from datetime import UTC, datetime, timedelta

from app.jobs.base import get_session, job_wrapper, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.services.sports_data_service import SportsDataService


async def _ingest(days_back: int) -> dict:
    async with get_session() as session:
        service = SportsDataService(session)
        total = 0
        today = datetime.now(UTC).date()
        try:
            for offset in range(days_back + 1):
                total += await service.ingest_results(today - timedelta(days=offset))
            await session.commit()
        except Exception as exc:
            await session.rollback()
            async with get_session() as failure_session:
                await SportsDataService(failure_session).record_feed_failure(
                    "results", str(exc)
                )
                await failure_session.commit()
            raise
        return {"results_ingested": total, "days_back": days_back}


@celery_app.task(name="jobs.ingest_results", bind=True, max_retries=3,
                 default_retry_delay=120)
@job_wrapper("ingest_results")
def ingest_results(self, days_back: int = 1) -> dict:
    try:
        return run_async(with_lock("ingest_results", 600, _ingest(days_back)))
    except Exception as exc:
        raise self.retry(exc=exc)
