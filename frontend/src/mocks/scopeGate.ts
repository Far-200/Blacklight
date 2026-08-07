import type {
  AuthorizationRecordResponse,
  ChallengeResponse,
} from "@/api/contracts";
import type { DomainChallengeMethod } from "@/types/domain";

import { hoursFromNow } from "./support";

/**
 * Mock scope-gate responses.
 *
 * Unlike everything else in this folder, the scope-gate endpoints ARE
 * implemented on the backend. These fixtures exist for one reason: the
 * endpoints operate on a Target row, and there is no way to create a Target
 * yet, so a real call would always return 404. Once POST /targets exists, delete
 * this file and let the authorization screen talk to the orchestrator directly —
 * src/api/scopeGateApi.ts already does exactly that.
 *
 * The mock deliberately does NOT fake a successful verification. Nothing here
 * checks DNS or fetches a file, so reporting "passing" would be a lie about the
 * one thing the gate exists to establish. It returns "denied" with the reason
 * the real backend would give.
 */

const TOKEN_PREFIX = "bl_mock_";

function mockToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return (
    TOKEN_PREFIX +
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  );
}

export function buildMockChallenge(
  targetId: string,
  method: DomainChallengeMethod,
  rootDomain: string,
): ChallengeResponse {
  const token = mockToken();

  return {
    id: crypto.randomUUID(),
    target_id: targetId,
    method,
    token,
    instructions:
      method === "dns_txt"
        ? `Create a DNS TXT record at _blacklight-verify.${rootDomain} with value: ${token}`
        : `Publish a file at https://${rootDomain}/.well-known/blacklight-verify.txt containing exactly: ${token}`,
    expires_at: hoursFromNow(24),
  };
}

/** Always denied — no verification actually happened. */
export function buildMockVerificationResult(
  challenge: ChallengeResponse,
): AuthorizationRecordResponse {
  return {
    id: crypto.randomUUID(),
    target_id: challenge.target_id,
    method: challenge.method,
    status: "denied",
    decided_at: new Date().toISOString(),
    expires_at: null,
  };
}

export function buildMockChecklistResult(
  targetId: string,
  covered: boolean,
): AuthorizationRecordResponse {
  return {
    id: crypto.randomUUID(),
    target_id: targetId,
    method: "bounty_checklist",
    status: covered ? "passing" : "denied",
    decided_at: new Date().toISOString(),
    expires_at: covered ? hoursFromNow(24 * 30) : null,
  };
}
