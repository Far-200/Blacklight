import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * A monospace micro-label preceded by a hairline rule.
 *
 * Used to mark facts the system derived rather than copy someone wrote — scan
 * metadata, scope records, evidence provenance. Editorial headings use <h2>
 * instead, so the two never blur together.
 */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span aria-hidden className="h-px w-4 bg-line-strong" />
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-faint">
        {children}
      </span>
    </div>
  );
}
