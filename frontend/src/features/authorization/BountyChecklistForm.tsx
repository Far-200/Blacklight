import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import type {
  AuthorizationRecordResponse,
  TargetResponse,
} from "@/api/contracts";
import { isCoveredByScope, submitChecklist } from "@/api/scopeGateService";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, TextArea, TextInput } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RESTRICTED_TEST_CLASSES, TEST_CLASS_LABELS } from "@/types/domain";
import { formatRelative } from "@/utils/format";

/** Test classes a program may permit. Restricted ones are handled separately. */
const STANDARD_TEST_CLASSES = [
  "passive_recon",
  "dependency_analysis",
  "secret_detection",
  "static_analysis",
  "config_review",
  "injection",
  "auth_logic",
] as const;

function parseAssets(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Bug-bounty scope entry.
 *
 * Manual checklist entry, not policy parsing: v1 does not read a program's
 * published policy, so the person doing the testing transcribes it and takes
 * responsibility for the transcription. The form says so rather than implying
 * the scope was fetched.
 *
 * Restricted classes are unchecked and disabled. The backend refuses them
 * unless a passing record explicitly opts in, and this UI does not offer a way
 * to do that — enabling them is a deliberate change, not a checkbox.
 */
export function BountyChecklistForm({ target }: { target: TargetResponse }) {
  const [inScopeRaw, setInScopeRaw] = useState("");
  const [outOfScopeRaw, setOutOfScopeRaw] = useState("");
  const [allowed, setAllowed] = useState<string[]>([
    "passive_recon",
    "dependency_analysis",
    "secret_detection",
    "static_analysis",
    "config_review",
  ]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [result, setResult] = useState<AuthorizationRecordResponse | null>(null);

  const inScope = useMemo(() => parseAssets(inScopeRaw), [inScopeRaw]);
  const outOfScope = useMemo(() => parseAssets(outOfScopeRaw), [outOfScopeRaw]);

  const covered = isCoveredByScope(target.identifier, inScope);
  const canSubmit = acknowledged && inScope.length > 0;

  const submitMutation = useMutation({
    mutationFn: () =>
      submitChecklist(
        {
          target_id: target.id,
          in_scope_assets: inScope,
          out_of_scope_assets: outOfScope,
          // Restricted classes are always declared as disallowed here.
          disallowed_test_classes: [...RESTRICTED_TEST_CLASSES],
          allowed_test_classes: allowed,
        },
        covered,
      ),
    onSuccess: setResult,
  });

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Record the program's scope"
          description={target.bounty_program ?? "Bug-bounty target"}
          actions={
            <StatusBadge kind="authorization" status={result?.status ?? "pending"} />
          }
        />

        <PanelBody className="space-y-5">
          <InlineNotice tone="info" title="Scope is entered by hand">
            Blacklight does not read the program's published policy. Copy the
            scope across accurately — the assessment stays inside whatever is
            recorded here, and an error in transcription is an error in the
            assessment.
          </InlineNotice>

          <Field
            label="In-scope assets"
            required
            hint="One per line. Wildcards are supported, for example *.example.com."
          >
            {({ id, describedBy }) => (
              <TextArea
                id={id}
                aria-describedby={describedBy}
                value={inScopeRaw}
                placeholder={"example.com\n*.example.com"}
                className="font-mono text-[0.8125rem]"
                onChange={(event) => {
                  setInScopeRaw(event.target.value);
                }}
              />
            )}
          </Field>

          <Field
            label="Out-of-scope assets"
            hint="Anything the program explicitly excludes. These are never touched."
          >
            {({ id, describedBy }) => (
              <TextArea
                id={id}
                aria-describedby={describedBy}
                value={outOfScopeRaw}
                placeholder={"admin.example.com\nstaging.example.com"}
                className="font-mono text-[0.8125rem]"
                onChange={(event) => {
                  setOutOfScopeRaw(event.target.value);
                }}
              />
            )}
          </Field>

          {inScope.length > 0 && !covered ? (
            <InlineNotice tone="warn" title="This target is not in the list you entered">
              <span className="font-mono text-xs">{target.identifier}</span> does
              not match any in-scope asset. The orchestrator runs the same check
              and will record a denial.
            </InlineNotice>
          ) : null}

          <div>
            <SectionLabel className="mb-3">Permitted test classes</SectionLabel>
            <div className="space-y-2.5">
              {STANDARD_TEST_CLASSES.map((testClass) => (
                <Checkbox
                  key={testClass}
                  label={TEST_CLASS_LABELS[testClass] ?? testClass}
                  checked={allowed.includes(testClass)}
                  onChange={(event) => {
                    setAllowed((current) =>
                      event.target.checked
                        ? [...current, testClass]
                        : current.filter((entry) => entry !== testClass),
                    );
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel className="mb-3">Restricted test classes</SectionLabel>
            <div className="space-y-2.5 rounded-[var(--radius-control)] border border-line bg-ink/60 p-3">
              {RESTRICTED_TEST_CLASSES.map((testClass) => (
                <Checkbox
                  key={testClass}
                  disabled
                  checked={false}
                  label={TEST_CLASS_LABELS[testClass] ?? testClass}
                  description="Disabled. The orchestrator rejects this class unless a target's authorization record explicitly opts in."
                />
              ))}
            </div>
          </div>

          <InlineNotice tone="uv" title="Defensive use only">
            Blacklight is for finding weaknesses in systems you are authorized to
            test, so they can be fixed. Testing outside a program's published
            scope is not covered by its authorization, whatever is recorded here.
          </InlineNotice>

          <div className="border-t border-line pt-4">
            <Checkbox
              checked={acknowledged}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
              }}
              label="I have read this program's policy and the scope above matches it."
              description="This acknowledgement is recorded against the authorization record with your user id."
            />
          </div>

          {submitMutation.isError ? (
            <ErrorState
              error={submitMutation.error}
              title="Could not submit this checklist"
            />
          ) : null}

          {result ? (
            result.status === "passing" ? (
              <InlineNotice tone="info" title="Scope recorded">
                A passing authorization record was written{" "}
                {formatRelative(result.decided_at)}. Assessments against this
                target will stay inside the scope above.
              </InlineNotice>
            ) : (
              <InlineNotice tone="danger" title="Scope was not accepted">
                The target identifier does not appear in the in-scope list, so
                the gate recorded a denial. Correct the asset list and submit
                again.
              </InlineNotice>
            )
          ) : null}

          <div className="flex items-center gap-3 border-t border-line pt-4">
            <Button
              variant="primary"
              disabled={!canSubmit}
              loading={submitMutation.isPending}
              icon={<ShieldCheck aria-hidden className="size-4" />}
              onClick={() => {
                submitMutation.mutate();
              }}
            >
              Submit scope checklist
            </Button>
            {!canSubmit ? (
              <span className="text-xs text-faint">
                {inScope.length === 0
                  ? "Add at least one in-scope asset."
                  : "Confirm the acknowledgement to continue."}
              </span>
            ) : null}
          </div>
        </PanelBody>
      </Panel>

      <Field label="Program name" hint="Shown on the report's authorization statement.">
        {({ id }) => (
          <TextInput
            id={id}
            readOnly
            value={target.bounty_program ?? ""}
            className="opacity-70"
          />
        )}
      </Field>
    </div>
  );
}
