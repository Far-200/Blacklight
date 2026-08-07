import { cn } from "@/utils/cn";

/**
 * A determinate progress bar. `indeterminate` is for work that is genuinely
 * running but cannot report a percentage — it never stands in for "we don't
 * know whether anything is happening".
 */
export function ProgressBar({
  value,
  label,
  tone = "uv",
  size = "md",
  indeterminate = false,
  className,
}: {
  value: number;
  label: string;
  tone?: "uv" | "cyan" | "muted" | "danger";
  size?: "sm" | "md";
  indeterminate?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill =
    tone === "uv"
      ? "bg-uv"
      : tone === "cyan"
        ? "bg-cyan"
        : tone === "danger"
          ? "bg-danger"
          : "bg-line-strong";

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
      className={cn(
        "w-full overflow-hidden rounded-full bg-ink",
        size === "sm" ? "h-1" : "h-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          fill,
          indeterminate && "w-1/3 bl-pulse",
        )}
        style={indeterminate ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );
}
