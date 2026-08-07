import { Link } from "react-router";
import { Wrench } from "lucide-react";

import { CodeEvidence } from "@/components/ui/CodeEvidence";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FindingViewModel } from "@/types/findings";
import { formatConfidence, formatDateTime, pluralize } from "@/utils/format";

/**
 * A single finding, in full.
 *
 * Order is deliberate: what it is, what it means, what proves it, what to do.
 * Evidence sits before remediation so nobody is asked to act on a claim before
 * seeing what supports it.
 */
export function FindingDetail({
  finding,
  scanId,
}: {
  finding: FindingViewModel;
  scanId: string;
}) {
  return (
    <Panel>
      <PanelHeader
        title={finding.title}
        actions={<SeverityBadge severity={finding.severity} />}
      />

      <PanelBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge kind="finding" status={finding.status} />
          <span className="rounded-[var(--radius-control)] border border-line-strong bg-elevated px-2 py-0.5 font-mono text-[0.6875rem] text-muted">
            {finding.source}
          </span>
          {finding.cwe ? (
            <span className="rounded-[var(--radius-control)] border border-line-strong bg-elevated px-2 py-0.5 font-mono text-[0.6875rem] text-muted">
              {finding.cwe}
            </span>
          ) : null}
          {typeof finding.cvss === "number" && finding.cvss > 0 ? (
            <span className="rounded-[var(--radius-control)] border border-line-strong bg-elevated px-2 py-0.5 font-mono text-[0.6875rem] text-muted">
              CVSS {finding.cvss.toFixed(1)}
            </span>
          ) : null}
        </div>

        <section>
          <SectionLabel className="mb-2">Description</SectionLabel>
          <p className="text-[0.875rem] leading-relaxed text-muted">
            {finding.description}
          </p>
        </section>

        <section>
          <SectionLabel className="mb-2">What an attacker could achieve</SectionLabel>
          <p className="text-[0.875rem] leading-relaxed text-muted">
            {finding.impact}
          </p>
        </section>

        <section>
          <SectionLabel className="mb-2">Evidence</SectionLabel>
          <CodeEvidence
            content={finding.evidence}
            caption={`Collected from ${finding.source}`}
            startLine={finding.lineStart}
          />

          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[0.8125rem] sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Asset</dt>
              <dd className="truncate font-mono text-xs text-fg">{finding.asset}</dd>
            </div>
            {finding.filePath ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">File</dt>
                <dd className="truncate font-mono text-xs text-fg">
                  {finding.filePath}
                </dd>
              </div>
            ) : null}
            {finding.lineStart ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Lines</dt>
                <dd className="font-mono text-xs text-fg">
                  {finding.lineEnd && finding.lineEnd !== finding.lineStart
                    ? `${finding.lineStart}–${finding.lineEnd}`
                    : finding.lineStart}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Tool confidence</dt>
              <dd className="font-mono text-xs text-fg">
                {formatConfidence(finding.confidence)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Duplicate sources</dt>
              <dd className="font-mono text-xs text-fg">
                {pluralize(finding.duplicateCount, "result")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Detected</dt>
              <dd className="font-mono text-xs text-fg">
                {formatDateTime(finding.detectedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <SectionLabel className="mb-2">Remediation</SectionLabel>
          <p className="text-[0.875rem] leading-relaxed text-muted">
            {finding.remediation}
          </p>
        </section>

        {finding.confidence < 0.8 ? (
          <InlineNotice tone="warn" title="Verify before scheduling work">
            The detecting tool reported {formatConfidence(finding.confidence)}{" "}
            confidence. Confirm this manually before treating it as established.
          </InlineNotice>
        ) : null}

        {finding.fixId ? (
          <Link
            to={`/scans/${scanId}/fixes?fix=${finding.fixId}`}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-line-strong bg-elevated px-4 text-sm font-medium text-fg transition-colors hover:border-uv/40 hover:bg-raised"
          >
            <Wrench aria-hidden className="size-4" />
            View proposed fix
          </Link>
        ) : null}
      </PanelBody>
    </Panel>
  );
}
