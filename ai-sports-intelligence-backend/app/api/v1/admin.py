import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.pagination import PageParams, build_page, paginate
from app.core.permissions import require_admin, require_content_lead
from app.models.enums import SubscriptionPlan, TelegramMessageStatus, UserRole
from app.models.subscription import Subscription
from app.models.user import User
from app.repositories.telegram_repository import TelegramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import (
    AdminOverview,
    AuditLogRead,
    DataFeedRead,
    ReportApprovalRequest,
    TelegramPostApprovalRequest,
)
from app.schemas.common import PageResponse
from app.schemas.predictions import (
    ModelStatusInfo,
    PredictionReviewRequest,
    PredictionWithMatch,
)
from app.schemas.reports import ReportRead, ReportUpdateRequest
from app.schemas.subscriptions import SubscriptionRead
from app.schemas.telegram import TelegramMessageRead
from app.schemas.users import AdminUserUpdate, UserAdminRead
from app.services.admin_service import AdminService
from app.services.audit_service import AuditService
from app.services.prediction_service import PredictionService
from app.services.report_service import ReportService
from app.services.telegram_service import TelegramService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview", response_model=AdminOverview)
async def admin_overview(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> AdminOverview:
    return AdminOverview(**await AdminService(db).overview())


# ----------------------------- users ------------------------------------ #


@router.get("/users", response_model=PageResponse[UserAdminRead])
async def admin_list_users(
    params: PageParams = Depends(),
    role: UserRole | None = None,
    plan: SubscriptionPlan | None = None,
    search: str | None = Query(None, max_length=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PageResponse[UserAdminRead]:
    query = UserRepository(db).list_query(role=role, plan=plan, search=search)
    rows, total = await paginate(db, query, params)
    items = [UserAdminRead.model_validate(u) for u in rows]
    return PageResponse[UserAdminRead](**build_page(items, total, params))


@router.get("/users/{user_id}", response_model=UserAdminRead)
async def admin_get_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserAdminRead:
    return UserAdminRead.model_validate(await AdminService(db).get_user(user_id))


@router.patch("/users/{user_id}", response_model=UserAdminRead)
async def admin_update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserAdminRead:
    user = await AdminService(db).update_user(user_id, payload, admin)
    return UserAdminRead.model_validate(user)


# -------------------------- subscriptions -------------------------------- #


@router.get("/subscriptions", response_model=PageResponse[SubscriptionRead])
async def admin_list_subscriptions(
    params: PageParams = Depends(),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PageResponse[SubscriptionRead]:
    from sqlalchemy import select

    query = select(Subscription).order_by(Subscription.created_at.desc())
    rows, total = await paginate(db, query, params)
    items = [SubscriptionRead.model_validate(s) for s in rows]
    return PageResponse[SubscriptionRead](**build_page(items, total, params))


# --------------------------- predictions --------------------------------- #


@router.get("/predictions/pending", response_model=list[PredictionWithMatch])
async def admin_pending_predictions(
    admin: User = Depends(require_content_lead), db: AsyncSession = Depends(get_db)
) -> list[PredictionWithMatch]:
    service = PredictionService(db)
    pending = await service.predictions.list_pending_review()
    return [
        PredictionWithMatch.model_validate(service.to_match_payload(p)) for p in pending
    ]


@router.post("/predictions/{prediction_id}/approve", response_model=PredictionWithMatch)
async def admin_approve_prediction(
    prediction_id: uuid.UUID,
    payload: PredictionReviewRequest | None = None,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> PredictionWithMatch:
    service = PredictionService(db)
    prediction = await service.approve(
        prediction_id, admin, note=payload.note if payload else None
    )
    return PredictionWithMatch.model_validate(service.to_match_payload(prediction))


@router.post("/predictions/{prediction_id}/reject", response_model=PredictionWithMatch)
async def admin_reject_prediction(
    prediction_id: uuid.UUID,
    payload: PredictionReviewRequest | None = None,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> PredictionWithMatch:
    service = PredictionService(db)
    prediction = await service.reject(
        prediction_id, admin, note=payload.note if payload else None
    )
    return PredictionWithMatch.model_validate(service.to_match_payload(prediction))


# ----------------------------- reports ----------------------------------- #


@router.get("/reports/pending", response_model=list[ReportRead])
async def admin_pending_reports(
    admin: User = Depends(require_content_lead), db: AsyncSession = Depends(get_db)
) -> list[ReportRead]:
    reports = await ReportService(db).reports.list_pending_review()
    return [ReportRead.model_validate(r) for r in reports]


@router.patch("/reports/{report_id}", response_model=ReportRead)
async def admin_update_report(
    report_id: uuid.UUID,
    payload: ReportUpdateRequest,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    return ReportRead.model_validate(
        await ReportService(db).update(report_id, payload, admin)
    )


@router.post("/reports/{report_id}/approve", response_model=ReportRead)
async def admin_approve_report(
    report_id: uuid.UUID,
    payload: ReportApprovalRequest | None = None,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    report = await ReportService(db).approve(
        report_id, admin, note=payload.note if payload else None
    )
    return ReportRead.model_validate(report)


@router.post("/reports/{report_id}/publish", response_model=ReportRead)
async def admin_publish_report(
    report_id: uuid.UUID,
    admin: User = Depends(require_content_lead),
    db: AsyncSession = Depends(get_db),
) -> ReportRead:
    return ReportRead.model_validate(await ReportService(db).publish(report_id, admin))


# ----------------------------- telegram ---------------------------------- #


@router.get("/telegram/posts", response_model=list[TelegramMessageRead])
async def admin_telegram_posts(
    status: TelegramMessageStatus | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[TelegramMessageRead]:
    messages = await TelegramRepository(db).list_messages(status=status)
    return [TelegramMessageRead.model_validate(m) for m in messages]


@router.post("/telegram/posts/{post_id}/approve", response_model=TelegramMessageRead)
async def admin_approve_telegram_post(
    post_id: uuid.UUID,
    payload: TelegramPostApprovalRequest | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> TelegramMessageRead:
    message = await TelegramService(db).approve_message(
        post_id, admin, note=payload.note if payload else None
    )
    return TelegramMessageRead.model_validate(message)


# ------------------------- operations dashboards ------------------------- #


@router.get("/model-status", response_model=list[ModelStatusInfo])
async def admin_model_status(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> list[ModelStatusInfo]:
    statuses = await PredictionService(db).model_status()
    return [ModelStatusInfo.model_validate(s) for s in statuses]


@router.get("/data-feed-status", response_model=list[DataFeedRead])
async def admin_data_feed_status(
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
) -> list[DataFeedRead]:
    feeds = await AdminService(db).list_data_feeds()
    return [DataFeedRead.model_validate(f) for f in feeds]


@router.get("/audit-logs", response_model=PageResponse[AuditLogRead])
async def admin_audit_logs(
    params: PageParams = Depends(),
    action: str | None = Query(None, max_length=128),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PageResponse[AuditLogRead]:
    query = AuditService(db).audit_logs_query(action=action)
    rows, total = await paginate(db, query, params)
    items = [AuditLogRead.model_validate(log) for log in rows]
    return PageResponse[AuditLogRead](**build_page(items, total, params))
