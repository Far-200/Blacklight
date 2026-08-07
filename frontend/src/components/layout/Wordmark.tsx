import { cn } from "@/utils/cn";

/**
 * The Blacklight mark.
 *
 * The supplied logo artwork is a dark-on-light lockup, so the shell redraws it:
 * the rounded aperture and its diagonal beam as inline SVG that inherits the
 * interface's own ultraviolet. The raster assets stay in /public for the
 * favicon and anywhere the full lockup is wanted.
 */
export function Wordmark({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="size-7 shrink-0 overflow-visible"
      >
        <defs>
          <linearGradient id="bl-beam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-uv-dim)" />
            <stop offset="50%" stopColor="var(--color-uv-glow)" />
            <stop offset="100%" stopColor="var(--color-uv-dim)" />
          </linearGradient>
        </defs>
        <rect
          x="5.5"
          y="5.5"
          width="21"
          height="21"
          rx="6"
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="1.75"
        />
        <path
          d="M3 3 L29 29"
          stroke="url(#bl-beam)"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </svg>

      {collapsed ? null : (
        <span
          className="text-[0.9375rem] leading-none font-semibold tracking-[0.14em] uppercase"
          style={{ fontVariationSettings: '"wdth" 118' }}
        >
          <span className="text-muted">Black</span>
          <span className="text-uv-glow">light</span>
        </span>
      )}
      <span className="sr-only">Blacklight</span>
    </span>
  );
}
