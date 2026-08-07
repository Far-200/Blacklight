/**
 * ⚠️ TEMPORARY, FRONTEND-ONLY VIEW MODELS.
 *
 * None of the shapes in this file are an agreed backend contract. The backend
 * has no findings, report or fix APIs yet (see frontend/API_GAPS.md). These
 * types exist so the findings, report and fixes screens can be designed and
 * reviewed against realistic data.
 *
 * MUST be replaced by the shared findings schema once Edwin and Farhaan agree
 * it. When that happens, delete this file and re-point the imports — do not
 * quietly widen these types to absorb the real schema.
 */

export const SEVERITIES = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const;
export type Severity = (typeof SEVERITIES)[number];

export const FINDING_STATUSES = [
  "open",
  "reviewing",
  "resolved",
  "accepted_risk",
] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

/** TEMPORARY — replace with the shared findings schema. */
export interface FindingViewModel {
  id: string;
  title: string;
  severity: Severity;
  /** 0–1. How confident the detecting tool is, not a probability of exploit. */
  confidence: number;
  status: FindingStatus;
  /** Detecting tool, e.g. "Semgrep", "gitleaks", "Nuclei". */
  source: string;
  /** The asset the finding was observed on: host, endpoint, package, tool name. */
  asset: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  evidence: string;
  description: string;
  impact: string;
  remediation: string;
  cwe?: string;
  cvss?: number;
  detectedAt: string;
  /** How many raw scanner results were collapsed into this one finding. */
  duplicateCount: number;
  /** Present when a proposed patch exists for this finding. */
  fixId?: string;
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Informational",
};

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  accepted_risk: "Accepted risk",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export type SeverityCounts = Record<Severity, number>;

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

export function countBySeverity(findings: FindingViewModel[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}

/** TEMPORARY — replace alongside the findings schema. */
export interface ProposedFixViewModel {
  id: string;
  findingId: string;
  findingTitle: string;
  severity: Severity;
  filePath: string;
  summary: string;
  rationale: string;
  /** 0–1. Confidence that the patch compiles and addresses the finding. */
  confidence: number;
  /** Unified-diff-style hunks, pre-split for a lightweight custom renderer. */
  hunks: DiffHunk[];
  /** Raw unified diff, offered verbatim by the copy-patch action. */
  patch: string;
  generatedAt: string;
  reviewed: boolean;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffLine {
  kind: "context" | "added" | "removed";
  /** Line number in the original file. Absent for added lines. */
  oldLine?: number;
  /** Line number in the patched file. Absent for removed lines. */
  newLine?: number;
  content: string;
}

/** TEMPORARY — replace alongside the findings schema. */
export interface ReportViewModel {
  scanId: string;
  targetName: string;
  targetIdentifier: string;
  generatedAt: string;
  overallRisk: Severity;
  executiveSummary: string;
  scope: {
    inScope: string[];
    outOfScope: string[];
    authorizationMethod: string;
    authorizationDecidedAt: string;
  };
  methodology: string[];
  severityCounts: SeverityCounts;
  prioritizedFindingIds: string[];
  limitations: string[];
  authorizationStatement: string;
}
