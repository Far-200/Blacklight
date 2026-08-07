/**
 * Domain vocabulary shared with the backend.
 *
 * Every string literal in this file is copied verbatim from the SQLAlchemy
 * enums in `backend/app/models/`. If a value changes there, it must change
 * here. Nothing else in the frontend is allowed to hard-code these strings —
 * import the constant arrays or the union types instead.
 *
 * Source of truth:
 *   backend/app/models/target.py        -> TargetType, OwnershipMode
 *   backend/app/models/authorization.py -> AuthorizationMethod, AuthorizationStatus
 *   backend/app/models/scan_job.py      -> ScanJobState
 */

export const TARGET_TYPES = ["web", "apk", "sql", "mcp"] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export const OWNERSHIP_MODES = ["self_owned", "bug_bounty"] as const;
export type OwnershipMode = (typeof OWNERSHIP_MODES)[number];

export const AUTHORIZATION_METHODS = [
  "dns_txt",
  "file_challenge",
  "bounty_checklist",
] as const;
export type AuthorizationMethod = (typeof AUTHORIZATION_METHODS)[number];

/** The two methods a user can actively start from the authorization gate. */
export const DOMAIN_CHALLENGE_METHODS = ["dns_txt", "file_challenge"] as const;
export type DomainChallengeMethod = (typeof DOMAIN_CHALLENGE_METHODS)[number];

export const AUTHORIZATION_STATUSES = [
  "pending",
  "passing",
  "denied",
  "expired",
] as const;
export type AuthorizationStatus = (typeof AUTHORIZATION_STATUSES)[number];

export const SCAN_JOB_STATES = [
  "created",
  "awaiting_authorization",
  "queued",
  "running",
  "completed",
  "failed",
  "rejected",
] as const;
export type ScanJobState = (typeof SCAN_JOB_STATES)[number];

/**
 * Test classes the backend refuses unless a target's authorization record
 * explicitly opts into them.
 * Source: RESTRICTED_TEST_CLASSES in backend/app/scope_gate/service.py.
 */
export const RESTRICTED_TEST_CLASSES = [
  "credential_stuffing",
  "brute_force",
  "volumetric",
] as const;
export type RestrictedTestClass = (typeof RESTRICTED_TEST_CLASSES)[number];

/* --- Presentation labels. UI text only; never sent to the backend. --- */

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  web: "Web / Source project",
  apk: "Android package",
  sql: "Database / SQL",
  mcp: "MCP server",
};

export const OWNERSHIP_MODE_LABELS: Record<OwnershipMode, string> = {
  self_owned: "I own this target",
  bug_bounty: "Authorized bug-bounty target",
};

export const AUTHORIZATION_METHOD_LABELS: Record<AuthorizationMethod, string> = {
  dns_txt: "DNS TXT record",
  file_challenge: "Well-known file",
  bounty_checklist: "Bug-bounty scope checklist",
};

export const AUTHORIZATION_STATUS_LABELS: Record<AuthorizationStatus, string> = {
  pending: "Pending",
  passing: "Verified",
  denied: "Denied",
  expired: "Expired",
};

export const SCAN_STATE_LABELS: Record<ScanJobState, string> = {
  created: "Created",
  awaiting_authorization: "Awaiting authorization",
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const TEST_CLASS_LABELS: Record<string, string> = {
  credential_stuffing: "Credential stuffing",
  brute_force: "Brute force",
  volumetric: "Volumetric / load",
  passive_recon: "Passive reconnaissance",
  dependency_analysis: "Dependency analysis",
  secret_detection: "Secret detection",
  static_analysis: "Static analysis",
  config_review: "Configuration review",
  injection: "Injection probing",
  auth_logic: "Authentication logic",
  mcp_tool_abuse: "MCP tool-call abuse",
};

export function isRestrictedTestClass(value: string): boolean {
  return (RESTRICTED_TEST_CLASSES as readonly string[]).includes(value);
}

/** A scan is terminal when the backend state machine will not move it again. */
export function isTerminalScanState(state: ScanJobState): boolean {
  return state === "completed" || state === "failed" || state === "rejected";
}
