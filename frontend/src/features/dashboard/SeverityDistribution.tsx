import type { Severity, SeverityCounts } from "@/types/findings";
import { SEVERITIES } from "@/types/findings";
import { SEVERITY_STYLES } from "@/utils/severity";
import { cn } from "@/utils/cn";

/**
 * Severity distribution as a single proportional bar plus a legend.
 *
 * A bar rather than a chart: there are five categories and one dimension, so a
 * charting library would add weight without adding information. The legend
 * carries icon, label and count, so the bar itself is never the only way to
 * read the data.
 */
export function SeverityDistribution({ counts }: { counts: SeverityCounts }) {
  const total = SEVERITIES.reduce((sum, severity) => sum + counts[severity], 0);

  if (total === 0) {
    return (
      <p className="text-[0.8125rem] text-muted">
        No findings recorded yet. The distribution appears once an assessment
        completes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-ink"
        role="img"
        aria-label={SEVERITIES.map(
          (severity) =>
            `${SEVERITY_STYLES[severity].label}: ${counts[severity]}`,
        ).join(", ")}
      >
        {SEVERITIES.map((severity) => {
          const value = counts[severity];
          if (value === 0) return null;
          return (
            <span
              key={severity}
              className={SEVERITY_STYLES[severity].bar}
              style={{ width: `${(value / total) * 100}%` }}
            />
          );
        })}
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {SEVERITIES.map((severity) => (
          <SeverityLegendRow
            key={severity}
            severity={severity}
            count={counts[severity]}
            total={total}
          />
        ))}
      </ul>
    </div>
  );
}

function SeverityLegendRow({
  severity,
  count,
  total,
}: {
  severity: Severity;
  count: number;
  total: number;
}) {
  const style = SEVERITY_STYLES[severity];
  const Icon = style.icon;

  return (
    <li className="flex items-center gap-2">
      <Icon
        aria-hidden
        className={cn("size-3.5 shrink-0", count === 0 ? "text-faint" : style.text)}
      />
      <span
        className={cn(
          "flex-1 truncate text-[0.8125rem]",
          count === 0 ? "text-faint" : "text-muted",
        )}
      >
        {style.label}
      </span>
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          count === 0 ? "text-faint" : "text-fg",
        )}
      >
        {count}
      </span>
      <span className="w-9 text-right font-mono text-[0.625rem] text-faint tabular-nums">
        {Math.round((count / total) * 100)}%
      </span>
    </li>
  );
}
