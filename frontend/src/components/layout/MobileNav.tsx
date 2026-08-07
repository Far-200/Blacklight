import { NavLink, useLocation } from "react-router";

import { cn } from "@/utils/cn";

import { PRIMARY_NAV } from "./navigation";

/** Compact bottom navigation for narrow viewports. */
export function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 border-t border-line bg-ink/95 backdrop-blur-sm lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {PRIMARY_NAV.map((item) => {
          const active = item.matchPrefix
            ? pathname.startsWith(item.matchPrefix)
            : pathname === item.to;

          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[0.625rem] transition-colors",
                  active ? "text-uv-glow" : "text-muted",
                )}
              >
                <item.icon aria-hidden className="size-4.5" />
                <span className="max-w-full truncate">
                  {item.label === "New assessment" ? "New" : item.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
