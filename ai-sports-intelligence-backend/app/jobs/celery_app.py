"""Celery application with Redis broker and beat schedule."""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "sports_ai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.jobs.ingest_fixtures",
        "app.jobs.ingest_results",
        "app.jobs.generate_predictions",
        "app.jobs.generate_reports",
        "app.jobs.publish_telegram",
        "app.jobs.revoke_expired_telegram_access",
        "app.jobs.calculate_accuracy",
        "app.jobs.monitor_data_feeds",
        "app.jobs.subscription_status_sync",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_default_retry_delay=60,
    task_track_started=True,
    result_expires=86400,
)

celery_app.conf.beat_schedule = {
    "ingest-fixtures-daily": {
        "task": "jobs.ingest_fixtures",
        "schedule": crontab(hour=4, minute=0),
    },
    "ingest-results-hourly": {
        "task": "jobs.ingest_results",
        "schedule": crontab(minute=15, hour="*/2"),
    },
    "generate-predictions-daily": {
        "task": "jobs.generate_predictions",
        "schedule": crontab(hour=6, minute=0),
    },
    "generate-daily-report": {
        "task": "jobs.generate_reports",
        "schedule": crontab(hour=7, minute=0),
    },
    "publish-telegram-every-10-min": {
        "task": "jobs.publish_telegram",
        "schedule": crontab(minute="*/10"),
    },
    "revoke-expired-telegram-access-hourly": {
        "task": "jobs.revoke_expired_telegram_access",
        "schedule": crontab(minute=30),
    },
    "calculate-accuracy-hourly": {
        "task": "jobs.calculate_accuracy",
        "schedule": crontab(minute=45),
    },
    "monitor-data-feeds": {
        "task": "jobs.monitor_data_feeds",
        "schedule": crontab(minute="*/15"),
    },
    "subscription-status-sync-daily": {
        "task": "jobs.subscription_status_sync",
        "schedule": crontab(hour=5, minute=30),
    },
}
