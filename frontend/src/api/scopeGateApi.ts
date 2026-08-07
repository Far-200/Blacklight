import { DEV_USER_ID } from "@/config/env";

import { apiRequest } from "./client";
import type {
  AuthorizationRecordResponse,
  BountyChecklistRequest,
  ChallengeCreateRequest,
  ChallengeResponse,
  ChallengeVerifyRequest,
  ScanStartRequest,
  ScanStartResponse,
} from "./contracts";

/**
 * Scope-gate endpoints — all four are implemented in
 * backend/app/routers/scope_gate.py, so these are real HTTP calls with no mock
 * counterpart.
 *
 * `user_id` is passed as a query parameter because that is what the router
 * currently expects. The backend comment is explicit that this moves to auth
 * middleware later; when it does, delete the parameter here and send a token
 * from src/api/client.ts instead.
 */

export function createChallenge(
  body: ChallengeCreateRequest,
): Promise<ChallengeResponse> {
  return apiRequest<ChallengeResponse>("/scope-gate/challenges", {
    method: "POST",
    body,
  });
}

export function verifyChallenge(
  body: ChallengeVerifyRequest,
  userId: string = DEV_USER_ID,
): Promise<AuthorizationRecordResponse> {
  return apiRequest<AuthorizationRecordResponse>(
    "/scope-gate/challenges/verify",
    { method: "POST", body, query: { user_id: userId } },
  );
}

export function submitBountyChecklist(
  body: BountyChecklistRequest,
  userId: string = DEV_USER_ID,
): Promise<AuthorizationRecordResponse> {
  return apiRequest<AuthorizationRecordResponse>("/scope-gate/bounty-checklist", {
    method: "POST",
    body,
    query: { user_id: userId },
  });
}

/**
 * The server-side gate. A `false` result is final — the UI must not offer a
 * way around it, and must not re-request on the user's behalf.
 */
export function requestScanStart(
  body: ScanStartRequest,
  userId: string = DEV_USER_ID,
): Promise<ScanStartResponse> {
  return apiRequest<ScanStartResponse>("/scope-gate/scan-start", {
    method: "POST",
    body,
    query: { user_id: userId },
  });
}
