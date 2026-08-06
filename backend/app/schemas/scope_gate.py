import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.authorization import AuthorizationMethod, AuthorizationStatus


class ChallengeCreateRequest(BaseModel):
    target_id: uuid.UUID
    method: AuthorizationMethod  # dns_txt or file_challenge


class ChallengeResponse(BaseModel):
    id: uuid.UUID
    target_id: uuid.UUID
    method: AuthorizationMethod
    token: str
    instructions: str
    expires_at: datetime

    model_config = {"from_attributes": True}


class ChallengeVerifyRequest(BaseModel):
    challenge_id: uuid.UUID


class BountyChecklistRequest(BaseModel):
    target_id: uuid.UUID
    in_scope_assets: list[str]
    out_of_scope_assets: list[str]
    disallowed_test_classes: list[str]
    allowed_test_classes: list[str] = []


class AuthorizationRecordResponse(BaseModel):
    id: uuid.UUID
    target_id: uuid.UUID
    method: AuthorizationMethod
    status: AuthorizationStatus
    decided_at: datetime
    expires_at: datetime | None

    model_config = {"from_attributes": True}


class ScanStartRequest(BaseModel):
    job_id: uuid.UUID
    requested_test_classes: list[str] = []


class ScanStartResponse(BaseModel):
    allowed: bool
    job_id: uuid.UUID
    job_state: str
