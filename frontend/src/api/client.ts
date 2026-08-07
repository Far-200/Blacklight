import { env } from "@/config/env";

/**
 * The one place the frontend talks to the network.
 *
 * Nothing outside `src/api/` may call `fetch` directly. Keeping a single client
 * means auth headers, error shaping and the base URL each have exactly one
 * implementation to change when the backend grows real authentication.
 */

/** A non-2xx response from the orchestrator. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | undefined;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** The request never left the browser — backend down, DNS, CORS, offline. */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Thrown when a screen asks for something the backend has not implemented and
 * mock mode is switched off. This is deliberately loud: it is never correct to
 * fall back to fabricated data while claiming to be talking to a real server.
 */
export class NotImplementedOnBackendError extends Error {
  readonly suggestedEndpoint: string;

  constructor(suggestedEndpoint: string) {
    super(
      `No backend endpoint exists yet for ${suggestedEndpoint}. ` +
        `Run with VITE_USE_MOCKS=true, or implement it — see frontend/API_GAPS.md.`,
    );
    this.name = "NotImplementedOnBackendError";
    this.suggestedEndpoint = suggestedEndpoint;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** JSON-serialisable request body. */
  body?: unknown;
  /** Appended as query parameters; undefined values are dropped. */
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildUrl(
  path: string,
  query: RequestOptions["query"],
): string {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${suffix}`;

  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `${url}?${serialized}` : url;
}

/** FastAPI returns `{ "detail": ... }` on error; pull out something readable. */
async function extractDetail(response: Response): Promise<string | undefined> {
  try {
    const payload: unknown = await response.json();
    if (payload && typeof payload === "object" && "detail" in payload) {
      const detail = (payload as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
      return JSON.stringify(detail);
    }
  } catch {
    // Not JSON, or an empty body. Fall through to the status-only message.
  }
  return undefined;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, query, signal } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new NetworkError(
      "Could not reach the Blacklight orchestrator. Confirm it is running on http://127.0.0.1:8000.",
    );
  }

  if (!response.ok) {
    const detail = await extractDetail(response);
    throw new ApiError(
      response.status,
      detail ?? `Request failed with HTTP ${response.status}`,
      detail,
    );
  }

  if (response.status === 204) return undefined as TResponse;
  return (await response.json()) as TResponse;
}
