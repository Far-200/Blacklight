import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Boolean, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuthorizationMethod(str, enum.Enum):
    DNS_TXT = "dns_txt"                # FR-2.3, self-owned
    FILE_CHALLENGE = "file_challenge"  # FR-2.3, self-owned
    BOUNTY_CHECKLIST = "bounty_checklist"  # FR-2.2, bug bounty mode


class AuthorizationStatus(str, enum.Enum):
    PENDING = "pending"
    PASSING = "passing"
    DENIED = "denied"
    EXPIRED = "expired"


class DomainChallenge(Base):
    """
    A single DNS TXT or file-based ownership challenge for a target's root domain.
    Created when the user starts verification; consumed when the scope-gate service
    confirms the token is present. See app/scope_gate/dns_verification.py.
    """
    __tablename__ = "domain_challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("targets.id"), nullable=False)

    method: Mapped[AuthorizationMethod] = mapped_column(Enum(AuthorizationMethod), nullable=False)
    token: Mapped[str] = mapped_column(String(128), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AuthorizationRecord(Base):
    """
    The record that the scope-gate state machine checks before allowing any active
    scan job to transition to 'running'. Per FR-2.6, this is checked server-side on
    every scan-start request — never trusted from the client.
    """
    __tablename__ = "authorization_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("targets.id"), nullable=False)

    method: Mapped[AuthorizationMethod] = mapped_column(Enum(AuthorizationMethod), nullable=False)
    status: Mapped[AuthorizationStatus] = mapped_column(
        Enum(AuthorizationStatus), default=AuthorizationStatus.PENDING, nullable=False
    )

    # For BOUNTY_CHECKLIST records: structured scope data completed against the program's
    # published policy (FR-2.2). Kept as JSON since checklist shape varies by program.
    # Expected keys: in_scope_assets, out_of_scope_assets, disallowed_test_classes,
    # allowed_test_classes (e.g. explicit opt-in for credential-stuffing/brute-force per FR-2.5).
    checklist_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    decided_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    decided_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    target: Mapped["Target"] = relationship(back_populates="authorization_records")  # noqa: F821
