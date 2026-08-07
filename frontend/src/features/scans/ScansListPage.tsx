import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Crosshair, Radar } from "lucide-react";

import { queryKeys } from "@/api/queryKeys";
import { listScans } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";

import { ScanRow } from "./ScanRow";

export function ScansListPage() {
  const scansQuery = useQuery({
    queryKey: queryKeys.scans,
    queryFn: listScans,
    // Cheap enough to keep fresh; a running scan should not go stale here.
    refetchInterval: 10_000,
  });

  const scans = (scansQuery.data ?? [])
    .slice()
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Every scan job, newest first."
        actions={
          <Link
            to="/targets/new"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-uv-dim bg-uv px-4 text-sm font-medium text-white transition-colors hover:bg-uv-dim"
          >
            <Crosshair aria-hidden className="size-4" />
            New assessment
          </Link>
        }
      />

      <Panel>
        <PanelHeader
          title="All assessments"
          description={
            scansQuery.data ? `${scansQuery.data.length} total` : undefined
          }
        />

        {scansQuery.isPending ? (
          <PanelBody>
            <LoadingSkeleton rows={6} label="Loading assessments" />
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
        ) : scans.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No assessments yet"
            description="Nothing is on fire. Probably. Register a target to run your first assessment."
            action={
              <Link
                to="/targets/new"
                className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-uv-dim bg-uv px-4 text-sm font-medium text-white transition-colors hover:bg-uv-dim"
              >
                <Crosshair aria-hidden className="size-4" />
                New assessment
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {scans.map((scan) => (
              <ScanRow key={scan.id} scan={scan} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
