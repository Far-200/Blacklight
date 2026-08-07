import { env } from "@/config/env";
import { mockReportsByScan } from "@/mocks/reports";
import { clone, mockLatency } from "@/mocks/support";
import type { ReportViewModel } from "@/types/findings";

import { NotImplementedOnBackendError } from "./client";

/**
 * Reports.
 *
 * Mock-only. The backend does not generate reports, and the frontend makes no
 * model calls of its own — the narrative in src/mocks/reports.ts is a hand-
 * written fixture. See frontend/API_GAPS.md.
 */

export async function getReport(scanId: string): Promise<ReportViewModel | null> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`GET /scans/${scanId}/report`);

  const report = mockReportsByScan[scanId];
  return mockLatency(report ? clone(report) : null);
}
