/**
 * Shared helpers for the mock layer.
 *
 * Everything under src/mocks/ is fixture data for screens whose backend
 * endpoints do not exist yet. It is never imported by a component directly —
 * only by the service modules in src/api/, so there is one seam to cut when the
 * real endpoints land.
 */

/** Fixed at module load so timestamps stay stable within a session. */
export const MOCK_EPOCH = Date.now();

/** An ISO timestamp `minutes` in the past (negative values look forward). */
export function minutesAgo(minutes: number): string {
  return new Date(MOCK_EPOCH - minutes * 60_000).toISOString();
}

export function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60);
}

export function daysAgo(days: number): string {
  return minutesAgo(days * 60 * 24);
}

export function hoursFromNow(hours: number): string {
  return minutesAgo(-hours * 60);
}

/**
 * Simulated network latency, so loading and skeleton states are actually
 * exercised during development rather than flashing past.
 */
export function mockLatency<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

/** Deep-clone a fixture so callers cannot mutate the shared dataset. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
