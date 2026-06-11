"""Ingest upcoming fixtures from the configured sports data provider."""
from datetime import UTC, datetime, timedelta

from app.jobs.base import get_session, job_wrapper, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.services.sports_data_service import SportsDataService


async def _ingest(days_ahead: int) -> dict:
    async with get_session() as session:
        service = SportsDataService(session)
        total = 0
        today = datetime.now(UTC).date()
        try:
            for offset in range(days_ahead + 1):
                total += await service.ingest_fixtures(today + timedelta(days=offset))
            await session.commit()
        except Exception as exc:
            await session.rollback()
            async with get_session() as failure_session:
                await SportsDataService(failure_session).record_feed_failure(
                    "fixtures", str(exc)
                )
                await failure_session.commit()
            raise
        return {"fixtures_created": total, "days_ahead": days_ahead}


@celery_app.task(name="jobs.ingest_fixtures", bind=True, max_retries=3,
                 default_retry_delay=120)
@job_wrapper("ingest_fixtures")
def ingest_fixtures(self, days_ahead: int = 3) -> dict:
    try:
        return run_async(with_lock("ingest_fixtures", 600, _ingest(days_ahead)))
    except Exception as exc:
        raise self.retry(exc=exc)
