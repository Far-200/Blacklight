import type { LucideIcon } from "lucide-react";
import {
  Ban,
  CircleCheck,
  CircleDashed,
  CircleSlash,
  Clock,
  Hourglass,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  TriangleAlert,
} from "lucide-react";

import type { AuthorizationStatus, ScanJobState } from "@/types/domain";
import {
  AUTHORIZATION_STATUS_LABELS,
  SCAN_STATE_LABELS,
} from "@/types/domain";
import type { FindingStatus } from "@/types/findings";
import { FINDING_STATUS_LABELS } from "@/types/findings";
import { cn } from "@/utils/cn";

interface Appearance {
  label: string;
  icon: LucideIcon;
  className: string;
  /** Applied to the icon only, for states that are genuinely in motion. */
  iconClassName?: string;
}

const NEUTRAL = "bg-elevated text-muted border-line-strong";
const OK = "bg-ok/10 text-ok border-ok/30";
const WARN = "bg-warn/10 text-warn border-warn/30";
const DANGER = "bg-danger/10 text-danger border-danger/30";
const ACTIVE = "bg-uv/12 text-uv-glow border-uv/35";
const INFO = "bg-cyan/10 text-cyan border-cyan/30";

const AUTHORIZATION: Record<AuthorizationStatus, Appearance> = {
  pending: {
    label: AUTHORIZATION_STATUS_LABELS.pending,
    icon: ShieldQuestion,
    className: WARN,
  },
  passing: {
    label: AUTHORIZATION_STATUS_LABELS.passing,
    icon: ShieldCheck,
    className: OK,
  },
  denied: {
    label: AUTHORIZATION_STATUS_LABELS.denied,
    icon: ShieldX,
    className: DANGER,
  },
  expired: {
    label: AUTHORIZATION_STATUS_LABELS.expired,
    icon: ShieldAlert,
    className: NEUTRAL,
  },
};

const SCAN: Record<ScanJobState, Appearance> = {
  created: { label: SCAN_STATE_LABELS.created, icon: CircleDashed, className: NEUTRAL },
  awaiting_authorization: {
    label: SCAN_STATE_LABELS.awaiting_authorization,
    icon: ShieldQuestion,
    className: WARN,
  },
  queued: { label: SCAN_STATE_LABELS.queued, icon: Hourglass, className: INFO },
  running: {
    label: SCAN_STATE_LABELS.running,
    icon: Loader2,
    className: ACTIVE,
    iconClassName: "animate-spin",
  },
  completed: { label: SCAN_STATE_LABELS.completed, icon: CircleCheck, className: OK },
  failed: { label: SCAN_STATE_LABELS.failed, icon: TriangleAlert, className: DANGER },
  rejected: { label: SCAN_STATE_LABELS.rejected, icon: Ban, className: DANGER },
};

const FINDING: Record<FindingStatus, Appearance> = {
  open: { label: FINDING_STATUS_LABELS.open, icon: CircleDashed, className: NEUTRAL },
  reviewing: { label: FINDING_STATUS_LABELS.reviewing, icon: Clock, className: INFO },
  resolved: { label: FINDING_STATUS_LABELS.resolved, icon: CircleCheck, className: OK },
  accepted_risk: {
    label: FINDING_STATUS_LABELS.accepted_risk,
    icon: CircleSlash,
    className: WARN,
  },
};

type BadgeProps =
  | { kind: "authorization"; status: AuthorizationStatus; className?: string }
  | { kind: "scan"; status: ScanJobState; className?: string }
  | { kind: "finding"; status: FindingStatus; className?: string };

/** State badge. Like SeverityBadge, every state has its own icon shape. */
export function StatusBadge(props: BadgeProps) {
  const appearance =
    props.kind === "authorization"
      ? AUTHORIZATION[props.status]
      : props.kind === "scan"
        ? SCAN[props.status]
        : FINDING[props.status];

  const Icon = appearance.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        appearance.className,
        props.className,
      )}
    >
      <Icon aria-hidden className={cn("size-3.5", appearance.iconClassName)} />
      {appearance.label}
    </span>
  );
}
