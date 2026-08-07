import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ChevronRight, FileText } from "lucide-react";

import { queryKeys } from "@/api/queryKeys";
import { listScans } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { formatDateTime } from "@/utils/format";

/**
 * Reports index.
 *
 * A report exists only for a completed assessment, so this lists completed
 * scans rather than maintaining a separate report collection.
 */
export function ReportsListPage() {
  const scansQuery = useQuery({
    queryKey: queryKeys.scans,
    queryFn: listScans,
  });

  const completed = (scansQuery.data ?? []).filter(
    (scan) => scan.state === "completed",
  );

  return (
    <>
      <PageHeader
        title="Reports"
        description="One report per completed assessment."
      />

      <Panel>
        <PanelHeader
          title="Available reports"
          description={completed.length > 0 ? `${completed.length} total` : undefined}
        />

        {scansQuery.isPending ? (
          <PanelBody>
            <LoadingSkeleton rows={4} label="Loading reports" />
          </PanelBody>
        ) : scansQuery.isError ? (
          <PanelBody>
            <ErrorState
              error={scansQuery.error}
              onRetry={() => {
                void scansQuery.refetch();
              }}
            />
          </PanelBody>
        ) : completed.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="A report is written once an assessment completes. Nothing has finished running."
            action={
              <Link
                to="/scans"
                className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-line-strong bg-elevated px-4 text-sm font-medium text-fg transition-colors hover:bg-raised"
              >
                View assessments
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {completed.map((scan) => (
              <li key={scan.id}>
                <Link
                  to={`/scans/${scan.id}/report`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-elevated sm:px-5"
                >
                  <FileText aria-hidden className="size-4 shrink-0 text-faint" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {scan.target_name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-faint">
                      {scan.target_identifier} · finished{" "}
                      {formatDateTime(scan.finished_at)}
                    </p>
                  </div>
                  <ChevronRight
                    aria-hidden
                    className="size-4 shrink-0 text-faint transition-colors group-hover:text-uv-glow"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
