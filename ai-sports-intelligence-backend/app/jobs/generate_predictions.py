"""Generate predictions for upcoming fixtures that do not yet have one."""
from app.jobs.base import get_session, job_wrapper, logger, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.services.prediction_service import PredictionService


async def _generate(days_ahead: int) -> dict:
    async with get_session() as session:
        matches = MatchRepository(session)
        predictions = PredictionRepository(session)
        service = PredictionService(session)

        generated = 0
        failed = 0
        for fixture in await matches.list_upcoming(days=days_ahead):
            existing = await predictions.get_latest_for_fixture(
                fixture.id, public_only=False
            )
            if existing is not None:
                continue
            try:
                await service.generate_for_fixture(fixture.id)
                generated += 1
            except Exception as exc:  # noqa: BLE001 - continue with other fixtures
                failed += 1
                logger.error("prediction_generation_failed",
                             fixture_id=str(fixture.id), error=str(exc))
        await session.commit()
        return {"generated": generated, "failed": failed}


@celery_app.task(name="jobs.generate_predictions", bind=True, max_retries=2,
                 default_retry_delay=300)
@job_wrapper("generate_predictions")
def generate_predictions(self, days_ahead: int = 2) -> dict:
    try:
        return run_async(with_lock("generate_predictions", 1200, _generate(days_ahead)))
    except Exception as exc:
        raise self.retry(exc=exc)
