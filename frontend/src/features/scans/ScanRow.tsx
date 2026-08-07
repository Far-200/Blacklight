import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

import type { ScanResponse } from "@/api/contracts";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TARGET_TYPE_LABELS } from "@/types/domain";
import type { Severity } from "@/types/findings";
import { SEVERITIES } from "@/types/findings";
import { formatRelative } from "@/utils/format";
import { SEVERITY_STYLES } from "@/utils/severity";
import { cn } from "@/utils/cn";

/**
 * One scan, as a row.
 *
 * Used on the dashboard and on the scans index so a scan looks the same
 * wherever it is listed. Running scans carry the ultraviolet sweep; nothing
 * else does.
 */
export function ScanRow({ scan }: { scan: ScanResponse }) {
  const running = scan.state === "running";
  const findingTotal = SEVERITIES.reduce(
    (sum, severity) => sum + (scan.finding_counts[severity] ?? 0),
    0,
  );

  return (
    <li>
      <Link
        to={`/scans/${scan.id}`}
        className={cn(
          "group block px-4 py-3.5 transition-colors hover:bg-elevated sm:px-5",
          running && "bl-sweep",
        )}
      >
        <div className="relative z-1 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-fg">
                {scan.target_name}
              </span>
              <StatusBadge kind="scan" status={scan.state} />
            </div>

            <p className="mt-1 truncate font-mono text-xs text-faint">
              {scan.target_identifier}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{TARGET_TYPE_LABELS[scan.target_type]}</span>
              <span aria-hidden className="text-faint">
                ·
              </span>
              <span>{formatRelative(scan.created_at)}</span>
              {findingTotal > 0 ? (
                <>
                  <span aria-hidden className="text-faint">
                    ·
                  </span>
                  <SeverityTally counts={scan.finding_counts} />
                </>
              ) : null}
            </div>

            {running ? (
              <ProgressBar
                className="mt-3 max-w-sm"
                size="sm"
                value={scan.progress}
                label={`${scan.target_name} scan progress`}
              />
            ) : null}
          </div>

          <ChevronRight
            aria-hidden
            className="mt-1 size-4 shrink-0 text-faint transition-colors group-hover:text-uv-glow"
          />
        </div>
      </Link>
    </li>
  );
}

/** Compact per-severity counts. Icon plus number, never a bare colour dot. */
function SeverityTally({ counts }: { counts: Record<string, number> }) {
  const present = SEVERITIES.filter((severity) => (counts[severity] ?? 0) > 0);
  if (present.length === 0) return null;

  return (
    <span className="flex items-center gap-2">
      {present.map((severity: Severity) => {
        const style = SEVERITY_STYLES[severity];
        const Icon = style.icon;
        return (
          <span
            key={severity}
            className="inline-flex items-center gap-1"
            title={`${style.label}: ${counts[severity]}`}
          >
            <Icon aria-hidden className={cn("size-3", style.text)} />
            <span className="font-mono tabular-nums">{counts[severity]}</span>
            <span className="sr-only">{style.label}</span>
          </span>
        );
      })}
    </span>
  );
}
