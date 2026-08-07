import type { ScanModuleProgress, ScanResponse } from "@/api/contracts";

import { daysAgo, hoursAgo, minutesAgo } from "./support";

/**
 * Mock scans. No POST /scans, GET /scans or GET /scans/{id} exists on the
 * backend, and no scanner sandbox is connected — the module list below is a
 * planned pipeline, not a description of anything that currently runs.
 * See frontend/API_GAPS.md.
 */

/** The pipeline the scan detail screen renders. None of these modules exist. */
export const PLANNED_MODULES: Array<{ key: string; label: string }> = [
  { key: "intake", label: "Intake validation" },
  { key: "scope", label: "Scope authorization" },
  { key: "repository", label: "Repository inspection" },
  { key: "dependencies", label: "Dependency analysis" },
  { key: "secrets", label: "Secret detection" },
  { key: "static", label: "Static analysis" },
  { key: "config", label: "Configuration analysis" },
  { key: "normalize", label: "Finding normalization" },
  { key: "explain", label: "AI-assisted explanation" },
  { key: "report", label: "Report generation" },
];

function modules(
  spec: Array<[string, ScanModuleProgress["state"], number, string | null]>,
): ScanModuleProgress[] {
  return spec.map(([key, state, progress, detail]) => {
    const planned = PLANNED_MODULES.find((module) => module.key === key);
    return {
      key,
      label: planned?.label ?? key,
      state,
      progress,
      detail,
    };
  });
}

const completedModules = modules([
  ["intake", "completed", 100, "Target reachable, 1 host resolved"],
  ["scope", "completed", 100, "DNS TXT authorization verified"],
  ["repository", "completed", 100, "412 files, 3 languages"],
  ["dependencies", "completed", 100, "187 packages resolved"],
  ["secrets", "completed", 100, "2 candidate secrets"],
  ["static", "completed", 100, "Semgrep, 214 rules"],
  ["config", "completed", 100, "TLS and header review"],
  ["normalize", "completed", 100, "31 raw results, 12 findings"],
  ["explain", "completed", 100, "12 findings summarised"],
  ["report", "completed", 100, "Report available"],
]);

const runningModules = modules([
  ["intake", "completed", 100, "Target reachable, 2 hosts resolved"],
  ["scope", "completed", 100, "DNS TXT authorization verified"],
  ["repository", "completed", 100, "268 files, 2 languages"],
  ["dependencies", "completed", 100, "94 packages resolved"],
  ["secrets", "completed", 100, "1 candidate secret"],
  ["static", "running", 62, "Semgrep, rule 132 of 214"],
  ["config", "pending", 0, null],
  ["normalize", "pending", 0, null],
  ["explain", "pending", 0, null],
  ["report", "pending", 0, null],
]);

const queuedModules = modules(
  PLANNED_MODULES.map(
    (module) =>
      [module.key, "pending", 0, null] as [
        string,
        ScanModuleProgress["state"],
        number,
        string | null,
      ],
  ),
);

const failedModules = modules([
  ["intake", "completed", 100, "Target reachable"],
  ["scope", "completed", 100, "Bounty checklist authorization verified"],
  ["repository", "skipped", 0, "No repository supplied"],
  ["dependencies", "skipped", 0, "No manifest available"],
  ["secrets", "completed", 100, "No candidate secrets"],
  ["static", "failed", 41, "Sandbox worker lost connection"],
  ["config", "pending", 0, null],
  ["normalize", "pending", 0, null],
  ["explain", "pending", 0, null],
  ["report", "pending", 0, null],
]);

const rejectedModules = modules([
  ["intake", "completed", 100, "Target reachable"],
  ["scope", "failed", 100, "No passing authorization record"],
  ...PLANNED_MODULES.slice(2).map(
    (module) =>
      [module.key, "pending", 0, null] as [
        string,
        ScanModuleProgress["state"],
        number,
        string | null,
      ],
  ),
]);

