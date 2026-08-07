import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/** An empty screen is an invitation to act, so an action belongs here. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-11 place-items-center rounded-[var(--radius-panel)] border border-line bg-elevated">
        <Icon aria-hidden className="size-5 text-faint" />
      </span>
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
