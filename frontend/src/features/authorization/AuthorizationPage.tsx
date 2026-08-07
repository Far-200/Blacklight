import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { ShieldQuestion } from "lucide-react";

import { queryKeys } from "@/api/queryKeys";
import { getTarget } from "@/api/targetsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton, Skeleton } from "@/components/ui/LoadingSkeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  OWNERSHIP_MODE_LABELS,
  TARGET_TYPE_LABELS,
} from "@/types/domain";
import { formatDateTime } from "@/utils/format";

import { AuthorizationNotice } from "./AuthorizationNotice";
import { BountyChecklistForm } from "./BountyChecklistForm";
import { SelfOwnedChallenge } from "./SelfOwnedChallenge";

/**
 * The authorization gate.
 *
 * A first-class screen with its own route, not a modal in front of the scan
 * button. Which flow appears is decided by the target's ownership mode, because
 * the backend treats the two as genuinely different authorization methods
 * rather than variations on one form.
 */
export function AuthorizationPage() {
  const { targetId = "" } = useParams();

  const targetQuery = useQuery({
    queryKey: queryKeys.target(targetId),
    queryFn: () => getTarget(targetId),
    enabled: targetId.length > 0,
  });

  const target = targetQuery.data;

  if (targetQuery.isError) {
    return (
      <>
        <PageHeader
          title="Authorization"
          breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Authorization" }]}
        />
        <Panel>
          <EmptyState
            icon={ShieldQuestion}
            title="Target not found"
            description="This target does not exist. Mock targets are held in browser memory, so anything created before a reload is gone."
            action={
              <Link
                to="/targets/new"
                className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-uv-dim bg-uv px-4 text-sm font-medium text-white transition-colors hover:bg-uv-dim"
              >
                Register a target
              </Link>
            }
          />
        </Panel>
      </>
    );
  }

  if (targetQuery.isPending || !target) {
    return (
      <>
        <PageHeader
          title="Authorization"
          breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Authorization" }]}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <LoadingSkeleton rows={6} label="Loading target" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Authorization gate"
        description="No assessment runs against this target until the orchestrator holds a passing authorization record for it."
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: target.name },
          { label: "Authorization" },
        ]}
        meta={
          <>
            <StatusBadge
              kind="authorization"
              status={target.authorization_status ?? "pending"}
            />
            <span className="font-mono text-xs text-faint">
              {target.identifier}
            </span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {target.ownership_mode === "self_owned" ? (
            <SelfOwnedChallenge target={target} />
          ) : (
            <BountyChecklistForm target={target} />
          )}
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Target" />
            <PanelBody>
              <dl className="space-y-3 text-[0.8125rem]">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-0.5 text-fg">{target.name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Identifier</dt>
                  <dd className="mt-0.5 font-mono text-xs break-all text-fg">
                    {target.identifier}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Type</dt>
                  <dd className="mt-0.5 text-fg">
                    {TARGET_TYPE_LABELS[target.target_type]}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Authorization path</dt>
                  <dd className="mt-0.5 text-fg">
                    {OWNERSHIP_MODE_LABELS[target.ownership_mode]}
                  </dd>
                </div>
                {target.root_domain ? (
                  <div>
                    <dt className="text-muted">Root domain</dt>
                    <dd className="mt-0.5 font-mono text-xs text-fg">
                      {target.root_domain}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted">Registered</dt>
                  <dd className="mt-0.5 font-mono text-xs text-fg">
                    {formatDateTime(target.created_at)}
                  </dd>
                </div>
              </dl>

              {target.notes ? (
                <p className="mt-4 border-t border-line pt-3 text-[0.8125rem] leading-relaxed text-muted">
                  {target.notes}
                </p>
              ) : null}
            </PanelBody>
          </Panel>

          <AuthorizationNotice />
        </div>
      </div>
    </>
  );
}
