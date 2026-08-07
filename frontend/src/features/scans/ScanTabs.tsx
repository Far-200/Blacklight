import { NavLink } from "react-router";

import { cn } from "@/utils/cn";

/** Sub-navigation across the four views of a single assessment. */
export function ScanTabs({ scanId }: { scanId: string }) {
  const tabs = [
    { to: `/scans/${scanId}`, label: "Progress", end: true },
    { to: `/scans/${scanId}/findings`, label: "Findings", end: false },
    { to: `/scans/${scanId}/report`, label: "Report", end: false },
    { to: `/scans/${scanId}/fixes`, label: "Fixes", end: false },
  ];

  return (
    <nav aria-label="Assessment views" className="mb-6 border-b border-line">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "inline-block border-b-2 px-3 py-2.5 text-[0.8125rem] whitespace-nowrap transition-colors",
                  isActive
                    ? "border-uv font-medium text-fg"
                    : "border-transparent text-muted hover:border-line-strong hover:text-fg",
                )
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
