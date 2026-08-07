import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { CircleCheck, Download, Wrench } from "lucide-react";

import { listFixes, markFixReviewed } from "@/api/fixesApi";
import { queryKeys } from "@/api/queryKeys";
import { getScan } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { ScanTabs } from "@/features/scans/ScanTabs";
import { formatConfidence, formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

import { DiffViewer } from "./DiffViewer";

export function FixesPage() {
  const { scanId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [localSelection, setLocalSelection] = useState<string | null>(null);

  const scanQuery = useQuery({
    queryKey: queryKeys.scan(scanId),
    queryFn: () => getScan(scanId),
    enabled: scanId.length > 0,
  });

  const fixesQuery = useQuery({
    queryKey: queryKeys.fixes(scanId),
    queryFn: () => listFixes(scanId),
    enabled: scanId.length > 0,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ fixId, reviewed }: { fixId: string; reviewed: boolean }) =>
      markFixReviewed(scanId, fixId, reviewed),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.fixes(scanId) });
    },
  });

  const fixes = useMemo(() => fixesQuery.data ?? [], [fixesQuery.data]);

  // A finding can deep-link straight to its patch via ?fix=<id>.
  const requestedId = localSelection ?? searchParams.get("fix");
  const selected =
    fixes.find((fix) => fix.id === requestedId) ?? fixes[0] ?? null;

  return (
    <>
      <PageHeader
        title="Proposed fixes"
        breadcrumbs={[
          { label: "Scans", to: "/scans" },
          {
            label: scanQuery.data?.target_name ?? "Assessment",
            to: `/scans/${scanId}`,
          },
          { label: "Fixes" },
        ]}
        description="Draft patches for review. None of these have been applied."
      />

      <ScanTabs scanId={scanId} />

      <InlineNotice
        tone="warn"
        title="These patches have not been validated"
        className="mb-4"
      >
        Proposed changes are drafts. Nothing here has been compiled, tested, or
        run against the codebase. Read every diff before applying it, and treat
        the confidence figure as a hint about the suggestion, not evidence that
        it is correct.
      </InlineNotice>

      {fixesQuery.isError ? (
        <ErrorState
          error={fixesQuery.error}
          onRetry={() => {
            void fixesQuery.refetch();
          }}
        />
      ) : fixesQuery.isPending ? (
        <LoadingSkeleton rows={8} label="Loading proposed fixes" />
      ) : fixes.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Wrench}
            title="No proposed fixes"
            description="Patches are drafted for findings where the remediation is mechanical enough to express as a diff. This assessment produced none."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <Panel className="h-fit">
            <PanelHeader title="Findings with a patch" />
            <ul className="divide-y divide-line">
              {fixes.map((fix) => (
                <li key={fix.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSelection(fix.id);
                      setSearchParams({ fix: fix.id }, { replace: true });
                    }}
                    aria-current={selected?.id === fix.id ? "true" : undefined}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors",
                      selected?.id === fix.id
                        ? "bl-rail bg-elevated"
                        : "hover:bg-elevated/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={fix.severity} size="sm" />
                      {fix.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-[0.6875rem] text-ok">
                          <CircleCheck aria-hidden className="size-3" />
                          Reviewed
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] leading-snug font-medium text-fg">
                      {fix.findingTitle}
                    </p>
                    <p className="mt-1 truncate font-mono text-[0.6875rem] text-faint">
                      {fix.filePath}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {selected ? (
            <Panel>
              <PanelHeader
                title={selected.findingTitle}
                description={selected.summary}
                actions={<SeverityBadge severity={selected.severity} />}
              />

              <PanelBody className="space-y-6">
                <section>
                  <SectionLabel className="mb-2">Why this change</SectionLabel>
                  <p className="text-[0.875rem] leading-relaxed text-muted">
                    {selected.rationale}
                  </p>
                </section>

                <section>
                  <SectionLabel className="mb-2">Proposed change</SectionLabel>
                  <DiffViewer hunks={selected.hunks} filePath={selected.filePath} />
                </section>

                <dl className="grid gap-x-6 gap-y-2 text-[0.8125rem] sm:grid-cols-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">File</dt>
                    <dd className="truncate font-mono text-xs text-fg">
                      {selected.filePath}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Confidence</dt>
                    <dd className="font-mono text-xs text-fg">
                      {formatConfidence(selected.confidence)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Drafted</dt>
                    <dd className="font-mono text-xs text-fg">
                      {formatDateTime(selected.generatedAt)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Applied</dt>
                    <dd className="font-mono text-xs text-faint">no</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <CopyButton
                    value={selected.patch}
                    label="Copy patch"
                    copiedLabel="Patch copied"
                    size="md"
                  />
                  <Button
                    icon={<Download aria-hidden className="size-4" />}
                    disabled
                    title="Patch download is not implemented"
                  >
                    Download patch
                  </Button>
                  <Button
                    variant={selected.reviewed ? "secondary" : "primary"}
                    icon={<CircleCheck aria-hidden className="size-4" />}
                    loading={reviewMutation.isPending}
                    onClick={() => {
                      reviewMutation.mutate({
                        fixId: selected.id,
                        reviewed: !selected.reviewed,
                      });
                    }}
                  >
                    {selected.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
                  </Button>
                </div>

                <p className="text-xs leading-relaxed text-faint">
                  Review state is held in memory only and resets on reload —
                  there is no endpoint to persist it yet.
                </p>
              </PanelBody>
            </Panel>
          ) : null}
        </div>
      )}
    </>
  );
}
