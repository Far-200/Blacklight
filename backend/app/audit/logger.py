"""
Single write path for the audit log (FR-2.4, FR-10.1). Routing every authorization
decision and every scan-start attempt through this one function means there's exactly
one place that can be reviewed to confirm the audit trail is complete.
"""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditAction, AuditLogEntry


async def record(
    db: AsyncSession,
    action: AuditAction,
    *,
    target_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    detail: dict | None = None,
    commit: bool = True,
) -> AuditLogEntry:
    entry = AuditLogEntry(
        action=action,
        target_id=target_id,
        user_id=user_id,
        detail=detail or {},
    )
    db.add(entry)
    if commit:
        await db.commit()
        await db.refresh(entry)
    return entry
