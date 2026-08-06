import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ScanJobState(str, enum.Enum):
    CREATED = "created"                        # job exists, no authorization check yet
    AWAITING_AUTHORIZATION = "awaiting_authorization"  # blocked here until AuthorizationRecord passes
    QUEUED = "queued"                           # authorization passed, waiting for a sandbox worker
    RUNNING = "running"                         # actively executing in the Kali sandbox
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"                       # scope gate permanently denied this job


class ScanJob(Base):
    """
    This is the object the scope gate actually governs. Per SRS Section 3.2, no ScanJob
    may reach RUNNING without a corresponding passing AuthorizationRecord — this is
    enforced in app/scope_gate/service.py's transition_to_running(), not left to callers.
    """
    __tablename__ = "scan_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("targets.id"), nullable=False)
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    state: Mapped[ScanJobState] = mapped_column(
        Enum(ScanJobState), default=ScanJobState.CREATED, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
