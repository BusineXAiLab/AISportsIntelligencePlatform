"""Read-only aggregate queries supporting the analytics endpoints."""
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.accuracy import PredictionAccuracy
from app.models.data_feed import DataFeed
from app.models.enums import DataFeedStatus, ReportStatus, TelegramMessageStatus
from app.models.report import Report
from app.models.telegram import TelegramMessage

_correct_count = func.sum(case((PredictionAccuracy.was_correct.is_(True), 1), else_=0))


class AnalyticsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def accuracy_by_dimension(self, dimension) -> dict[str, float]:
        """Accuracy percentage grouped by a PredictionAccuracy column."""
        result = await self.db.execute(
            select(
                dimension,
                func.count(PredictionAccuracy.id),
                _correct_count,
            ).group_by(dimension)
        )
        out: dict[str, float] = {}
        for key, total, correct in result.all():
            if key is None or not total:
                continue
            label = key.value if hasattr(key, "value") else str(key)
            out[label] = round(100.0 * (correct or 0) / total, 2)
        return out

    async def overall_accuracy(self) -> tuple[int, int, float | None]:
        result = await self.db.execute(
            select(
                func.count(PredictionAccuracy.id),
                _correct_count,
                func.avg(PredictionAccuracy.brier_score),
            )
        )
        total, correct, avg_brier = result.one()
        return total or 0, correct or 0, float(avg_brier) if avg_brier is not None else None

    async def confidence_calibration(self) -> list[dict]:
        """Bucket predicted probabilities and compare with realised frequencies."""
        rows = (
            await self.db.execute(
                select(
                    PredictionAccuracy.predicted_probability,
                    PredictionAccuracy.was_correct,
                )
            )
        ).all()
        buckets: dict[int, list[bool]] = {}
        for prob, correct in rows:
            bucket = min(int(prob * 10), 9)
            buckets.setdefault(bucket, []).append(correct)
        return [
            {
                "bucket": f"{b * 10}-{b * 10 + 10}%",
                "count": len(vals),
                "predicted_mid_pct": b * 10 + 5,
                "actual_pct": round(100.0 * sum(vals) / len(vals), 2),
            }
            for b, vals in sorted(buckets.items())
        ]

    async def report_counts(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Report.status, func.count(Report.id))
            .where(Report.deleted_at.is_(None))
            .group_by(Report.status)
        )
        return {status.value: count for status, count in result.all()}

    async def pending_report_count(self) -> int:
        result = await self.db.execute(
            select(func.count(Report.id)).where(
                Report.status == ReportStatus.PENDING_REVIEW, Report.deleted_at.is_(None)
            )
        )
        return result.scalar_one()

    async def pending_telegram_count(self) -> int:
        result = await self.db.execute(
            select(func.count(TelegramMessage.id)).where(
                TelegramMessage.status == TelegramMessageStatus.PENDING_APPROVAL
            )
        )
        return result.scalar_one()

    async def data_feed_health(self) -> tuple[int, int]:
        total = (await self.db.execute(select(func.count(DataFeed.id)))).scalar_one()
        healthy = (
            await self.db.execute(
                select(func.count(DataFeed.id)).where(
                    DataFeed.status == DataFeedStatus.HEALTHY
                )
            )
        ).scalar_one()
        return healthy, total
