import { useEffect, useState } from "react";

/**
 * Milliseconds elapsed since `startedAt`, ticking once a second while active.
 * Returns null when there is no start time.
 */
export function useElapsed(
  startedAt: string | null | undefined,
  active: boolean,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [active]);

  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return null;
  return Math.max(0, now - start);
}
