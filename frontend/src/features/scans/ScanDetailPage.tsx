import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { CircleStop, ExternalLink, ShieldCheck } from "lucide-react";

import { queryKeys } from "@/api/queryKeys";
import { getScan } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingSkeleton, Skeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useElapsed } from "@/hooks/useElapsed";
import {
  AUTHORIZATION_METHOD_LABELS,
  TARGET_TYPE_LABELS,
  isTerminalScanState,
} from "@/types/domain";
import { formatDateTime, formatDuration, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";

import { ActivityLog } from "./ActivityLog";
import { ModuleProgressList } from "./ModuleProgressList";
import { ScanStateTimeline } from "./ScanStateTimeline";
import { ScanTabs } from "./ScanTabs";

/** How often a live scan is re-fetched. Polling, not WebSockets — by design. */
const POLL_INTERVAL_MS = 4000;

export function ScanDetailPage() {
  const { scanId = "" } = useParams();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const scanQuery = useQuery({
    queryKey: queryKeys.scan(scanId),
    queryFn: () => getScan(scanId),
    enabled: scanId.length > 0,
    /*
      Polling interval is a function of state, so a finished scan stops costing
      requests. When the backend gains a real progress stream this is the only
      line that changes — the components below already re-render from cache.
    */
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (!state) return POLL_INTERVAL_MS;
      return isTerminalScanState(state) ? false : POLL_INTERVAL_MS;
    },
  });

  const scan = scanQuery.data;
  const elapsed = useElapsed(
    scan?.started_at,
    scan?.state === "running",
  );

  const totalElapsed =
    scan?.started_at && scan.finished_at
      ? new Date(scan.finished_at).getTime() - new Date(scan.started_at).getTime()
      : elapsed;

  if (scanQuery.isError) {
    return (
      <>
        <PageHeader title="Assessment" breadcrumbs={[{ label: "Scans", to: "/scans" }]} />
        <ErrorState
          error={scanQuery.error}
          onRetry={() => {
            void scanQuery.refetch();
          }}
        />
      </>
    );
  }

  if (scanQuery.isPending || !scan) {
    return (
      <>
        <PageHeader title="Assessment" breadcrumbs={[{ label: "Scans", to: "/scans" }]} />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      </>
    );
  }

  const running = scan.state === "running";
  const blocked = scan.state === "rejected";

  return (
    <>
      <PageHeader
        title={scan.target_name}
        breadcrumbs={[
          { label: "Scans", to: "/scans" },
          { label: scan.target_name },
        ]}
        meta={
          <>
            <StatusBadge kind="scan" status={scan.state} />
            {scan.authorization_status ? (
              <StatusBadge kind="authorization" status={scan.authorization_status} />
            ) : null}
            <span className="font-mono text-xs text-faint">{scan.id}</span>
          </>
        }
        actions={
          <Button
            variant="danger"
            icon={<CircleStop aria-hidden className="size-4" />}
            disabled={isTerminalScanState(scan.state)}
            onClick={() => {
              setConfirmingCancel(true);
            }}
          >
            Cancel assessment
          </Button>
        }
      />

      <ScanTabs scanId={scan.id} />

      {blocked ? (
        <InlineNotice
          tone="danger"
          title="The scope gate blocked this assessment"
          className="mb-4"
        >
          {scan.failure_reason ??
            "No passing authorization record exists for this target."}{" "}
          This decision is made server-side on every scan-start request and
          cannot be overridden from the interface.{" "}
          <Link
            to={`/targets/${scan.target_id}/authorize`}
            className="rounded-sm font-medium text-uv-glow underline underline-offset-2"
          >
            Complete authorization
          </Link>
          .
        </InlineNotice>
      ) : null}

      {scan.state === "failed" && scan.failure_reason ? (
        <InlineNotice tone="danger" title="This assessment stopped early" className="mb-4">
          {scan.failure_reason}
        </InlineNotice>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel className={cn(running && "bl-sweep")}>
            <div className="relative z-1">
              <PanelHeader
                title="Progress"
                description={
                  running
                    ? "Polling every four seconds"
                    : isTerminalScanState(scan.state)
                      ? "This assessment has finished"
                      : "Waiting for a sandbox worker"
                }
              />
              <PanelBody className="space-y-5">
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm text-muted">Overall</span>
                    <span
                      className="font-mono text-lg text-fg tabular-nums"
                      style={{ fontVariationSettings: '"wdth" 100' }}
                    >
                      {formatPercent(scan.progress)}
                    </span>
                  </div>
                  <ProgressBar
                    value={scan.progress}
                    label="Overall assessment progress"
                    tone={blocked || scan.state === "failed" ? "danger" : "uv"}
                  />
                </div>

                <div className="pt-1">
                  <SectionLabel className="mb-4">Job state</SectionLabel>
                  <ScanStateTimeline state={scan.state} />
                </div>
              </PanelBody>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Analysis modules"
              description="This pipeline is not implemented in the backend yet"
            />
            <PanelBody>
              <ModuleProgressList modules={scan.modules} />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Activity" />
            <PanelBody>
              {scanQuery.isFetching && scan.activity.length === 0 ? (
                <LoadingSkeleton rows={3} label="Loading activity" />
              ) : (
                <ActivityLog entries={scan.activity} />
              )}
            </PanelBody>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Target" />
            <PanelBody className="space-y-4">
              <dl className="space-y-3 text-[0.8125rem]">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-0.5 text-fg">{scan.target_name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Identifier</dt>
                  <dd className="mt-0.5 flex items-start gap-1.5 font-mono text-xs break-all text-fg">
                    {scan.target_identifier}
                    <ExternalLink aria-hidden className="mt-0.5 size-3 shrink-0 text-faint" />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Type</dt>
                  <dd className="mt-0.5 text-fg">
                    {TARGET_TYPE_LABELS[scan.target_type]}
                  </dd>
                </div>
              </dl>

              <Link
                to={`/targets/${scan.target_id}/authorize`}
                className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted transition-colors hover:text-fg"
              >
                <ShieldCheck aria-hidden className="size-3.5" />
                View authorization record
              </Link>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Timing" />
            <PanelBody>
              <dl className="space-y-3 text-[0.8125rem]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Created</dt>
                  <dd className="font-mono text-xs text-fg">
                    {formatDateTime(scan.created_at)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Started</dt>
                  <dd className="font-mono text-xs text-fg">
                    {formatDateTime(scan.started_at)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Finished</dt>
                  <dd className="font-mono text-xs text-fg">
                    {formatDateTime(scan.finished_at)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                  <dt className="text-muted">Elapsed</dt>
                  <dd className="font-mono text-xs text-fg tabular-nums">
                    {totalElapsed === null ? "—" : formatDuration(totalElapsed)}
                  </dd>
                </div>
              </dl>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Authorization" />
            <PanelBody className="space-y-3">
              {scan.authorization_status ? (
                <StatusBadge kind="authorization" status={scan.authorization_status} />
              ) : (
                <p className="text-[0.8125rem] text-muted">
                  No authorization record for this target.
                </p>
              )}
              {scan.authorization_method ? (
                <p className="text-[0.8125rem] text-muted">
                  Verified by{" "}
                  <span className="text-fg">
                    {AUTHORIZATION_METHOD_LABELS[scan.authorization_method]}
                  </span>
                  .
                </p>
              ) : null}
              <p className="text-xs leading-relaxed text-faint">
                The scope gate re-checks this record server-side on every
                scan-start request. It is never trusted from the client.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel this assessment?"
        description="Cancellation is not implemented. There is no scan-cancel endpoint on the orchestrator and no sandbox worker to signal, so nothing will stop. This dialog exists so the flow can be reviewed."
        confirmLabel="Cancel assessment"
        cancelLabel="Keep running"
        destructive
        onConfirm={() => {
          setConfirmingCancel(false);
        }}
        onCancel={() => {
          setConfirmingCancel(false);
        }}
      />
    </>
  );
}
