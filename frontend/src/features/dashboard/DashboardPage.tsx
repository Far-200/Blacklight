import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Activity,
  AlertOctagon,
  CircleCheck,
  Crosshair,
  Radar,
} from "lucide-react";

import { getDashboardSummary } from "@/api/dashboardApi";
import { queryKeys } from "@/api/queryKeys";
import { listScans } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingSkeleton, Skeleton } from "@/components/ui/LoadingSkeleton";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { emptySeverityCounts } from "@/types/findings";
import type { Severity } from "@/types/findings";
import { ScanRow } from "@/features/scans/ScanRow";

import { SeverityDistribution } from "./SeverityDistribution";

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummary,
  });

  const scansQuery = useQuery({
    queryKey: queryKeys.scans,
    queryFn: listScans,
  });

  const health = useBackendHealth();

  const summary = summaryQuery.data;
  const recentScans = (scansQuery.data ?? [])
    .slice()
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const severityCounts = { ...emptySeverityCounts() };
  if (summary) {
    for (const key of Object.keys(severityCounts) as Severity[]) {
      severityCounts[key] = summary.severity_counts[key] ?? 0;
    }
  }

  return (
    <>
      <PageHeader
        title="Assessment overview"
        description="Reveal what attackers would find before they do."
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

      {health.state === "offline" ? (
        <InlineNotice
          tone="warn"
          title="The orchestrator is not responding"
          className="mb-6"
        >
          Scan control and authorization checks need the FastAPI backend on
          http://127.0.0.1:8000. Start it, then use the connection indicator to
          check again.
        </InlineNotice>
      ) : null}

      {summaryQuery.isError ? (
        <ErrorState
          error={summaryQuery.error}
          onRetry={() => {
            void summaryQuery.refetch();
          }}
        />
      ) : (
        <section aria-label="Summary metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryQuery.isPending || !summary ? (
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[8.5rem]" />
            ))
          ) : (
            <>
              <MetricCard
                label="Total assessments"
                value={summary.total_scans}
                icon={Radar}
                hint="Across every target"
                to="/scans"
              />
              <MetricCard
                label="Active now"
                value={summary.active_scans}
                icon={Activity}
                tone={summary.active_scans > 0 ? "active" : "default"}
                hint={
                  summary.active_scans > 0
                    ? "Queued or running"
                    : "Nothing running"
                }
                to="/scans"
              />
              <MetricCard
                label="Critical findings"
                value={summary.critical_findings}
                icon={AlertOctagon}
                tone={summary.critical_findings > 0 ? "critical" : "default"}
                hint={
                  summary.critical_findings > 0
                    ? `${summary.critical_findings} require review`
                    : "None outstanding"
                }
              />
              <MetricCard
                label="Resolved"
                value={summary.resolved_findings}
                icon={CircleCheck}
                tone={summary.resolved_findings > 0 ? "ok" : "default"}
                hint="Confirmed fixed"
              />
            </>
          )}
        </section>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent assessments"
            description="Most recently created first"
            actions={
              <Link
                to="/scans"
                className="rounded-sm text-xs text-muted transition-colors hover:text-fg"
              >
                View all
              </Link>
            }
          />

          {scansQuery.isPending ? (
            <PanelBody>
              <LoadingSkeleton rows={5} label="Loading recent assessments" />
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
          ) : recentScans.length === 0 ? (
            <EmptyState
              icon={Radar}
              title="No assessments yet"
              description="Nothing is on fire. Probably. Register a target and verify you are authorized to test it to get started."
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
              {recentScans.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Severity distribution"
              description="All findings across all assessments"
            />
            <PanelBody>
              {summaryQuery.isPending ? (
                <LoadingSkeleton rows={4} label="Loading severity distribution" />
              ) : (
                <SeverityDistribution counts={severityCounts} />
              )}
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="System" />
            <PanelBody className="space-y-3">
              <SectionLabel>Orchestrator</SectionLabel>
              <dl className="space-y-2 text-[0.8125rem]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Health endpoint</dt>
                  <dd className="font-mono text-xs text-fg">
                    {health.state === "online"
                      ? "ok"
                      : health.state === "checking"
                        ? "checking"
                        : "unreachable"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Scope gate</dt>
                  <dd className="font-mono text-xs text-fg">implemented</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Scanner sandbox</dt>
                  <dd className="font-mono text-xs text-faint">not connected</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Findings pipeline</dt>
                  <dd className="font-mono text-xs text-faint">not built</dd>
                </div>
              </dl>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </>
  );
}
