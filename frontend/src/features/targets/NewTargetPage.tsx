import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck, Upload } from "lucide-react";

import { createTarget } from "@/api/targetsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { TargetType } from "@/types/domain";
import { OWNERSHIP_MODE_LABELS, TARGET_TYPE_LABELS } from "@/types/domain";
import { cn } from "@/utils/cn";

import type { WebTargetFormValues } from "./schema";
import { webTargetDefaults, webTargetSchema } from "./schema";
import { TargetTypeStep } from "./TargetTypeStep";

const STEPS = ["Target type", "Details", "Review"] as const;

/**
 * Target intake.
 *
 * Three steps, because the decisions genuinely come in that order: what kind of
 * target, what it is, and then a chance to check it before anything is created.
 * Creating a target never starts a scan — the authorization gate sits between
 * the two and cannot be skipped.
 */
export function NewTargetPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [targetType, setTargetType] = useState<TargetType>("web");

  const form = useForm<WebTargetFormValues>({
    resolver: zodResolver(webTargetSchema),
    defaultValues: webTargetDefaults,
    mode: "onBlur",
  });

  // useWatch rather than form.watch: the latter returns a fresh function on
  // every render, which the React Compiler cannot memoize safely.
  const ownershipMode = useWatch({
    control: form.control,
    name: "ownershipMode",
  });

  const createMutation = useMutation({
    mutationFn: (values: WebTargetFormValues) =>
      createTarget({
        name: values.name,
        target_type: targetType,
        ownership_mode: values.ownershipMode,
        identifier: values.websiteUrl,
        root_domain: values.rootDomain,
        bounty_program: values.bountyProgram || undefined,
        repository_url: values.repositoryUrl || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: (target) => {
      // Straight to the gate. A target with no passing authorization record is
      // not usable, so there is nowhere else worth sending them.
      void navigate(`/targets/${target.id}/authorize`);
    },
  });

  const goToDetails = () => {
    setStep(1);
  };

  const goToReview = async () => {
    const valid = await form.trigger();
    if (valid) setStep(2);
  };

  const values = form.getValues();

  return (
    <>
      <PageHeader
        title="New assessment"
        description="Register a target, then verify you are authorized to test it."
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "New assessment" }]}
      />

      <StepIndicator current={step} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {step === 0 ? (
            <Panel>
              <PanelHeader
                title="What are you assessing?"
                description="Only the web module is built. The rest are shown as planned scope."
              />
              <PanelBody className="space-y-5">
                <TargetTypeStep value={targetType} onSelect={setTargetType} />

                <div className="flex justify-end border-t border-line pt-4">
                  <Button
                    variant="primary"
                    icon={<ArrowRight aria-hidden className="size-4" />}
                    onClick={goToDetails}
                  >
                    Continue
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          {step === 1 ? (
            <Panel>
              <PanelHeader
                title="Target details"
                description={TARGET_TYPE_LABELS[targetType]}
              />
              <PanelBody className="space-y-5">
                <Field
                  label="Assessment name"
                  required
                  error={form.formState.errors.name?.message}
                  hint="How this assessment appears in your dashboard and reports."
                >
                  {({ id, describedBy, invalid }) => (
                    <TextInput
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      placeholder="Aurora Storefront"
                      {...form.register("name")}
                    />
                  )}
                </Field>

                <Field
                  label="Website URL"
                  required
                  error={form.formState.errors.websiteUrl?.message}
                  hint="The deployed application to assess."
                >
                  {({ id, describedBy, invalid }) => (
                    <TextInput
                      id={id}
                      mono
                      type="url"
                      aria-describedby={describedBy}
                      invalid={invalid}
                      placeholder="https://shop.example.com"
                      {...form.register("websiteUrl")}
                    />
                  )}
                </Field>

                <Field
                  label="Root domain"
                  required
                  error={form.formState.errors.rootDomain?.message}
                  hint="Used for the ownership challenge. The registrable domain only — no scheme, no path."
                >
                  {({ id, describedBy, invalid }) => (
                    <TextInput
                      id={id}
                      mono
                      aria-describedby={describedBy}
                      invalid={invalid}
                      placeholder="example.com"
                      {...form.register("rootDomain")}
                    />
                  )}
                </Field>

                <Field
                  label="Git repository URL"
                  error={form.formState.errors.repositoryUrl?.message}
                  hint="Enables dependency, secret and static analysis of the source."
                >
                  {({ id, describedBy, invalid }) => (
                    <TextInput
                      id={id}
                      mono
                      type="url"
                      aria-describedby={describedBy}
                      invalid={invalid}
                      placeholder="https://github.com/org/repo"
                      {...form.register("repositoryUrl")}
                    />
                  )}
                </Field>

                <div>
                  <SectionLabel className="mb-2">Source archive</SectionLabel>
                  <div
                    aria-disabled
                    className="flex flex-col items-center justify-center rounded-[var(--radius-control)] border border-dashed border-line bg-ink/60 px-4 py-7 text-center opacity-70"
                  >
                    <Upload aria-hidden className="size-5 text-faint" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      Drop a ZIP of the project here
                    </p>
                    <p className="mt-1 font-mono text-[0.6875rem] text-faint">
                      Upload API not implemented — this drop zone does nothing
                    </p>
                  </div>
                </div>

                <fieldset className="space-y-3 border-t border-line pt-5">
                  <legend className="mb-2 text-[0.8125rem] font-medium text-fg">
                    How are you authorized to test this?
                  </legend>

                  {(["self_owned", "bug_bounty"] as const).map((mode) => (
                    <label
                      key={mode}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-3 transition-colors",
                        ownershipMode === mode
                          ? "border-uv bg-uv/8"
                          : "border-line bg-ink hover:border-line-strong",
                      )}
                    >
                      <input
                        type="radio"
                        value={mode}
                        className="mt-0.5 size-4 accent-[var(--color-uv)]"
                        {...form.register("ownershipMode")}
                      />
                      <span className="min-w-0">
                        <span className="block text-[0.8125rem] text-fg">
                          {OWNERSHIP_MODE_LABELS[mode]}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {mode === "self_owned"
                            ? "You will prove control of the root domain with a DNS TXT record or a file at a well-known path."
                            : "You will record the program's published scope, and testing stays inside it."}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                {ownershipMode === "bug_bounty" ? (
                  <Field
                    label="Bug-bounty program"
                    required
                    error={form.formState.errors.bountyProgram?.message}
                    hint="The program whose published policy authorizes this testing."
                  >
                    {({ id, describedBy, invalid }) => (
                      <TextInput
                        id={id}
                        aria-describedby={describedBy}
                        invalid={invalid}
                        placeholder="Helios Security — public program"
                        {...form.register("bountyProgram")}
                      />
                    )}
                  </Field>
                ) : null}

                <Field
                  label="Notes"
                  error={form.formState.errors.notes?.message}
                  hint="Anything the assessment should account for — environment, rate limits, known issues."
                >
                  {({ id, describedBy, invalid }) => (
                    <TextArea
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      placeholder="Staging deployment. Production database is not reachable from this host."
                      {...form.register("notes")}
                    />
                  )}
                </Field>

                <div className="flex items-center justify-between border-t border-line pt-4">
                  <Button
                    variant="ghost"
                    icon={<ArrowLeft aria-hidden className="size-4" />}
                    onClick={() => {
                      setStep(0);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    icon={<ArrowRight aria-hidden className="size-4" />}
                    onClick={() => {
                      void goToReview();
                    }}
                  >
                    Review
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          {step === 2 ? (
            <Panel>
              <PanelHeader
                title="Review"
                description="Nothing is scanned yet. Creating the target only registers it."
              />
              <PanelBody className="space-y-5">
                <dl className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  <ReviewRow label="Type" value={TARGET_TYPE_LABELS[targetType]} />
                  <ReviewRow label="Name" value={values.name} />
                  <ReviewRow label="Website" value={values.websiteUrl} mono />
                  <ReviewRow label="Root domain" value={values.rootDomain} mono />
                  <ReviewRow
                    label="Repository"
                    value={values.repositoryUrl || "Not provided"}
                    mono
                  />
                  <ReviewRow
                    label="Authorization"
                    value={OWNERSHIP_MODE_LABELS[values.ownershipMode]}
                  />
                  {values.ownershipMode === "bug_bounty" ? (
                    <ReviewRow label="Program" value={values.bountyProgram || "—"} />
                  ) : null}
                  <ReviewRow label="Notes" value={values.notes || "None"} />
                </dl>

                <InlineNotice tone="uv" title="Authorization comes next">
                  {values.ownershipMode === "self_owned"
                    ? "You will be asked to prove control of this domain before any scan can start."
                    : "You will be asked to record the program's scope before any scan can start."}{" "}
                  The orchestrator re-checks that record server-side on every
                  scan-start request.
                </InlineNotice>

                {createMutation.isError ? (
                  <ErrorState
                    error={createMutation.error}
                    title="Could not create this target"
                  />
                ) : null}

                <div className="flex items-center justify-between border-t border-line pt-4">
                  <Button
                    variant="ghost"
                    icon={<ArrowLeft aria-hidden className="size-4" />}
                    onClick={() => {
                      setStep(1);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    icon={<ShieldCheck aria-hidden className="size-4" />}
                    loading={createMutation.isPending}
                    onClick={() => {
                      createMutation.mutate(form.getValues());
                    }}
                  >
                    Create target and authorize
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Before you start" />
            <PanelBody className="space-y-3 text-[0.8125rem] leading-relaxed text-muted">
              <p>
                Blacklight only assesses targets you control or are explicitly
                authorized to test. Authorization is verified by the
                orchestrator, not asserted here.
              </p>
              <p>
                Registering a target does not start anything. Scanning begins
                only after a passing authorization record exists.
              </p>
            </PanelBody>
          </Panel>

          <InlineNotice tone="warn" title="Target creation is mocked">
            There is no POST /targets endpoint yet, so this target is held in
            browser memory and disappears on reload.
          </InlineNotice>
        </div>
      </div>
    </>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {STEPS.map((label, index) => (
        <li key={label} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="h-px w-6 bg-line-strong" />
          ) : null}
          <span
            className={cn(
              "flex items-center gap-2 text-xs",
              index === current
                ? "text-fg"
                : index < current
                  ? "text-muted"
                  : "text-faint",
            )}
            aria-current={index === current ? "step" : undefined}
          >
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full border font-mono text-[0.625rem]",
                index === current
                  ? "border-uv bg-uv/15 text-uv-glow"
                  : index < current
                    ? "border-uv/40 bg-uv/8 text-uv-glow"
                    : "border-line bg-ink text-faint",
              )}
            >
              {index + 1}
            </span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ReviewRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 px-3 py-2.5">
      <dt className="text-[0.8125rem] text-muted">{label}</dt>
      <dd
        className={cn(
          "max-w-[60%] text-right break-words text-fg",
          mono ? "font-mono text-xs" : "text-[0.8125rem]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
