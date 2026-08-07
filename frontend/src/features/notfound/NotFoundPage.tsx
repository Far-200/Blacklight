import { Link } from "react-router";
import { ScanSearch } from "lucide-react";

import { SectionLabel } from "@/components/ui/SectionLabel";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <SectionLabel className="justify-center">HTTP 404</SectionLabel>

      <span className="mt-6 grid size-12 place-items-center rounded-[var(--radius-panel)] border border-line bg-elevated">
        <ScanSearch aria-hidden className="size-5 text-faint" />
      </span>

      <h1
        className="mt-5 text-2xl font-semibold"
        style={{ fontVariationSettings: '"wdth" 112' }}
      >
        Nothing at this route
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        The page you asked for does not exist. If you followed a link from
        inside Blacklight, that link is wrong and worth reporting.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/dashboard"
          className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-uv-dim bg-uv px-4 text-sm font-medium text-white transition-colors hover:bg-uv-dim"
        >
          Go to dashboard
        </Link>
        <Link
          to="/scans"
          className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-line-strong bg-elevated px-4 text-sm font-medium text-fg transition-colors hover:bg-raised"
        >
          View scans
        </Link>
      </div>
    </div>
  );
}
