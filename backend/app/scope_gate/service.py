"""
The scope/authorization gate.

This module is the one place in the codebase allowed to move a ScanJob into
RUNNING state. Every other module — the recon module, the web/API scanner, the
MCP test harness, everything in Phase 1-2 — must call `authorize_scan_start()`
before doing anything active, and must treat a False return as final, not as a
suggestion.

Per SRS Section 3.2:
  "No scan job may transition to a 'running' state in the backend job state
   machine without a corresponding passing authorization record."

This is deliberately NOT trust-the-caller. `authorize_scan_start` re-derives the
target and re-checks the AuthorizationRecord itself on every call (FR-2.6) — it
does not accept a "trust me, it's authorized" flag from anywhere.
"""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.logger import record as audit_record
from app.core.config import settings
from app.models.audit_log import AuditAction
from app.models.authorization import (
    AuthorizationMethod,
    AuthorizationRecord,
    AuthorizationStatus,
    DomainChallenge,
)
from app.models.scan_job import ScanJob, ScanJobState
from app.models.target import OwnershipMode, Target
from app.scope_gate.dns_verification import (
    check_dns_txt,
    check_file_challenge,
    generate_challenge_token,
)

# Test classes that require explicit, separate opt-in even when a target is otherwise
# authorized (FR-2.5). These stay disabled unless the bounty checklist or self-owned
# confirmation explicitly lists them under `allowed_test_classes`.
RESTRICTED_TEST_CLASSES = frozenset({
    "credential_stuffing",
    "brute_force",
    "volumetric",
})


class ScopeGateError(Exception):
    """Raised for scope-gate violations that callers must not silently swallow."""


# --------------------------------------------------------------------------- #
# Self-owned domain verification (FR-2.3)
# --------------------------------------------------------------------------- #

async def create_domain_challenge(
    db: AsyncSession, target: Target, method: AuthorizationMethod
) -> DomainChallenge:
    if target.ownership_mode != OwnershipMode.SELF_OWNED:
        raise ScopeGateError("Domain challenges only apply to self-owned targets")
    if not target.root_domain:
        raise ScopeGateError("Target has no root_domain set")

    challenge = DomainChallenge(
        target_id=target.id,
        method=method,
        token=generate_challenge_token(),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.challenge_token_ttl_hours),
    )
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)

    await audit_record(
        db, AuditAction.CHALLENGE_CREATED,
        target_id=target.id,
        detail={"method": method.value, "challenge_id": str(challenge.id)},
    )
    return challenge


async def verify_domain_challenge(
    db: AsyncSession, challenge: DomainChallenge, target: Target, user_id: uuid.UUID
) -> AuthorizationRecord:
    """
    Actively check DNS or the well-known file for the challenge token. On success,
    writes a PASSING AuthorizationRecord. On failure, writes a DENIED one — callers
    can retry by creating a fresh challenge.
    """
    if datetime.now(timezone.utc) > challenge.expires_at.replace(tzinfo=timezone.utc):
        raise ScopeGateError("Challenge token has expired; create a new one")

    if challenge.method == AuthorizationMethod.DNS_TXT:
        ok, detail = await check_dns_txt(target.root_domain, challenge.token)
    else:
        ok, detail = await check_file_challenge(target.root_domain, challenge.token)

    status = AuthorizationStatus.PASSING if ok else AuthorizationStatus.DENIED
    expires_at = (
        datetime.now(timezone.utc) + timedelta(days=settings.authorization_validity_days)
        if ok else None
    )

    auth_record = AuthorizationRecord(
        target_id=target.id,
        method=challenge.method,
        status=status,
        decided_by_user_id=user_id,
        expires_at=expires_at,
    )
    db.add(auth_record)

    challenge.verified = ok
    if ok:
        challenge.verified_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(auth_record)

    await audit_record(
        db,
        AuditAction.CHALLENGE_VERIFIED if ok else AuditAction.CHALLENGE_FAILED,
        target_id=target.id,
        user_id=user_id,
        detail={"method": challenge.method.value, "result": detail},
    )
    return auth_record


# --------------------------------------------------------------------------- #
# Bug bounty scope checklist (FR-2.2) — structured manual entry, not auto-parsed,
# per SRS v2.0's downgrade from v1.0's automatic-parsing assumption.
# --------------------------------------------------------------------------- #

