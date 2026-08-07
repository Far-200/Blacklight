import { env } from "@/config/env";
import { buildMockDashboardSummary } from "@/mocks/dashboard";
import { mockLatency } from "@/mocks/support";

import { NotImplementedOnBackendError } from "./client";
import type { DashboardSummary } from "./contracts";

/**
 * Dashboard summary.
 *
 * Mock-only, derived from the scan and finding fixtures so the dashboard never
 * disagrees with the screens it links to. See frontend/API_GAPS.md.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError("GET /dashboard/summary");

  return mockLatency(buildMockDashboardSummary(), 260);
}
