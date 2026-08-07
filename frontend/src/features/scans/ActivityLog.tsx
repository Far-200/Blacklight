import type { ScanActivityEntry } from "@/api/contracts";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

/**
 * The scan's activity log.
 *
 * Monospace throughout, because these are machine-emitted lines that a reader
 * scans by timestamp and level rather than reads as prose.
 */
export function ActivityLog({ entries }: { entries: ScanActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-[0.8125rem] text-muted">
        No activity recorded for this assessment yet.
      </p>
    );
  }

  return (
    <ol className="space-y-1.5 font-mono text-[0.75rem] leading-relaxed">
      {[...entries].reverse().map((entry) => (
        <li key={entry.id} className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span className="shrink-0 text-faint tabular-nums">
            {formatDateTime(entry.at)}
          </span>
          <span
            className={cn(
              "w-10 shrink-0 uppercase",
              entry.level === "error"
                ? "text-danger"
                : entry.level === "warn"
                  ? "text-warn"
                  : "text-cyan-dim",
            )}
          >
            {entry.level}
          </span>
          <span className="min-w-0 flex-1 text-muted">{entry.message}</span>
        </li>
      ))}
    </ol>
  );
}
