import { apiRequest } from "./client";
import type { HealthResponse } from "./contracts";

/**
 * GET /health — implemented in backend/app/main.py.
 *
 * Called even in mock mode: the connection indicator should tell the truth
 * about the orchestrator regardless of where screen data comes from.
 */
export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/health", { signal });
}
