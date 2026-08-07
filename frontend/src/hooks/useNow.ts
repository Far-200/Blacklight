import { useEffect, useState } from "react";

/**
 * The current time as state, re-read on an interval.
 *
 * Reading `Date.now()` during render makes a component impure — the same props
 * can produce different output. Anything that compares against "now" (token
 * expiry, elapsed time) reads it from here instead.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}
