import { Link } from "react-router";
import { Plus } from "lucide-react";

import { ConnectionIndicator, MockModeIndicator } from "./ConnectionIndicator";
import { Wordmark } from "./Wordmark";

/**
 * The shell's top edge. On desktop it carries only status and the primary
 * action; the wordmark lives in the sidebar. On mobile the wordmark moves here
 * because the sidebar is gone.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-ink/90 px-4 backdrop-blur-sm sm:px-6">
      <Link to="/dashboard" className="rounded-sm lg:hidden">
        <Wordmark />
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <MockModeIndicator compact />
        <span className="lg:hidden">
          <ConnectionIndicator compact />
        </span>
        <Link
          to="/targets/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] border border-uv-dim bg-uv px-3 text-[0.8125rem] font-medium text-white transition-colors hover:bg-uv-dim"
        >
          <Plus aria-hidden className="size-3.5" />
          New assessment
        </Link>
      </div>
    </header>
  );
}
