import { NavLink, useLocation } from "react-router";
import { PanelLeftClose, PanelLeftOpen, UserRound } from "lucide-react";

import { cn } from "@/utils/cn";

import { ConnectionIndicator } from "./ConnectionIndicator";
import { PRIMARY_NAV } from "./navigation";
import { Wordmark } from "./Wordmark";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "hidden shrink-0 flex-col border-r border-line bg-ink lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-line",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <NavLink to="/dashboard" className="rounded-sm">
          <Wordmark collapsed={collapsed} />
        </NavLink>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {PRIMARY_NAV.map((item) => {
          const active = item.matchPrefix
            ? pathname.startsWith(item.matchPrefix)
            : pathname === item.to;

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-control)] px-2.5 py-2 text-[0.8125rem] transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "bl-rail bg-elevated font-medium text-fg"
                    : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                <item.icon aria-hidden className="size-4 shrink-0" />
                {collapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 border-t border-line p-2">
        {collapsed ? null : <ConnectionIndicator />}

        {/*
          Placeholder only. There is no authentication in the backend, so there
          is no session to sign out of and no team to switch between. This is
          deliberately inert rather than a fake login.
        */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 text-muted",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong bg-elevated">
            <UserRound aria-hidden className="size-3.5 text-faint" />
          </span>
          {collapsed ? null : (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-fg">Local user</span>
              <span className="block truncate text-[0.625rem] text-faint">
                Accounts not implemented
              </span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className={cn(
            "flex w-full items-center gap-3 rounded-[var(--radius-control)] px-2.5 py-2 text-[0.8125rem] text-muted transition-colors hover:bg-elevated hover:text-fg",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden className="size-4" />
          ) : (
            <PanelLeftClose aria-hidden className="size-4" />
          )}
          {collapsed ? null : "Collapse"}
        </button>
      </div>
    </nav>
  );
}
