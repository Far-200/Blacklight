import { env } from "@/config/env";
import {
  buildMockChallenge,
  buildMockChecklistResult,
  buildMockVerificationResult,
} from "@/mocks/scopeGate";
import { mockLatency } from "@/mocks/support";
import type { DomainChallengeMethod } from "@/types/domain";

import type {
  AuthorizationRecordResponse,
  BountyChecklistRequest,
  ChallengeResponse,
} from "./contracts";
import {
  createChallenge,
  submitBountyChecklist,
  verifyChallenge,
} from "./scopeGateApi";

/**
 * The authorization gate's service boundary.
 *
 * This is the one awkward seam in the app, and it is worth being explicit about
 * why it exists.
 *
 * The four scope-gate endpoints are REAL and implemented. But every one of them
 * starts by loading a Target row, and there is no endpoint to create a Target,
 * so against a running backend they would return 404 for every target this
 * frontend can produce. Rather than make the gate unusable, mock mode
 * substitutes fixtures here — and only here.
 *
 * Two things this mock will not do:
 *
 *   1. It never returns `passing` for a domain challenge. No DNS lookup and no
 *      file fetch happens in the browser, so claiming ownership was verified
 *      would misrepresent the only fact the gate exists to establish.
 *   2. It never lets the UI decide a scan is allowed. That decision belongs to
 *      POST /scope-gate/scan-start, server-side, on every request.
 *
 * When POST /targets lands, delete this file and call scopeGateApi directly.
 */

export interface CreateChallengeArgs {
  targetId: string;
  method: DomainChallengeMethod;
  /** Only used to render mock instructions; the backend derives its own. */
  rootDomain: string;
}

export async function startDomainChallenge({
  targetId,
  method,
  rootDomain,
}: CreateChallengeArgs): Promise<ChallengeResponse> {
  if (env.useMocks) {
    return mockLatency(buildMockChallenge(targetId, method, rootDomain), 450);
  }
  return createChallenge({ target_id: targetId, method });
}

export async function checkDomainChallenge(
  challenge: ChallengeResponse,
): Promise<AuthorizationRecordResponse> {
  if (env.useMocks) {
    return mockLatency(buildMockVerificationResult(challenge), 900);
  }
  return verifyChallenge({ challenge_id: challenge.id });
}

export async function submitChecklist(
  body: BountyChecklistRequest,
  /** Mock-only: whether the target identifier is covered by the asset list. */
  coveredByScope: boolean,
): Promise<AuthorizationRecordResponse> {
  if (env.useMocks) {
    return mockLatency(
      buildMockChecklistResult(body.target_id, coveredByScope),
      700,
    );
  }
  return submitBountyChecklist(body);
}

/**
 * Mirrors the backend's coverage check in
 * `submit_bounty_checklist`: the target's own identifier must appear in the
 * in-scope list. Duplicated here only to drive the mock result and to warn the
 * user before they submit — the backend's own check is authoritative.
 */
export function isCoveredByScope(
  identifier: string,
  inScopeAssets: string[],
): boolean {
  return inScopeAssets.some(
    (asset) =>
      identifier === asset || identifier.endsWith(asset.replace(/^\*/, "")),
  );
}
