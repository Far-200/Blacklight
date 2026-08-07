import { TriangleAlert } from "lucide-react";

import { NotImplementedOnBackendError } from "@/api/client";
import { Button } from "./Button";

/**
 * Errors say what happened and what to do about it. They do not apologise and
 * they are never vague.
 *
 * The unimplemented-endpoint case gets its own message because it is not a
 * fault — it is a screen running ahead of the backend, and the fix is a config
 * flag, not a retry.
 */
export function ErrorState({
  error,
  onRetry,
  title = "Could not load this view",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const notImplemented = error instanceof NotImplementedOnBackendError;
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-panel)] border border-danger/30 bg-danger/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
        <div>
          <h3 className="text-sm font-semibold text-fg">
            {notImplemented ? "This screen has no backend endpoint yet" : title}
          </h3>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            {message}
          </p>
        </div>
      </div>
      {onRetry && !notImplemented ? (
        <Button size="sm" onClick={onRetry} className="ml-7">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
