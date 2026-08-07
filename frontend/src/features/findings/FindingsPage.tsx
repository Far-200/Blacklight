import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { FileSearch, SearchX } from "lucide-react";

import { listFindings, listFindingSources } from "@/api/findingsApi";
import { queryKeys } from "@/api/queryKeys";
import { getScan } from "@/api/scansApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FindingViewModel } from "@/types/findings";
import { SEVERITY_ORDER, countBySeverity } from "@/types/findings";
import { SeverityDistribution } from "@/features/dashboard/SeverityDistribution";
import { ScanTabs } from "@/features/scans/ScanTabs";

import { FindingCard } from "./FindingCard";
import { FindingDetail } from "./FindingDetail";
import type { FindingFilterState } from "./filterState";
import { EMPTY_FILTERS } from "./filterState";
import { FindingFilters } from "./FindingFilters";

export function FindingsPage() {
  const { scanId = "" } = useParams();
  const [filters, setFilters] = useState<FindingFilterState>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scanQuery = useQuery({
    queryKey: queryKeys.scan(scanId),
    queryFn: () => getScan(scanId),
    enabled: scanId.length > 0,
  });

  const findingsQuery = useQuery({
    queryKey: queryKeys.findings(scanId),
    queryFn: () => listFindings(scanId),
    enabled: scanId.length > 0,
  });

  const sourcesQuery = useQuery({
    queryKey: queryKeys.findingSources,
    queryFn: listFindingSources,
  });

  const findings = useMemo(() => findingsQuery.data ?? [], [findingsQuery.data]);

  const visible = useMemo(
    () => applyFilters(findings, filters),
    [findings, filters],
  );

  const selected =
    visible.find((finding) => finding.id === selectedId) ?? visible[0] ?? null;

  const counts = countBySeverity(findings);

  return (
    <>
      <PageHeader
        title="Findings"
        breadcrumbs={[
          { label: "Scans", to: "/scans" },
          {
            label: scanQuery.data?.target_name ?? "Assessment",
            to: `/scans/${scanId}`,
          },
          { label: "Findings" },
        ]}
        description={
          scanQuery.data
            ? `Normalized and deduplicated results for ${scanQuery.data.target_name}.`
            : undefined
        }
        meta={
          scanQuery.data ? (
            <StatusBadge kind="scan" status={scanQuery.data.state} />
          ) : null
        }
      />

      <ScanTabs scanId={scanId} />

      <InlineNotice tone="uv" title="Provisional finding model" className="mb-4">
        These findings use a temporary frontend-only shape. The shared findings
        schema has not been agreed yet, so field names here will change.
      </InlineNotice>

      {findingsQuery.isError ? (
        <ErrorState
          error={findingsQuery.error}
          onRetry={() => {
            void findingsQuery.refetch();
          }}
        />
      ) : findingsQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <LoadingSkeleton rows={8} label="Loading findings" />
          <LoadingSkeleton rows={10} label="Loading finding detail" />
        </div>
      ) : findings.length === 0 ? (
        <Panel>
          <EmptyState
            icon={FileSearch}
            title="No findings for this assessment"
            description={
              scanQuery.data && scanQuery.data.state === "completed"
                ? "The assessment finished without recording anything. That is a result, not an error."
                : "Findings appear once the analysis pipeline has run and results have been normalized."
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr] xl:grid-cols-[24rem_1fr]">
          <div className="space-y-4">
            <Panel>
              <PanelHeader title="Severity summary" />
              <PanelBody>
                <SeverityDistribution counts={counts} />
              </PanelBody>
            </Panel>

            <Panel>
              <PanelBody>
                <FindingFilters
                  filters={filters}
                  sources={sourcesQuery.data ?? []}
                  resultCount={visible.length}
                  onChange={(next) => {
                    setFilters(next);
                    setSelectedId(null);
                  }}
                />
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader title="Findings" />
              {visible.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="Nothing matches these filters"
                  description="Widen the severity, status or tool filters, or clear the search."
                />
              ) : (
                <ul className="max-h-[36rem] divide-y divide-line overflow-y-auto">
                  {visible.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      selected={selected?.id === finding.id}
                      onSelect={() => {
                        setSelectedId(finding.id);
                      }}
                    />
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div>
            {selected ? (
              <FindingDetail finding={selected} scanId={scanId} />
            ) : (
              <Panel>
                <EmptyState
                  icon={FileSearch}
                  title="Select a finding"
                  description="Choose a finding from the list to see its evidence, impact and remediation."
                />
              </Panel>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function applyFilters(
  findings: FindingViewModel[],
  filters: FindingFilterState,
): FindingViewModel[] {
  const term = filters.search.trim().toLowerCase();

  const filtered = findings.filter((finding) => {
    if (filters.severities.length > 0 && !filters.severities.includes(finding.severity))
      return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(finding.status))
      return false;
    if (filters.sources.length > 0 && !filters.sources.includes(finding.source))
      return false;

    if (term.length === 0) return true;
    return [finding.title, finding.asset, finding.filePath, finding.cwe, finding.source]
      .filter((value): value is string => typeof value === "string")
      .some((value) => value.toLowerCase().includes(term));
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case "confidence":
        return b.confidence - a.confidence;
      case "detected":
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      default:
        return (
          SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
          b.confidence - a.confidence
        );
    }
  });
}
