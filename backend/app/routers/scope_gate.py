import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.authorization import DomainChallenge
from app.models.scan_job import ScanJob
from app.models.target import Target
from app.schemas.scope_gate import (
    AuthorizationRecordResponse,
    BountyChecklistRequest,
    ChallengeCreateRequest,
    ChallengeResponse,
    ChallengeVerifyRequest,
    ScanStartRequest,
    ScanStartResponse,
)
from app.scope_gate import service

router = APIRouter(prefix="/scope-gate", tags=["scope-gate"])


def _instructions_for(challenge: DomainChallenge, target: Target) -> str:
    if challenge.method.value == "dns_txt":
        hostname = f"{settings.dns_txt_challenge_prefix}.{target.root_domain}"
        return f"Create a DNS TXT record at {hostname} with value: {challenge.token}"
    path = settings.file_challenge_path
    return (
        f"Publish a file at https://{target.root_domain}{path} "
        f"containing exactly: {challenge.token}"
    )


@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge(body: ChallengeCreateRequest, db: AsyncSession = Depends(get_db)):
    target = await db.get(Target, body.target_id)
    if target is None:
        raise HTTPException(404, "Target not found")
    try:
        challenge = await service.create_domain_challenge(db, target, body.method)
    except service.ScopeGateError as exc:
        raise HTTPException(400, str(exc)) from exc

    return ChallengeResponse(
        id=challenge.id,
        target_id=challenge.target_id,
        method=challenge.method,
        token=challenge.token,
        instructions=_instructions_for(challenge, target),
        expires_at=challenge.expires_at,
    )


@router.post("/challenges/verify", response_model=AuthorizationRecordResponse)
async def verify_challenge(
    body: ChallengeVerifyRequest,
    user_id: uuid.UUID,  # in a real deployment this comes from auth middleware, not a query param
    db: AsyncSession = Depends(get_db),
):
    challenge = await db.get(DomainChallenge, body.challenge_id)
    if challenge is None:
        raise HTTPException(404, "Challenge not found")
    target = await db.get(Target, challenge.target_id)

    try:
        auth_record = await service.verify_domain_challenge(db, challenge, target, user_id)
    except service.ScopeGateError as exc:
        raise HTTPException(400, str(exc)) from exc

    return AuthorizationRecordResponse.model_validate(auth_record)


@router.post("/bounty-checklist", response_model=AuthorizationRecordResponse)
async def submit_bounty_checklist(
    body: BountyChecklistRequest,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    target = await db.get(Target, body.target_id)
    if target is None:
        raise HTTPException(404, "Target not found")

    try:
        auth_record = await service.submit_bounty_checklist(
            db, target, user_id,
            body.in_scope_assets, body.out_of_scope_assets,
            body.disallowed_test_classes, body.allowed_test_classes,
        )
    except service.ScopeGateError as exc:
        raise HTTPException(400, str(exc)) from exc

    return AuthorizationRecordResponse.model_validate(auth_record)


@router.post("/scan-start", response_model=ScanStartResponse)
async def request_scan_start(
    body: ScanStartRequest,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Every scan-executing module (recon, web/API scanner, MCP harness, etc.) calls this
    — or calls service.authorize_scan_start() directly if it's already inside the
    backend process — before doing anything active. This is FR-2.6's server-side
    independent check, exposed as an endpoint so even a client that bypasses the
    normal UI flow still has to pass through it.
    """
    job = await db.get(ScanJob, body.job_id)
    if job is None:
        raise HTTPException(404, "Scan job not found")
    target = await db.get(Target, job.target_id)
    if target is None:
        raise HTTPException(404, "Target for job not found")

    allowed = await service.authorize_scan_start(
        db, job, target, user_id, body.requested_test_classes
    )
    return ScanStartResponse(allowed=allowed, job_id=job.id, job_state=job.state.value)
