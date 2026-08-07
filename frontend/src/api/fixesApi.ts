import { env } from "@/config/env";
import { mockFixesByScan } from "@/mocks/fixes";
import { clone, mockLatency } from "@/mocks/support";
import type { ProposedFixViewModel } from "@/types/findings";

import { NotImplementedOnBackendError } from "./client";

/**
 * Proposed fixes.
 *
 * Mock-only. No fix-generation endpoint exists and no model is called from the
 * browser. Patches in src/mocks/fixes.ts were written by hand as fixtures and
 * have not been compiled or tested against any codebase.
 * See frontend/API_GAPS.md.
 */

export async function listFixes(scanId: string): Promise<ProposedFixViewModel[]> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`GET /scans/${scanId}/fixes`);

  return mockLatency(clone(mockFixesByScan[scanId] ?? []));
}

/**
 * Marking a fix reviewed is local-only. Review state belongs in the database,
 * so this does not survive a reload — a real PATCH endpoint replaces it.
 */
export async function markFixReviewed(
  scanId: string,
  fixId: string,
  reviewed: boolean,
): Promise<ProposedFixViewModel> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`PATCH /scans/${scanId}/fixes/${fixId}`);

  const fix = (mockFixesByScan[scanId] ?? []).find((entry) => entry.id === fixId);
  if (!fix) throw new Error(`No proposed fix with id ${fixId}`);

  fix.reviewed = reviewed;
  return mockLatency(clone(fix), 180);
}
