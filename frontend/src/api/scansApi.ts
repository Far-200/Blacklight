import { env } from "@/config/env";
import { findMockScan, mockScans } from "@/mocks/scans";
import { clone, mockLatency } from "@/mocks/support";

import { NotImplementedOnBackendError } from "./client";
import type { ScanCreateRequest, ScanResponse } from "./contracts";

/**
 * Scans.
 *
 * Mock-only. There is no scan API and no sandbox behind any of this.
 *
 * `getScan` advances the running fixture a little on each call so the detail
 * screen's polling has something to show. That simulation lives here rather
 * than in the component: when the real GET /scans/{id} lands, this file is the
 * only thing that changes and the screen keeps working unmodified.
 */

/** Percentage points added to the running scan per poll. */
const SIMULATED_STEP = 3;

export async function listScans(): Promise<ScanResponse[]> {
  if (!env.useMocks) throw new NotImplementedOnBackendError("GET /scans");
  return mockLatency(clone(mockScans));
}

export async function getScan(scanId: string): Promise<ScanResponse> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`GET /scans/${scanId}`);

  const scan = findMockScan(scanId);
  if (!scan) throw new Error(`No scan with id ${scanId}`);

  if (scan.state === "running") advanceSimulatedProgress(scan);
  return mockLatency(clone(scan), 200);
}

function advanceSimulatedProgress(scan: ScanResponse): void {
  const active = scan.modules.find((module) => module.state === "running");
  if (!active) return;

  active.progress = Math.min(100, active.progress + SIMULATED_STEP * 2);
  if (active.progress >= 100) {
    active.state = "completed";
    const nextIndex = scan.modules.indexOf(active) + 1;
    const next = scan.modules[nextIndex];
    if (next) {
      next.state = "running";
      next.progress = 4;
      next.detail = "Starting";
    }
  }

  const completed = scan.modules.filter(
    (module) => module.state === "completed" || module.state === "skipped",
  ).length;
  const partial = (active.state === "running" ? active.progress : 0) / 100;
  scan.progress = Math.min(
    99,
    Math.round(((completed + partial) / scan.modules.length) * 100),
  );
}

/**
 * Creating a scan is a two-step flow in the real system: create the ScanJob,
 * then call POST /scope-gate/scan-start, which is the only thing allowed to
 * move the job to `queued`. Only the second half exists today.
 */
export async function createScan(body: ScanCreateRequest): Promise<ScanResponse> {
  if (!env.useMocks) throw new NotImplementedOnBackendError("POST /scans");

  const source = mockScans[0];
  if (!source) throw new Error("Mock scan fixtures are empty");

  const created: ScanResponse = {
    ...clone(source),
    id: crypto.randomUUID(),
    target_id: body.target_id,
    state: "awaiting_authorization",
    created_at: new Date().toISOString(),
    started_at: null,
    finished_at: null,
    progress: 0,
    modules: source.modules.map((module) => ({
      ...module,
      state: "pending",
      progress: 0,
      detail: null,
    })),
    activity: [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        level: "info",
        message: "Scan job created — awaiting authorization check",
      },
    ],
    finding_counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    failure_reason: null,
  };

  mockScans.unshift(created);
  return mockLatency(clone(created), 500);
}

/**
 * Cancellation has no backend endpoint and no worker to signal, so this
 * deliberately does nothing but reject. The UI surfaces it as unavailable
 * rather than pretending a cancel succeeded.
 */
export async function cancelScan(scanId: string): Promise<never> {
  throw new NotImplementedOnBackendError(`POST /scans/${scanId}/cancel`);
}
