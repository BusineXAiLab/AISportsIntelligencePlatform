"""Send approved Telegram messages and queue daily prediction posts."""
from datetime import UTC, datetime

from app.jobs.base import get_session, job_wrapper, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.models.enums import TelegramChannelType
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.telegram_repository import TelegramRepository
from app.services.telegram_service import TelegramService


async def _publish() -> dict:
    async with get_session() as session:
        service = TelegramService(session)
        telegram = TelegramRepository(session)

        sent = 0
        failed = 0
        now = datetime.now(UTC)
        for message in await telegram.list_sendable_messages():
            if message.scheduled_for is not None and message.scheduled_for > now:
                continue
            result = await service.send_message(message)
            if result.sent_at is not None:
                sent += 1
            else:
                failed += 1
        await session.commit()
        return {"sent": sent, "failed": failed}


async def _queue_daily_predictions() -> dict:
    """Queue today's published predictions as Telegram posts (pending approval)."""
    async with get_session() as session:
        predictions = PredictionRepository(session)
        service = TelegramService(session)

        queued = 0
        for prediction in await predictions.list_for_date(datetime.now(UTC).date()):
            fixture = prediction.fixture
            content = (
                f"<b>{fixture.home_team.name} vs {fixture.away_team.name}</b>\n"
                f"{fixture.league.name} | Kickoff {fixture.kickoff_time:%H:%M} UTC\n"
                f"Model probabilities: Home {prediction.home_win_probability:.0%} | "
                f"Draw {prediction.draw_probability:.0%} | "
                f"Away {prediction.away_win_probability:.0%}\n"
                f"Confidence: {prediction.confidence_level.value} | "
                f"Risk: {prediction.risk_level.value}\n"
                f"Model {prediction.model_version}"
            )
            await service.queue_message(
                content=content,
                channel_type=TelegramChannelType.VIP,
                requires_approval=True,
                related_prediction_id=prediction.id,
            )
            queued += 1
        await session.commit()
        return {"queued": queued}


@celery_app.task(name="jobs.publish_telegram", bind=True, max_retries=3,
                 default_retry_delay=60)
@job_wrapper("publish_telegram")
def publish_telegram(self) -> dict:
    try:
        return run_async(with_lock("publish_telegram", 300, _publish()))
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(name="jobs.queue_daily_telegram_predictions", bind=True, max_retries=2)
@job_wrapper("queue_daily_telegram_predictions")
def queue_daily_telegram_predictions(self) -> dict:
    try:
        return run_async(
            with_lock("queue_daily_telegram", 600, _queue_daily_predictions())
        )
    except Exception as exc:
        raise self.retry(exc=exc)
