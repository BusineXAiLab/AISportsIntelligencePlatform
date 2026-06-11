import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import ReportStatus, ReportType, SubscriptionPlan
from app.schemas.common import IDTimestamped


class ReportRead(IDTimestamped):
    title: str
    report_type: ReportType
    status: ReportStatus
    content: str
    summary: str | None
    minimum_plan: SubscriptionPlan
    fixture_id: uuid.UUID | None
    prediction_id: uuid.UUID | None
    report_date: datetime | None
    published_at: datetime | None


class ReportSummary(IDTimestamped):
    title: str
    report_type: ReportType
    status: ReportStatus
    summary: str | None
    minimum_plan: SubscriptionPlan
    report_date: datetime | None


class ReportGenerateRequest(BaseModel):
    report_type: ReportType
    fixture_id: uuid.UUID | None = None
    prediction_id: uuid.UUID | None = None
    target_user_id: uuid.UUID | None = None
    minimum_plan: SubscriptionPlan = SubscriptionPlan.FREE


class ReportUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    summary: str | None = None
    minimum_plan: SubscriptionPlan | None = None
    change_note: str | None = None
