import type { DashboardSummary } from "@/api/contracts";
import { emptySeverityCounts } from "@/types/findings";

import { mockFindingsByScan } from "./findings";
import { mockScans } from "./scans";

/**
 * The dashboard summary is derived from the other fixtures rather than being a
 * separate hand-written blob, so the numbers on the dashboard always agree with
 * what the scan and finding screens show. No GET /dashboard/summary exists on
 * the backend. See frontend/API_GAPS.md.
 */
export function buildMockDashboardSummary(): DashboardSummary {
  const allFindings = Object.values(mockFindingsByScan).flat();
  const severityCounts = emptySeverityCounts();
  for (const finding of allFindings) severityCounts[finding.severity] += 1;

  const activeStates = new Set(["queued", "running", "awaiting_authorization"]);

  return {
    total_scans: mockScans.length,
    active_scans: mockScans.filter((scan) => activeStates.has(scan.state)).length,
    critical_findings: allFindings.filter(
      (finding) => finding.severity === "critical" && finding.status !== "resolved",
    ).length,
    resolved_findings: allFindings.filter((finding) => finding.status === "resolved")
      .length,
    severity_counts: severityCounts,
    recent_scan_ids: [...mockScans]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5)
      .map((scan) => scan.id),
  };
}
