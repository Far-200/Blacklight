import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-uv text-white border border-uv-dim hover:bg-uv-dim disabled:bg-uv/40 disabled:border-uv/30",
  secondary:
    "bg-elevated text-fg border border-line-strong hover:bg-raised hover:border-uv/40",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-fg hover:bg-elevated",
  danger:
    "bg-transparent text-danger border border-danger/40 hover:bg-danger/10",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8125rem] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Rendered before the label. Omitted while loading. */
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium",
        "transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
