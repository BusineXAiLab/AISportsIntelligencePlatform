import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, require_content_lead
from app.models.user import User
from app.schemas.reports import ReportGenerateRequest, ReportRead, ReportSummary
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily", response_model=list[ReportSummary])
async def daily_reports(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[ReportSummary]:
    reports = await ReportService(db).list_daily(user)
    return [ReportSummary.model_validate(report) for report in reports]


@router.get("/{report_id}", response_model=ReportRead)
async def report_detail(
    report_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    return ReportRead.model_validate(await ReportService(db).get_report(report_id, user))


@router.post("/generate", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
async def generate_report(
    payload: ReportGenerateRequest,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    report = await ReportService(db).generate(payload, requested_by=admin)
    return ReportRead.model_validate(report)


@router.post("/{report_id}/publish", response_model=ReportRead)
async def publish_report(
    report_id: uuid.UUID,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    return ReportRead.model_validate(await ReportService(db).publish(report_id, admin))


@router.post("/{report_id}/archive", response_model=ReportRead)
async def archive_report(
    report_id: uuid.UUID,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    return ReportRead.model_validate(await ReportService(db).archive(report_id, admin))
