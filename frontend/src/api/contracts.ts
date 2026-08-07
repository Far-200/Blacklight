import type {
  AuthorizationMethod,
  AuthorizationStatus,
  DomainChallengeMethod,
  OwnershipMode,
  ScanJobState,
  TargetType,
} from "@/types/domain";

/**
 * Wire shapes.
 *
 * This file is split in two on purpose.
 *
 *   §1 IMPLEMENTED — transcribed from backend/app/schemas/scope_gate.py and
 *      backend/app/routers/scope_gate.py. These are real.
 *
 *   §2 PROVISIONAL — frontend proposals for endpoints that do not exist. They
 *      are only ever satisfied by src/mocks/. Do not treat them as agreed.
 *      Documented in frontend/API_GAPS.md.
 */

/* ========================================================================== */
/* §1 IMPLEMENTED — backed by real FastAPI routes                             */
/* ========================================================================== */

/** GET /health */
export interface HealthResponse {
  status: string;
}

/** POST /scope-gate/challenges */
export interface ChallengeCreateRequest {
  target_id: string;
  method: DomainChallengeMethod;
}

export interface ChallengeResponse {
  id: string;
  target_id: string;
  method: AuthorizationMethod;
  token: string;
  instructions: string;
  expires_at: string;
}

/** POST /scope-gate/challenges/verify?user_id=... */
export interface ChallengeVerifyRequest {
  challenge_id: string;
}

export interface AuthorizationRecordResponse {
  id: string;
  target_id: string;
  method: AuthorizationMethod;
  status: AuthorizationStatus;
  decided_at: string;
  expires_at: string | null;
}

/** POST /scope-gate/bounty-checklist?user_id=... */
export interface BountyChecklistRequest {
  target_id: string;
  in_scope_assets: string[];
  out_of_scope_assets: string[];
  disallowed_test_classes: string[];
  allowed_test_classes: string[];
}

/** POST /scope-gate/scan-start?user_id=... */
export interface ScanStartRequest {
  job_id: string;
  requested_test_classes: string[];
}

export interface ScanStartResponse {
  allowed: boolean;
  job_id: string;
  job_state: ScanJobState;
}

/* ========================================================================== */
/* §2 PROVISIONAL — no backend endpoint exists. Mock-only.                    */
/* ========================================================================== */

/** PROVISIONAL — proposed POST /targets */
export interface TargetCreateRequest {
  name: string;
  target_type: TargetType;
  ownership_mode: OwnershipMode;
  /** URL, endpoint, connection identifier, or upload reference. */
  identifier: string;
  root_domain?: string;
  bounty_program?: string;
  repository_url?: string;
  notes?: string;
}

/** PROVISIONAL — proposed GET /targets, GET /targets/{id} */
export interface TargetResponse {
  id: string;
  name: string;
  target_type: TargetType;
  ownership_mode: OwnershipMode;
  identifier: string;
  root_domain: string | null;
  bounty_program: string | null;
  repository_url: string | null;
  notes: string | null;
  created_at: string;
  /** Denormalised for the authorization gate; not an agreed field. */
  authorization_status: AuthorizationStatus | null;
}

/** PROVISIONAL — proposed POST /scans */
export interface ScanCreateRequest {
  target_id: string;
  requested_test_classes: string[];
}

/** PROVISIONAL — proposed GET /scans, GET /scans/{id} */
export interface ScanResponse {
  id: string;
  target_id: string;
  target_name: string;
  target_identifier: string;
  target_type: TargetType;
  state: ScanJobState;
  authorization_status: AuthorizationStatus | null;
  authorization_method: AuthorizationMethod | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  /** 0–100 across all modules. */
  progress: number;
  modules: ScanModuleProgress[];
  activity: ScanActivityEntry[];
  /** Populated once findings exist; zeroed while queued. */
  finding_counts: Record<string, number>;
  /** Present when state is failed or rejected. */
  failure_reason: string | null;
}

/** PROVISIONAL — module-level progress. Modules are not implemented. */
export interface ScanModuleProgress {
  key: string;
  label: string;
  state: "pending" | "running" | "completed" | "skipped" | "failed";
  progress: number;
  detail: string | null;
}

/** PROVISIONAL — activity log line. */
export interface ScanActivityEntry {
  id: string;
  at: string;
  level: "info" | "warn" | "error";
  message: string;
}

/** PROVISIONAL — proposed GET /dashboard/summary. */
export interface DashboardSummary {
  total_scans: number;
  active_scans: number;
  critical_findings: number;
  resolved_findings: number;
  severity_counts: Record<string, number>;
  recent_scan_ids: string[];
}
