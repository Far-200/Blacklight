import { env } from "@/config/env";
import { mockFindingsByScan, mockFindingSources } from "@/mocks/findings";
import { clone, mockLatency } from "@/mocks/support";
import type { FindingViewModel } from "@/types/findings";

import { NotImplementedOnBackendError } from "./client";

/**
 * Findings.
 *
 * Mock-only. There is no findings API, no normalization pipeline output, and no
 * agreed findings schema — the shapes returned here are the temporary view
 * models in src/types/findings.ts. See frontend/API_GAPS.md.
 */

export async function listFindings(scanId: string): Promise<FindingViewModel[]> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`GET /scans/${scanId}/findings`);

  return mockLatency(clone(mockFindingsByScan[scanId] ?? []));
}

/** Detecting tools present in the dataset, for the source filter. */
export async function listFindingSources(): Promise<string[]> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError("GET /findings/sources");

  return mockLatency(clone(mockFindingSources), 120);
}
