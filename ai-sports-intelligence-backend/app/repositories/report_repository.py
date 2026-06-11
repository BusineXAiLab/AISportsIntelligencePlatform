import uuid
from datetime import UTC, datetime, time, timedelta

from sqlalchemy import func, select

from app.models.enums import ReportStatus, SubscriptionPlan
from app.models.report import Report, ReportVersion
from app.repositories.base import BaseRepository

PLAN_RANK = {SubscriptionPlan.FREE: 0, SubscriptionPlan.PREMIUM: 1, SubscriptionPlan.ELITE: 2}


class ReportRepository(BaseRepository[Report]):
    model = Report

    async def list_daily(
        self, plan: SubscriptionPlan, target_date: datetime | None = None
    ) -> list[Report]:
        """Published reports for today, filtered by the user's plan entitlement."""
        now = target_date or datetime.now(UTC)
        start = datetime.combine(now.date(), time.min, tzinfo=UTC)
        end = start + timedelta(days=1)
        allowed_plans = [p for p, rank in PLAN_RANK.items() if rank <= PLAN_RANK[plan]]
        result = await self.db.execute(
            select(Report)
            .where(
                Report.status == ReportStatus.PUBLISHED,
                Report.deleted_at.is_(None),
                Report.minimum_plan.in_(allowed_plans),
                Report.published_at >= start,
                Report.published_at < end,
            )
            .order_by(Report.published_at.desc())
        )
        return list(result.scalars().all())

    async def list_pending_review(self) -> list[Report]:
        result = await self.db.execute(
            select(Report)
            .where(
                Report.status == ReportStatus.PENDING_REVIEW,
                Report.deleted_at.is_(None),
            )
            .order_by(Report.created_at)
        )
        return list(result.scalars().all())

    async def next_version_number(self, report_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.max(ReportVersion.version_number), 0)).where(
                ReportVersion.report_id == report_id
            )
        )
        return result.scalar_one() + 1
