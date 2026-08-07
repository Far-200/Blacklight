import { Ban, Check, CircleDashed, TriangleAlert } from "lucide-react";

import type { ScanJobState } from "@/types/domain";
import { SCAN_STATE_LABELS } from "@/types/domain";
import { cn } from "@/utils/cn";

/**
 * The scan job state machine, drawn.
 *
 * The happy path is a real sequence — created → awaiting authorization →
 * queued → running → completed — so numbering-free step markers are
 * appropriate here. `failed` and `rejected` are exits from that path rather
 * than positions on it, so they replace the tail instead of extending it.
 */
const HAPPY_PATH: ScanJobState[] = [
  "created",
  "awaiting_authorization",
  "queued",
  "running",
  "completed",
];

export function ScanStateTimeline({ state }: { state: ScanJobState }) {
  const terminalFailure = state === "failed" || state === "rejected";
  const currentIndex = HAPPY_PATH.indexOf(state);

  // A rejected job never got past the authorization check; a failed job stopped
  // while running. Truncate the path at the point it actually stopped.
  const stoppedAt = state === "rejected" ? 1 : state === "failed" ? 3 : currentIndex;

  const steps: Array<{ key: string; label: string; status: StepStatus }> =
    HAPPY_PATH.map((step, index) => {
      let status: StepStatus = "upcoming";
      if (terminalFailure) {
        status = index < stoppedAt ? "done" : index === stoppedAt ? "stopped" : "skipped";
      } else if (index < currentIndex) {
        status = "done";
      } else if (index === currentIndex) {
        status = state === "completed" ? "done" : "current";
      }
      return { key: step, label: SCAN_STATE_LABELS[step], status };
    });

  if (terminalFailure) {
    steps.splice(stoppedAt + 1, steps.length, {
      key: state,
      label: SCAN_STATE_LABELS[state],
      status: "failed",
    });
  }

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className="flex gap-3 sm:flex-1 sm:flex-col sm:gap-2"
        >
          <div className="flex flex-col items-center sm:w-full sm:flex-row">
            <StepMarker status={step.status} failedKind={state} />
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "w-px flex-1 sm:h-px sm:w-full",
                  step.status === "done" ? "bg-uv/50" : "bg-line",
                  "min-h-6 sm:min-h-0",
                )}
              />
            ) : null}
          </div>
          <span
            className={cn(
              "pb-4 text-xs sm:pb-0",
              step.status === "current"
                ? "font-medium text-uv-glow"
                : step.status === "failed"
                  ? "font-medium text-danger"
                  : step.status === "done"
                    ? "text-fg"
                    : "text-faint",
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

type StepStatus = "done" | "current" | "upcoming" | "skipped" | "stopped" | "failed";

function StepMarker({
  status,
  failedKind,
}: {
  status: StepStatus;
  failedKind: ScanJobState;
}) {
  if (status === "failed") {
    const Icon = failedKind === "rejected" ? Ban : TriangleAlert;
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-danger/50 bg-danger/15">
        <Icon aria-hidden className="size-3 text-danger" />
      </span>
    );
  }

  if (status === "done" || status === "stopped") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-uv/50 bg-uv/15">
        <Check aria-hidden className="size-3 text-uv-glow" />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-uv bg-uv/20">
        <span aria-hidden className="bl-pulse size-1.5 rounded-full bg-uv-glow" />
      </span>
    );
  }

  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line bg-ink">
      <CircleDashed aria-hidden className="size-3 text-faint" />
    </span>
  );
}
