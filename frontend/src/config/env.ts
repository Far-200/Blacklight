/**
 * The only place in the frontend that reads `import.meta.env`.
 *
 * Everything else imports `env` from here, so switching between mock data and
 * the real orchestrator is a single, greppable decision rather than a flag
 * scattered through components.
 */

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value !== "string") return fallback;
  return value === "true" || value === "1";
}

export interface Env {
  /** Prefix applied to every request the typed client makes. */
  apiBaseUrl: string;
  /** When true, unimplemented endpoints resolve from src/mocks/. */
  useMocks: boolean;
  isDev: boolean;
}

export const env: Env = {
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, "/api"),
  useMocks: readBoolean(import.meta.env.VITE_USE_MOCKS, true),
  isDev: import.meta.env.DEV,
};

/**
 * Placeholder identity.
 *
 * Authentication and RBAC do not exist in the backend yet; `user_id` is still
 * accepted as a query parameter on the scope-gate endpoints. Until real auth
 * lands, the client sends this fixed development UUID and every call site that
 * needs it imports it from here so there is exactly one thing to delete later.
 */
export const DEV_USER_ID = "00000000-0000-4000-8000-000000000001";
