import { useState } from "react";
import { Outlet } from "react-router";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * The persistent shell every route renders inside.
 *
 * The ultraviolet gradient at the very top is the only ambient decoration in
 * the app — a single light source above the content, matching the brand idea.
 * It sits behind a fine calibration grid that fades out well before the fold so
 * it never competes with data.
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => {
          setCollapsed((value) => !value);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <div className="relative flex-1 overflow-y-auto">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-uv)_14%,transparent),transparent_70%)]"
          />
          <div
            aria-hidden
            className="bl-grid pointer-events-none absolute inset-x-0 top-0 h-64 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          />

          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:rounded-[var(--radius-control)] focus:border focus:border-uv focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>

          <main
            id="main"
            className="relative mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 sm:py-8"
          >
            <Outlet />
          </main>
        </div>

        <MobileNav />
      </div>
    </div>
  );
}
