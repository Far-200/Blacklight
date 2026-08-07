import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Info, ShieldAlert, TriangleAlert } from "lucide-react";

import { cn } from "@/utils/cn";

type Tone = "info" | "warn" | "danger" | "uv";

const TONES: Record<Tone, { wrapper: string; icon: string; defaultIcon: LucideIcon }> = {
  info: {
    wrapper: "border-cyan/25 bg-cyan/5",
    icon: "text-cyan",
    defaultIcon: Info,
  },
  warn: {
    wrapper: "border-warn/30 bg-warn/5",
    icon: "text-warn",
    defaultIcon: TriangleAlert,
  },
  danger: {
    wrapper: "border-danger/30 bg-danger/5",
    icon: "text-danger",
    defaultIcon: TriangleAlert,
  },
  uv: {
    wrapper: "border-uv/30 bg-uv/5",
    icon: "text-uv-glow",
    defaultIcon: ShieldAlert,
  },
};

/** A short, bounded statement the reader must not miss. */
export function InlineNotice({
  tone = "info",
  title,
  icon,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  const config = TONES[tone];
  const Icon = icon ?? config.defaultIcon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-control)] border p-3",
        config.wrapper,
        className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", config.icon)} />
      <div className="min-w-0 text-[0.8125rem] leading-relaxed text-muted">
        {title ? <p className="font-medium text-fg">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
