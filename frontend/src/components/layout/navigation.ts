import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutDashboard,
  Radar,
  Settings,
  Crosshair,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Highlight the item for any route beginning with this prefix. */
  matchPrefix?: string;
}

/** The product's primary navigation, shared by the sidebar and mobile bar. */
export const PRIMARY_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets/new", label: "New assessment", icon: Crosshair },
  { to: "/scans", label: "Scans", icon: Radar, matchPrefix: "/scans" },
  { to: "/reports", label: "Reports", icon: FileText, matchPrefix: "/reports" },
  { to: "/settings", label: "Settings", icon: Settings },
];
