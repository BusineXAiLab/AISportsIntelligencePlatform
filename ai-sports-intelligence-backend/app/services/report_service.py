"""AI report generation, review and publishing workflow."""
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationAppError
from app.core.logging import get_logger
from app.models.enums import ReportStatus, ReportType, SubscriptionPlan
from app.models.report import Report, ReportVersion
from app.models.user import User
from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.user_repository import UserRepository
from app.schemas.reports import ReportGenerateRequest, ReportUpdateRequest
from app.services.audit_service import AuditService
from app.services.entitlement_service import PLAN_RANK, EntitlementService
from app.services.llm_service import LLMService
from app.services.responsible_language_service import ResponsibleLanguageService

logger = get_logger(__name__)


class ReportService:
    def __init__(self, db: AsyncSession, llm: LLMService | None = None) -> None:
        self.db = db
        self.reports = ReportRepository(db)
        self.predictions = PredictionRepository(db)
        self.matches = MatchRepository(db)
        self.users = UserRepository(db)
        self.llm = llm or LLMService()
        self.language = ResponsibleLanguageService()
        self.audit = AuditService(db)
        self.entitlements = EntitlementService(db)

    async def list_daily(self, user: User) -> list[Report]:
        plan = await self.entitlements.effective_plan(user)
        return await self.reports.list_daily(plan)

    async def get_report(self, report_id: uuid.UUID, user: User) -> Report:
        report = await self.reports.get(report_id)
        if report is None or report.deleted_at is not None:
            raise NotFoundError("Report not found")
        plan = await self.entitlements.effective_plan(user)
        if PLAN_RANK[plan] < PLAN_RANK[report.minimum_plan]:
            raise ForbiddenError(
                f"This report requires the {report.minimum_plan.value} plan"
            )
        return report

    async def _build_structured_data(self, request: ReportGenerateRequest) -> dict:
        """Assemble structured prediction/match data; the only LLM input allowed."""
        data: dict = {"report_type": request.report_type.value}

        if request.prediction_id:
            prediction = await self.predictions.get_with_fixture(request.prediction_id)
            if prediction is None:
                raise NotFoundError("Prediction not found")
            fixture = prediction.fixture
            data["prediction"] = {
                "home_team": fixture.home_team.name,
                "away_team": fixture.away_team.name,
                "league": fixture.league.name,
                "kickoff_time": fixture.kickoff_time,
                "model_version": prediction.model_version,
                "home_win_probability": prediction.home_win_probability,
                "draw_probability": prediction.draw_probability,
                "away_win_probability": prediction.away_win_probability,
                "over_25_probability": prediction.over_25_probability,
                "both_teams_to_score_probability": (
                    prediction.both_teams_to_score_probability
                ),
                "confidence_level": prediction.confidence_level.value,
                "risk_level": prediction.risk_level.value,
                "key_factors": prediction.key_factors,
            }
        elif request.fixture_id:
            fixture = await self.matches.get_with_relations(request.fixture_id)
            if fixture is None:
                raise NotFoundError("Match not found")
            data["fixture"] = {
                "home_team": fixture.home_team.name,
                "away_team": fixture.away_team.name,
                "league": fixture.league.name,
                "kickoff_time": fixture.kickoff_time,
                "status": fixture.status.value,
            }
        elif request.report_type == ReportType.DAILY_INTELLIGENCE:
            todays = await self.predictions.list_for_date(datetime.now(UTC).date())
            data["predictions"] = [
                {
                    "home_team": p.fixture.home_team.name,
                    "away_team": p.fixture.away_team.name,
                    "league": p.fixture.league.name,
                    "home_win_probability": p.home_win_probability,
                    "draw_probability": p.draw_probability,
                    "away_win_probability": p.away_win_probability,
                    "confidence_level": p.confidence_level.value,
                    "risk_level": p.risk_level.value,
                }
                for p in todays
            ]
            if not data["predictions"]:
                raise ValidationAppError("No published predictions available for today")
        else:
            raise ValidationAppError(
                "A fixture_id or prediction_id is required for this report type"
            )

        if request.target_user_id:
            target = await self.users.get(request.target_user_id)
            if target is not None:
                prefs = await self.users.get_preferences(target.id)
                data["user_context"] = {
                    "favorite_teams": prefs.favorite_teams if prefs else [],
                    "favorite_leagues": prefs.favorite_leagues if prefs else [],
                }
        return data

    def _title_for(self, request: ReportGenerateRequest, data: dict) -> str:
        if "prediction" in data:
            p = data["prediction"]
            return f"{p['home_team']} vs {p['away_team']}: {request.report_type.value.replace('_', ' ').title()}"
        if "fixture" in data:
            f = data["fixture"]
            return f"{f['home_team']} vs {f['away_team']}: {request.report_type.value.replace('_', ' ').title()}"
        return (
            f"Daily Intelligence Report - {datetime.now(UTC).date().isoformat()}"
        )

    async def generate(self, request: ReportGenerateRequest, requested_by: User) -> Report:
        structured_data = await self._build_structured_data(request)
        raw_text = await self.llm.generate_report_text(request.report_type, structured_data)

        clean_text, replacements = self.language.filter_text(raw_text)
        clean_text = self.language.append_disclaimer(clean_text)

        report = Report(
            title=self._title_for(request, structured_data),
            report_type=request.report_type,
            status=ReportStatus.PENDING_REVIEW,
            content=clean_text,
            summary=clean_text[:280],
            minimum_plan=request.minimum_plan,
            fixture_id=request.fixture_id,
            prediction_id=request.prediction_id,
            target_user_id=request.target_user_id,
            llm_model=self.llm.client.__class__.__name__,
            generation_metadata={"structured_data_keys": list(structured_data.keys())},
            language_filter_applied={"replacements": replacements},
            report_date=datetime.now(UTC),
        )
        self.db.add(report)
        await self.db.flush()
        self.db.add(
            ReportVersion(
                report_id=report.id, version_number=1, content=clean_text,
                edited_by=requested_by.id, change_note="Initial generation",
            )
        )
        await self.db.flush()
        logger.info("report_generated", report_id=str(report.id),
                    report_type=request.report_type.value,
                    language_replacements=len(replacements))
        return report

    async def update(self, report_id: uuid.UUID, data: ReportUpdateRequest, admin: User
                     ) -> Report:
        report = await self.reports.get(report_id)
        if report is None or report.deleted_at is not None:
            raise NotFoundError("Report not found")
        before = {"title": report.title, "minimum_plan": report.minimum_plan.value}

        if data.title is not None:
            report.title = data.title
        if data.content is not None:
            clean, replacements = self.language.filter_text(data.content)
            report.content = self.language.append_disclaimer(clean)
            report.language_filter_applied = {"replacements": replacements}
            version_number = await self.reports.next_version_number(report.id)
            self.db.add(
                ReportVersion(
                    report_id=report.id, version_number=version_number,
                    content=report.content, edited_by=admin.id,
                    change_note=data.change_note or "Manual edit",
                )
            )
        if data.summary is not None:
            report.summary = data.summary
        if data.minimum_plan is not None:
            report.minimum_plan = data.minimum_plan
        await self.db.flush()
        await self.audit.log_admin_action(
            admin_user_id=admin.id, action="report.updated",
            target_type="report", target_id=str(report_id),
            before_state=before,
            after_state={"title": report.title, "minimum_plan": report.minimum_plan.value},
        )
        return report

    async def approve(self, report_id: uuid.UUID, admin: User, note: str | None = None
                      ) -> Report:
        report = await self.reports.get(report_id)
        if report is None:
            raise NotFoundError("Report not found")
        if report.status != ReportStatus.PENDING_REVIEW:
            raise ConflictError("Report is not pending review")
        report.status = ReportStatus.APPROVED
        report.approved_by = admin.id
        report.approved_at = datetime.now(UTC)
        await self.audit.log_admin_action(
            admin_user_id=admin.id, action="report.approved",
            target_type="report", target_id=str(report_id), note=note,
        )
        return report

    async def publish(self, report_id: uuid.UUID, admin: User) -> Report:
        report = await self.reports.get(report_id)
        if report is None:
            raise NotFoundError("Report not found")
        if report.status not in (ReportStatus.APPROVED, ReportStatus.PENDING_REVIEW):
            raise ConflictError("Report must be approved before publishing")
        if self.language.contains_banned_language(report.content):
            raise ValidationAppError(
                "Report contains restricted language and cannot be published"
            )
        report.status = ReportStatus.PUBLISHED
        report.published_at = datetime.now(UTC)
        if report.approved_by is None:
            report.approved_by = admin.id
            report.approved_at = report.published_at
        await self.audit.log_admin_action(
            admin_user_id=admin.id, action="report.published",
            target_type="report", target_id=str(report_id),
        )
        return report

    async def archive(self, report_id: uuid.UUID, admin: User) -> Report:
        report = await self.reports.get(report_id)
        if report is None:
            raise NotFoundError("Report not found")
        report.status = ReportStatus.ARCHIVED
        report.archived_at = datetime.now(UTC)
        await self.audit.log_admin_action(
            admin_user_id=admin.id, action="report.archived",
            target_type="report", target_id=str(report_id),
        )
        return report
