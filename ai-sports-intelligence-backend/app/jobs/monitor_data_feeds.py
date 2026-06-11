"""Flag data feeds as degraded/down when they stop succeeding."""
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.jobs.base import get_session, job_wrapper, logger, run_async
from app.jobs.celery_app import celery_app
from app.models.data_feed import DataFeed
from app.models.enums import DataFeedStatus

STALE_AFTER_HOURS = 26


async def _monitor() -> dict:
    async with get_session() as session:
        feeds = (await session.execute(select(DataFeed))).scalars().all()
        stale_cutoff = datetime.now(UTC) - timedelta(hours=STALE_AFTER_HOURS)
        flagged = 0
        for feed in feeds:
            if feed.last_success_at is not None and feed.last_success_at < stale_cutoff:
                if feed.status == DataFeedStatus.HEALTHY:
                    feed.status = DataFeedStatus.DEGRADED
                    flagged += 1
                    logger.warning("data_feed_stale", feed=feed.name)
        await session.commit()
        return {"feeds_checked": len(feeds), "flagged_stale": flagged}


@celery_app.task(name="jobs.monitor_data_feeds", bind=True, max_retries=2,
                 default_retry_delay=120)
@job_wrapper("monitor_data_feeds")
def monitor_data_feeds(self) -> dict:
    try:
        return run_async(_monitor())
    except Exception as exc:
        raise self.retry(exc=exc)
