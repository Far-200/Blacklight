import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/utils/cn";

/**
 * A single headline number. The label sits above the value so the eye reads
 * what it is before how much — a count of critical findings is not the kind of
 * number anyone should have to guess the meaning of.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "critical" | "active" | "ok";
  to?: string;
}) {
  const accent =
    tone === "critical"
      ? "text-critical"
      : tone === "active"
        ? "text-uv-glow"
        : tone === "ok"
          ? "text-ok"
          : "text-fg";

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
        {Icon ? <Icon aria-hidden className={cn("size-4", accent)} /> : null}
      </div>
      <p
        className={cn(
          "mt-3 text-3xl leading-none font-semibold tabular-nums",
          accent,
        )}
        style={{ fontVariationSettings: '"wdth" 118' }}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-[0.8125rem] text-muted">{hint}</p> : null}
    </>
  );

  const base =
    "block rounded-[var(--radius-panel)] border border-line bg-surface p-4 sm:p-5";

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          base,
          "transition-colors duration-150 hover:border-uv/40 hover:bg-elevated",
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={base}>{content}</div>;
}
