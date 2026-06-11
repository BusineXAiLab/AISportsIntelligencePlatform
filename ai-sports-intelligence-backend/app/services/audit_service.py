"""Audit logging for security events and admin actions."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AdminAction, AuditLog


class AuditService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def log(
        self,
        action: str,
        actor_user_id: uuid.UUID | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        request_id: str | None = None,
        ip_address: str | None = None,
        detail: dict | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            request_id=request_id,
            ip_address=ip_address,
            detail=detail,
        )
        self.db.add(entry)
        await self.db.flush()
        return entry

    async def log_admin_action(
        self,
        admin_user_id: uuid.UUID,
        action: str,
        target_type: str | None = None,
        target_id: str | None = None,
        before_state: dict | None = None,
        after_state: dict | None = None,
        note: str | None = None,
    ) -> AdminAction:
        entry = AdminAction(
            admin_user_id=admin_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            before_state=before_state,
            after_state=after_state,
            note=note,
        )
        self.db.add(entry)
        await self.db.flush()
        # Mirror into the general audit trail for unified querying.
        await self.log(
            action=f"admin.{action}",
            actor_user_id=admin_user_id,
            resource_type=target_type,
            resource_id=target_id,
            detail={"note": note} if note else None,
        )
        return entry

    def audit_logs_query(self, action: str | None = None):
        query = select(AuditLog).order_by(AuditLog.created_at.desc())
        if action:
            query = query.where(AuditLog.action.like(f"{action}%"))
        return query
