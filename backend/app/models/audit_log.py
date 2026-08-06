import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditAction(str, enum.Enum):
    AUTHORIZATION_GRANTED = "authorization_granted"
    AUTHORIZATION_DENIED = "authorization_denied"
    CHALLENGE_CREATED = "challenge_created"
    CHALLENGE_VERIFIED = "challenge_verified"
    CHALLENGE_FAILED = "challenge_failed"
    SCAN_START_REQUESTED = "scan_start_requested"
    SCAN_START_BLOCKED = "scan_start_blocked"   # gate rejected the request
    SCAN_START_ALLOWED = "scan_start_allowed"


class AuditLogEntry(Base):
    """
    Append-only audit trail. Every authorization decision and every scan-start
    request (allowed or blocked) is written here, per FR-2.4 and FR-10.1.
    This table is never updated or deleted from application code — only inserted into.
    """
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False)

    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    # Free-form structured detail, e.g. {"method": "dns_txt", "reason": "token not found"}
    detail: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
