import {
  Check,
  CircleDashed,
  Loader2,
  MinusCircle,
  TriangleAlert,
} from "lucide-react";

import type { ScanModuleProgress } from "@/api/contracts";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/utils/cn";

/** Per-module progress for the planned analysis pipeline. */
export function ModuleProgressList({ modules }: { modules: ScanModuleProgress[] }) {
  return (
    <ol className="divide-y divide-line">
      {modules.map((module) => (
        <li key={module.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <ModuleIcon state={module.state} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span
                className={cn(
                  "text-[0.8125rem]",
                  module.state === "pending"
                    ? "text-faint"
                    : module.state === "failed"
                      ? "text-danger"
                      : "text-fg",
                )}
              >
                {module.label}
              </span>
              <span className="font-mono text-[0.6875rem] text-faint tabular-nums">
                {module.state === "skipped"
                  ? "skipped"
                  : module.state === "pending"
                    ? "—"
                    : `${module.progress}%`}
              </span>
            </div>

            {module.detail ? (
              <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-faint">
                {module.detail}
              </p>
            ) : null}

            {module.state === "running" ? (
              <ProgressBar
                className="mt-2"
                size="sm"
                value={module.progress}
                label={`${module.label} progress`}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ModuleIcon({ state }: { state: ScanModuleProgress["state"] }) {
  const base = "mt-0.5 size-4 shrink-0";

  switch (state) {
    case "completed":
      return <Check aria-label="Completed" className={cn(base, "text-ok")} />;
    case "running":
      return (
        <Loader2 aria-label="Running" className={cn(base, "animate-spin text-uv-glow")} />
      );
    case "failed":
      return <TriangleAlert aria-label="Failed" className={cn(base, "text-danger")} />;
    case "skipped":
      return <MinusCircle aria-label="Skipped" className={cn(base, "text-faint")} />;
    default:
      return <CircleDashed aria-label="Pending" className={cn(base, "text-faint")} />;
  }
}
