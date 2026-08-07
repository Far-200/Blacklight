import type { Severity } from "@/types/findings";
import { cn } from "@/utils/cn";
import { SEVERITY_STYLES } from "@/utils/severity";

/**
 * Severity, always as icon + text.
 *
 * Colour is a reinforcement here, never the carrier. Each severity has a
 * distinct icon shape so the badge still reads correctly in greyscale, at low
 * contrast, or to someone who cannot distinguish red from orange.
 */
export function SeverityBadge({
  severity,
  size = "md",
  className,
}: {
  severity: Severity;
  size?: "sm" | "md";
  className?: string;
}) {
  const style = SEVERITY_STYLES[severity];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border font-medium",
        style.chip,
        size === "sm"
          ? "px-1.5 py-0.5 text-[0.6875rem]"
          : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3" : "size-3.5"} />
      {style.label}
    </span>
  );
}