async def submit_bounty_checklist(
    db: AsyncSession,
    target: Target,
    user_id: uuid.UUID,
    in_scope_assets: list[str],
    out_of_scope_assets: list[str],
    disallowed_test_classes: list[str],
    allowed_test_classes: list[str] | None = None,
) -> AuthorizationRecord:
    if target.ownership_mode != OwnershipMode.BUG_BOUNTY:
        raise ScopeGateError("Bounty checklist only applies to bug-bounty-mode targets")

    checklist_data = {
        "in_scope_assets": in_scope_assets,
        "out_of_scope_assets": out_of_scope_assets,
        "disallowed_test_classes": disallowed_test_classes,
        "allowed_test_classes": allowed_test_classes or [],
    }

    # The target's own identifier must actually appear in the asset list the user
    # entered — this is a sanity check, not full scope-matching (FR-2.2 keeps that
    # manual for v1), but it stops the most obvious mismatch: submitting a checklist
    # for one program while pointing the scan at a different, unlisted asset.
    is_covered = any(
        target.identifier == asset or target.identifier.endswith(asset.lstrip("*"))
        for asset in in_scope_assets
    )
    status = AuthorizationStatus.PASSING if is_covered else AuthorizationStatus.DENIED

    auth_record = AuthorizationRecord(
        target_id=target.id,
        method=AuthorizationMethod.BOUNTY_CHECKLIST,
        status=status,
        checklist_data=checklist_data,
        decided_by_user_id=user_id,
        expires_at=(
            datetime.now(timezone.utc) + timedelta(days=settings.authorization_validity_days)
            if status == AuthorizationStatus.PASSING else None
        ),
    )
    db.add(auth_record)
    await db.commit()
    await db.refresh(auth_record)

    await audit_record(
        db,
        AuditAction.AUTHORIZATION_GRANTED if is_covered else AuditAction.AUTHORIZATION_DENIED,
        target_id=target.id,
        user_id=user_id,
        detail={"method": "bounty_checklist", "target_covered": is_covered},
    )
    return auth_record


# --------------------------------------------------------------------------- #
# The actual gate — every scan-start request goes through this (FR-2.6)
# --------------------------------------------------------------------------- #

async def _latest_passing_record(db: AsyncSession, target_id: uuid.UUID) -> AuthorizationRecord | None:
    now = datetime.now(timezone.utc)
    stmt = (
        select(AuthorizationRecord)
        .where(
            AuthorizationRecord.target_id == target_id,
            AuthorizationRecord.status == AuthorizationStatus.PASSING,
        )
        .order_by(AuthorizationRecord.decided_at.desc())
    )
    result = await db.execute(stmt)
    for rec in result.scalars():
        if rec.expires_at is None or rec.expires_at.replace(tzinfo=timezone.utc) > now:
            return rec
    return None


async def authorize_scan_start(
    db: AsyncSession,
    job: ScanJob,
    target: Target,
    user_id: uuid.UUID,
    requested_test_classes: list[str] | None = None,
) -> bool:
    """
    The single choke point every active-scan module must call before doing anything.
    Independently re-verifies authorization state server-side (FR-2.6) — never trusts
    a flag passed in by the caller. Returns True/False and moves the job's state
    accordingly; also writes the audit trail either way.
    """
    await audit_record(
        db, AuditAction.SCAN_START_REQUESTED,
        target_id=target.id, user_id=user_id,
        detail={"job_id": str(job.id), "requested_test_classes": requested_test_classes or []},
    )

    passing_record = await _latest_passing_record(db, target.id)

    if passing_record is None:
        job.state = ScanJobState.REJECTED
        await db.commit()
        await audit_record(
            db, AuditAction.SCAN_START_BLOCKED,
            target_id=target.id, user_id=user_id,
            detail={"job_id": str(job.id), "reason": "no passing authorization record"},
        )
        return False

    # FR-2.5: restricted test classes need explicit per-class opt-in even when the
    # target overall is authorized.
    requested = set(requested_test_classes or [])
    blocked_classes = requested & RESTRICTED_TEST_CLASSES
    if blocked_classes:
        allowed = set((passing_record.checklist_data or {}).get("allowed_test_classes", []))
        still_blocked = blocked_classes - allowed
        if still_blocked:
            job.state = ScanJobState.REJECTED
            await db.commit()
            await audit_record(
                db, AuditAction.SCAN_START_BLOCKED,
                target_id=target.id, user_id=user_id,
                detail={
                    "job_id": str(job.id),
                    "reason": "restricted test class not explicitly permitted",
                    "blocked_classes": sorted(still_blocked),
                },
            )
            return False

    job.state = ScanJobState.QUEUED
    await db.commit()
    await audit_record(
        db, AuditAction.SCAN_START_ALLOWED,
        target_id=target.id, user_id=user_id,
        detail={"job_id": str(job.id), "authorization_record_id": str(passing_record.id)},
    )
    return True
