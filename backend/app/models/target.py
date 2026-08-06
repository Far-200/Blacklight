import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TargetType(str, enum.Enum):
    WEB = "web"
    APK = "apk"
    SQL = "sql"
    MCP = "mcp"


class OwnershipMode(str, enum.Enum):
    SELF_OWNED = "self_owned"          # FR-2.3 domain-ownership verification path
    BUG_BOUNTY = "bug_bounty"          # FR-2.2 scope-checklist path


class Target(Base):
    """
    A single scan target, per FR-1.1 (Target Intake Module).
    A Target cannot be scanned until it has a passing AuthorizationRecord — enforced
    in app/scope_gate/service.py, not here. This model only stores the target itself.
    """
    __tablename__ = "targets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    target_type: Mapped[TargetType] = mapped_column(Enum(TargetType), nullable=False)
    ownership_mode: Mapped[OwnershipMode] = mapped_column(Enum(OwnershipMode), nullable=False)

    # For WEB/MCP: the URL / endpoint. For SQL: a connection identifier (never the raw
    # credentialed connection string — that's handled separately, out of scope for Phase 0).
    # For APK: a storage reference to the uploaded file.
    identifier: Mapped[str] = mapped_column(String(2048), nullable=False)

    # Root domain, used for DNS TXT / file-challenge verification (self-owned mode only).
    root_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Bug bounty program name, if ownership_mode == BUG_BOUNTY (FR-1.3).
    bounty_program: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    authorization_records: Mapped[list["AuthorizationRecord"]] = relationship(
        back_populates="target", cascade="all, delete-orphan"
    )
