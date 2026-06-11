import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import IDTimestamped


class AdminOverview(BaseModel):
    total_users: int
    active_users: int
    free_users: int
    premium_users: int
    elite_users: int
    active_subscriptions: int
    pending_predictions: int
    pending_reports: int
    pending_telegram_posts: int
    data_feeds_healthy: int
    data_feeds_total: int


class AuditLogRead(IDTimestamped):
    actor_user_id: uuid.UUID | None
    action: str
    resource_type: str | None
    resource_id: str | None
    request_id: str | None
    ip_address: str | None
    detail: dict | None


class AdminActionRead(IDTimestamped):
    admin_user_id: uuid.UUID
    action: str
    target_type: str | None
    target_id: str | None
    note: str | None


class DataFeedRead(IDTimestamped):
    name: str
    provider: str
    feed_type: str
    status: str
    last_success_at: datetime | None
    last_failure_at: datetime | None
    consecutive_failures: int
    last_error: str | None


class ReportApprovalRequest(BaseModel):
    note: str | None = None


class TelegramPostApprovalRequest(BaseModel):
    note: str | None = None