export const mockScans: ScanResponse[] = [
  {
    id: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a01",
    target_id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c01",
    target_name: "Aurora Storefront",
    target_identifier: "https://shop.aurora-labs.dev",
    target_type: "web",
    state: "completed",
    authorization_status: "passing",
    authorization_method: "dns_txt",
    created_at: hoursAgo(6),
    started_at: hoursAgo(6),
    finished_at: hoursAgo(5),
    progress: 100,
    modules: completedModules,
    activity: [
      { id: "a1", at: hoursAgo(6), level: "info", message: "Scan job created" },
      { id: "a2", at: hoursAgo(6), level: "info", message: "Scope gate allowed scan start" },
      { id: "a3", at: hoursAgo(6), level: "info", message: "Repository inspection completed — 412 files" },
      { id: "a4", at: hoursAgo(5), level: "warn", message: "Secret detection flagged 2 candidates for review" },
      { id: "a5", at: hoursAgo(5), level: "info", message: "31 raw results deduplicated into 12 findings" },
      { id: "a6", at: hoursAgo(5), level: "info", message: "Report generated" },
    ],
    finding_counts: { critical: 1, high: 3, medium: 4, low: 3, info: 1 },
    failure_reason: null,
  },
  {
    id: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a02",
    target_id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c02",
    target_name: "Payments API",
    target_identifier: "https://api.aurora-labs.dev",
    target_type: "web",
    state: "running",
    authorization_status: "passing",
    authorization_method: "dns_txt",
    created_at: minutesAgo(14),
    started_at: minutesAgo(13),
    finished_at: null,
    progress: 56,
    modules: runningModules,
    activity: [
      { id: "b1", at: minutesAgo(14), level: "info", message: "Scan job created" },
      { id: "b2", at: minutesAgo(14), level: "info", message: "Scope gate allowed scan start" },
      { id: "b3", at: minutesAgo(12), level: "info", message: "Dependency analysis completed — 94 packages" },
      { id: "b4", at: minutesAgo(9), level: "warn", message: "Secret detection flagged 1 candidate for review" },
      { id: "b5", at: minutesAgo(3), level: "info", message: "Static analysis running — rule 132 of 214" },
    ],
    finding_counts: { critical: 0, high: 1, medium: 2, low: 1, info: 0 },
    failure_reason: null,
  },
  {
    id: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a03",
    target_id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c03",
    target_name: "Helios public program",
    target_identifier: "https://www.helios-demo.example",
    target_type: "web",
    state: "queued",
    authorization_status: "passing",
    authorization_method: "bounty_checklist",
    created_at: minutesAgo(4),
    started_at: null,
    finished_at: null,
    progress: 0,
    modules: queuedModules,
    activity: [
      { id: "c1", at: minutesAgo(4), level: "info", message: "Scan job created" },
      { id: "c2", at: minutesAgo(4), level: "info", message: "Scope gate allowed scan start — waiting for a sandbox worker" },
    ],
    finding_counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    failure_reason: null,
  },
  {
    id: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a04",
    target_id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c04",
    target_name: "Internal toolserver (MCP)",
    target_identifier: "https://tools.aurora-labs.dev/mcp",
    target_type: "mcp",
    state: "rejected",
    authorization_status: "pending",
    authorization_method: null,
    created_at: hoursAgo(19),
    started_at: null,
    finished_at: hoursAgo(19),
    progress: 0,
    modules: rejectedModules,
    activity: [
      { id: "d1", at: hoursAgo(19), level: "info", message: "Scan job created" },
      { id: "d2", at: hoursAgo(19), level: "error", message: "Scope gate blocked scan start — no passing authorization record" },
    ],
    finding_counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    failure_reason:
      "No passing authorization record for this target. Complete domain verification before requesting a scan.",
  },
  {
    id: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a05",
    target_id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c03",
    target_name: "Helios public program",
    target_identifier: "https://www.helios-demo.example",
    target_type: "web",
    state: "failed",
    authorization_status: "passing",
    authorization_method: "bounty_checklist",
    created_at: daysAgo(1),
    started_at: daysAgo(1),
    finished_at: daysAgo(1),
    progress: 41,
    modules: failedModules,
    activity: [
      { id: "e1", at: daysAgo(1), level: "info", message: "Scan job created" },
      { id: "e2", at: daysAgo(1), level: "info", message: "Scope gate allowed scan start" },
      { id: "e3", at: daysAgo(1), level: "error", message: "Static analysis failed — sandbox worker lost connection" },
    ],
    finding_counts: { critical: 0, high: 0, medium: 1, low: 0, info: 0 },
    failure_reason:
      "The sandbox worker running static analysis stopped responding. Partial results were discarded.",
  },
];

export function findMockScan(scanId: string): ScanResponse | undefined {
  return mockScans.find((scan) => scan.id === scanId);
}
