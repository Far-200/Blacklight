import { FlaskConical, Plug, PlugZap, RefreshCw } from "lucide-react";

import { env } from "@/config/env";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

/**
 * Live state of the orchestrator connection.
 *
 * This polls the real GET /health even in mock mode, because "we are showing
 * you fixtures" and "the backend is down" are different facts and the user
 * needs both.
 */
export function ConnectionIndicator({ compact = false }: { compact?: boolean }) {
  const { state, lastCheckedAt, refetch } = useBackendHealth();

  const appearance =
    state === "online"
      ? { dot: "bg-ok", text: "text-ok", label: "Orchestrator online", icon: PlugZap }
      : state === "offline"
        ? { dot: "bg-danger", text: "text-danger", label: "Orchestrator unreachable", icon: Plug }
        : { dot: "bg-muted", text: "text-muted", label: "Checking orchestrator", icon: RefreshCw };

  const Icon = appearance.icon;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5"
        title={appearance.label}
        aria-label={appearance.label}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            appearance.dot,
            state === "checking" && "bl-pulse",
          )}
        />
        <Icon aria-hidden className={cn("size-3.5", appearance.text)} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={refetch}
      className="group flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-line bg-ink px-2.5 py-2 text-left transition-colors hover:border-line-strong"
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          appearance.dot,
          state === "checking" && "bl-pulse",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-xs font-medium", appearance.text)}>
          {appearance.label}
        </span>
        <span className="block truncate font-mono text-[0.625rem] text-faint">
          {state === "checking"
            ? "127.0.0.1:8000"
            : `checked ${formatRelative(
                lastCheckedAt ? new Date(lastCheckedAt).toISOString() : undefined,
              )}`}
        </span>
      </span>
      <RefreshCw
        aria-hidden
        className="size-3 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
      />
      <span className="sr-only">Check again</span>
    </button>
  );
}

/**
 * Development-only banner chip. Nothing on screen is real data while this is
 * showing, and that should never be a surprise.
 */
export function MockModeIndicator({ compact = false }: { compact?: boolean }) {
  if (!env.useMocks) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-uv/30 bg-uv/8 font-mono text-uv-glow",
        compact ? "px-1.5 py-0.5 text-[0.625rem]" : "px-2 py-1 text-[0.6875rem]",
      )}
      title="VITE_USE_MOCKS=true — screens without a backend endpoint are showing fixture data"
    >
      <FlaskConical aria-hidden className="size-3" />
      {compact ? "MOCK" : "MOCK DATA"}
    </span>
  );
}
