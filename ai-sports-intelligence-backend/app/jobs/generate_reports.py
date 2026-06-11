"""Generate the daily intelligence report from published predictions."""
from app.jobs.base import get_session, job_wrapper, logger, run_async, with_lock
from app.jobs.celery_app import celery_app
from app.models.enums import ReportType, SubscriptionPlan, UserRole
from app.schemas.reports import ReportGenerateRequest
from app.services.report_service import ReportService


async def _generate() -> dict:
    async with get_session() as session:
        # Reports require an author; use the first super admin as the system actor.
        from sqlalchemy import select

        from app.models.user import User

        system_user = (
            await session.execute(
                select(User).where(User.role == UserRole.SUPER_ADMIN).limit(1)
            )
        ).scalar_one_or_none()
        if system_user is None:
            logger.warning("daily_report_skipped_no_admin_user")
            return {"generated": 0, "reason": "no_admin_user"}

        service = ReportService(session)
        try:
            report = await service.generate(
                ReportGenerateRequest(
                    report_type=ReportType.DAILY_INTELLIGENCE,
                    minimum_plan=SubscriptionPlan.PREMIUM,
                ),
                requested_by=system_user,
            )
            await session.commit()
            return {"generated": 1, "report_id": str(report.id)}
        except Exception as exc:  # noqa: BLE001
            await session.rollback()
            logger.warning("daily_report_generation_failed", error=str(exc))
            return {"generated": 0, "reason": str(exc)}


@celery_app.task(name="jobs.generate_reports", bind=True, max_retries=2,
                 default_retry_delay=300)
@job_wrapper("generate_reports")
def generate_reports(self) -> dict:
    try:
        return run_async(with_lock("generate_reports", 900, _generate()))
    except Exception as exc:
        raise self.retry(exc=exc)
