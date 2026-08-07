import { Copy } from "lucide-react";

import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FindingViewModel } from "@/types/findings";
import { formatConfidence } from "@/utils/format";
import { cn } from "@/utils/cn";

/** One finding in the list. Selecting it opens the detail beside or below. */
export function FindingCard({
  finding,
  selected,
  onSelect,
}: {
  finding: FindingViewModel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "w-full px-4 py-3 text-left transition-colors sm:px-5",
          selected ? "bl-rail bg-elevated" : "hover:bg-elevated/60",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} size="sm" />
          <StatusBadge kind="finding" status={finding.status} />
          {finding.duplicateCount > 1 ? (
            <span
              className="inline-flex items-center gap-1 text-[0.6875rem] text-faint"
              title={`${finding.duplicateCount} raw results were deduplicated into this finding`}
            >
              <Copy aria-hidden className="size-3" />
              {finding.duplicateCount}
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-[0.875rem] leading-snug font-medium text-fg">
          {finding.title}
        </p>

        <p className="mt-1 truncate font-mono text-[0.6875rem] text-faint">
          {finding.filePath
            ? `${finding.filePath}${finding.lineStart ? `:${finding.lineStart}` : ""}`
            : finding.asset}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-muted">
          <span>{finding.source}</span>
          <span aria-hidden className="text-faint">
            ·
          </span>
          <span>{formatConfidence(finding.confidence)} confidence</span>
          {finding.cwe ? (
            <>
              <span aria-hidden className="text-faint">
                ·
              </span>
              <span className="font-mono">{finding.cwe}</span>
            </>
          ) : null}
        </div>
      </button>
    </li>
  );
}
