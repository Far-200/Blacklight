import { cn } from "@/utils/cn";

/** A single shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bl-shimmer rounded-[var(--radius-control)]", className)}
    />
  );
}

/** Rows of placeholder text, sized to roughly match the content they stand in for. */
export function LoadingSkeleton({
  rows = 3,
  className,
  label = "Loading",
}: {
  rows?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === rows - 1 ? "w-2/5" : "w-full")}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
