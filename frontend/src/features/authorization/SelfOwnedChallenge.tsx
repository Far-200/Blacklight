import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileCode, Globe, RefreshCw, ShieldCheck } from "lucide-react";

import type {
  AuthorizationRecordResponse,
  ChallengeResponse,
  TargetResponse,
} from "@/api/contracts";
import {
  checkDomainChallenge,
  startDomainChallenge,
} from "@/api/scopeGateService";
import { Button } from "@/components/ui/Button";
import { CodeEvidence } from "@/components/ui/CodeEvidence";
import { CopyButton } from "@/components/ui/CopyButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { env } from "@/config/env";
import { useNow } from "@/hooks/useNow";
import type { DomainChallengeMethod } from "@/types/domain";
import { formatDateTime, formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

const METHODS: Array<{
  value: DomainChallengeMethod;
  label: string;
  description: string;
  icon: typeof Globe;
}> = [
  {
    value: "dns_txt",
    label: "DNS TXT record",
    description:
      "Add a TXT record to the domain's DNS. Works even when the site is not publicly reachable.",
    icon: Globe,
  },
  {
    value: "file_challenge",
    label: "Well-known file",
    description:
      "Publish a small file at a fixed path on the site. Faster if you can deploy but not change DNS.",
    icon: FileCode,
  },
];

/**
 * Domain ownership verification for self-owned targets.
 *
 * The token is displayed once and copied, never re-derived client-side. The
 * verify action asks the orchestrator to look for it — the browser does not and
 * cannot perform the lookup itself, which is the whole point of the mechanism.
 */
export function SelfOwnedChallenge({ target }: { target: TargetResponse }) {
  const [method, setMethod] = useState<DomainChallengeMethod>("dns_txt");
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [result, setResult] = useState<AuthorizationRecordResponse | null>(null);

  const startMutation = useMutation({
    mutationFn: () =>
      startDomainChallenge({
        targetId: target.id,
        method,
        rootDomain: target.root_domain ?? "",
      }),
    onSuccess: (created) => {
      setChallenge(created);
      setResult(null);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => {
      if (!challenge) throw new Error("No challenge to verify");
      return checkDomainChallenge(challenge);
    },
    onSuccess: setResult,
  });

  // Re-read on a timer rather than during render: a token that expires while
  // this screen is open should visibly expire, and reading the clock inline
  // would make the component impure.
  const now = useNow(30_000);
  const expired =
    challenge !== null && new Date(challenge.expires_at).getTime() < now;

  const status = result?.status ?? (expired ? "expired" : "pending");

  if (!target.root_domain) {
    return (
      <Panel>
        <PanelBody>
          <InlineNotice tone="danger" title="This target has no root domain">
            Domain verification needs a registrable domain to place the challenge
            on. Edit the target and add one before continuing.
          </InlineNotice>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Prove you control this domain"
          description={`Verification applies to ${target.root_domain} and any host beneath it.`}
          actions={<StatusBadge kind="authorization" status={status} />}
        />

        <PanelBody className="space-y-5">
          <fieldset>
            <legend className="mb-3 text-[0.8125rem] font-medium text-fg">
              Choose a verification method
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-3 transition-colors",
                    method === option.value
                      ? "border-uv bg-uv/8"
                      : "border-line bg-ink hover:border-line-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="challenge-method"
                    value={option.value}
                    checked={method === option.value}
                    disabled={challenge !== null}
                    className="mt-0.5 size-4 accent-[var(--color-uv)]"
                    onChange={() => {
                      setMethod(option.value);
                    }}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[0.8125rem] text-fg">
                      <option.icon aria-hidden className="size-3.5 text-faint" />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {startMutation.isError ? (
            <ErrorState
              error={startMutation.error}
              title="Could not create a challenge"
            />
          ) : null}

          {challenge === null ? (
            <div className="border-t border-line pt-4">
              <Button
                variant="primary"
                loading={startMutation.isPending}
                icon={<ShieldCheck aria-hidden className="size-4" />}
                onClick={() => {
                  startMutation.mutate();
                }}
              >
                Generate verification token
              </Button>
            </div>
          ) : (
            <div className="space-y-5 border-t border-line pt-5">
              <div>
                <SectionLabel className="mb-2">Verification token</SectionLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 overflow-x-auto rounded-[var(--radius-control)] border border-line bg-void px-3 py-2 text-[0.8125rem] break-all text-uv-glow">
                    {challenge.token}
                  </code>
                  <CopyButton
                    value={challenge.token}
                    label="Copy token"
                    copiedLabel="Token copied"
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {expired ? (
                    <span className="text-warn">
                      This token expired {formatRelative(challenge.expires_at)}.
                      Generate a new one.
                    </span>
                  ) : (
                    <>
                      Expires {formatRelative(challenge.expires_at)} —{" "}
                      <span className="font-mono">
                        {formatDateTime(challenge.expires_at)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div>
                <SectionLabel className="mb-2">What to do</SectionLabel>
                <p className="mb-3 text-[0.875rem] leading-relaxed text-muted">
                  {challenge.instructions}
                </p>

                <CodeEvidence
                  caption={
                    method === "dns_txt" ? "DNS record" : "File at well-known path"
                  }
                  content={
                    method === "dns_txt"
                      ? `_blacklight-verify.${target.root_domain}.  IN  TXT  "${challenge.token}"`
                      : `# https://${target.root_domain}/.well-known/blacklight-verify.txt\n${challenge.token}`
                  }
                />

                <p className="mt-2 text-xs text-muted">
                  {method === "dns_txt"
                    ? "DNS changes can take a few minutes to propagate. If verification fails on the first attempt, wait and try again."
                    : "The file must contain the token and nothing else — no surrounding markup, no trailing content."}
                </p>
              </div>

              {result ? <VerificationResult result={result} /> : null}

              {verifyMutation.isError ? (
                <ErrorState
                  error={verifyMutation.error}
                  title="Verification could not run"
                />
              ) : null}

              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Button
                  variant="primary"
                  disabled={expired}
                  loading={verifyMutation.isPending}
                  icon={<ShieldCheck aria-hidden className="size-4" />}
                  onClick={() => {
                    verifyMutation.mutate();
                  }}
                >
                  Verify now
                </Button>
                <Button
                  icon={<RefreshCw aria-hidden className="size-4" />}
                  loading={startMutation.isPending}
                  onClick={() => {
                    startMutation.mutate();
                  }}
                >
                  Generate a new token
                </Button>
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>

      {env.useMocks ? (
        <InlineNotice tone="uv" title="Verification is simulated in mock mode">
          The scope-gate endpoints are implemented, but they operate on a target
          row that cannot be created yet, so this screen uses fixtures. The mock
          deliberately reports <span className="font-mono">denied</span> — no DNS
          lookup or file fetch happened, so nothing was actually proven. Run with{" "}
          <span className="font-mono">VITE_USE_MOCKS=false</span> once POST
          /targets exists to exercise the real gate.
        </InlineNotice>
      ) : null}
    </div>
  );
}

function VerificationResult({
  result,
}: {
  result: AuthorizationRecordResponse;
}) {
  if (result.status === "passing") {
    return (
      <InlineNotice tone="info" title="Ownership verified">
        A passing authorization record was written{" "}
        {formatRelative(result.decided_at)}. It expires{" "}
        {result.expires_at ? formatRelative(result.expires_at) : "never"}, after
        which the domain must be re-verified.
      </InlineNotice>
    );
  }

  return (
    <InlineNotice tone="danger" title="Verification did not pass">
      The orchestrator did not find the token where it expected it. Confirm the
      record or file is published and readable from the public internet, then
      verify again. Repeated failures are recorded in the audit log.
    </InlineNotice>
  );
}
