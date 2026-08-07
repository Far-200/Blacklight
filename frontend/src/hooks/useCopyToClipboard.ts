import { useCallback, useEffect, useRef, useState } from "react";

/** Copy text, reporting a short-lived "copied" state for button feedback. */
export function useCopyToClipboard(resetAfterMs = 2000): {
  copied: boolean;
  failed: boolean;
  copy: (value: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setFailed(false);
      } catch {
        setCopied(false);
        setFailed(true);
      }
      timer.current = setTimeout(() => {
        setCopied(false);
        setFailed(false);
      }, resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copied, failed, copy };
}
