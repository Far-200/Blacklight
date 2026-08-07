import type { LucideIcon } from "lucide-react";
import {
  AlertOctagon,
  AlertTriangle,
  Circle,
  CircleDot,
  Info,
} from "lucide-react";

import type { Severity } from "@/types/findings";

/**
 * Severity presentation.
 *
 * Every severity carries a label AND a distinct icon shape, so severity is
 * never communicated by colour alone. Colour classes here are the only place
 * severity colours appear; do not reach for red/orange/amber utilities
 * elsewhere in the app.
 */
export interface SeverityStyle {
  label: string;
  icon: LucideIcon;
  /** Text colour utility. */
  text: string;
  /** Filled chip: background + text + border. */
  chip: string;
  /** Background used for bar segments and rails. */
  bar: string;
  /** Bare colour token, for inline styles that need the raw value. */
  token: string;
}

export const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  critical: {
    label: "Critical",
    icon: AlertOctagon,
    text: "text-critical",
    chip: "bg-critical/12 text-critical border-critical/35",
    bar: "bg-critical",
    token: "var(--color-critical)",
  },
  high: {
    label: "High",
    icon: AlertTriangle,
    text: "text-high",
    chip: "bg-high/12 text-high border-high/35",
    bar: "bg-high",
    token: "var(--color-high)",
  },
  medium: {
    label: "Medium",
    icon: CircleDot,
    text: "text-medium",
    chip: "bg-medium/12 text-medium border-medium/35",
    bar: "bg-medium",
    token: "var(--color-medium)",
  },
  low: {
    label: "Low",
    icon: Circle,
    text: "text-low",
    chip: "bg-low/12 text-low border-low/35",
    bar: "bg-low",
    token: "var(--color-low)",
  },
  info: {
    label: "Informational",
    icon: Info,
    text: "text-info",
    chip: "bg-info/12 text-info border-info/35",
    bar: "bg-info",
    token: "var(--color-info)",
  },
};

/** The single worst severity present, or null when the list is empty. */
export function highestSeverity(
  severities: readonly Severity[],
): Severity | null {
  const order: Severity[] = ["critical", "high", "medium", "low", "info"];
  for (const level of order) {
    if (severities.includes(level)) return level;
  }
  return null;
}
