import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  Database,
  KeyRound,
  Palette,
  Users,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/utils/cn";

/**
 * Settings.
 *
 * Every group here is a placeholder. Nothing persists, because there is no
 * settings endpoint and no user record to attach preferences to. Each panel
 * says so rather than presenting controls that silently discard input.
 */

interface SettingsGroup {
  key: string;
  title: string;
  icon: LucideIcon;
  description: string;
  status: "planned" | "partial";
  items: Array<{ label: string; detail: string }>;
}

const GROUPS: SettingsGroup[] = [
  {
    key: "appearance",
    title: "Appearance",
    icon: Palette,
    description:
      "Blacklight is dark-only for now. The severity palette is fixed so that a colour always means the same thing across screens and exported reports.",
    status: "planned",
    items: [
      { label: "Theme", detail: "Dark (fixed)" },
      { label: "Reduced motion", detail: "Follows your operating system setting" },
      { label: "Density", detail: "Comfortable (fixed)" },
    ],
  },
  {
    key: "modules",
    title: "Scanner modules",
    icon: Wrench,
    description:
      "Which analysis modules run as part of an assessment. The sandbox is not connected yet, so these cannot be toggled.",
    status: "planned",
    items: [
      { label: "Repository inspection", detail: "Planned" },
      { label: "Dependency analysis", detail: "Planned" },
      { label: "Secret detection", detail: "Planned" },
      { label: "Static analysis", detail: "Planned" },
      { label: "Configuration analysis", detail: "Planned" },
      { label: "MCP server testing", detail: "Planned" },
    ],
  },
  {
    key: "integrations",
    title: "API integrations",
    icon: KeyRound,
    description:
      "Credentials for outbound services. Keys will be stored server-side and never sent to the browser — this screen will only ever show whether one is configured.",
    status: "planned",
    items: [
      { label: "Model provider key", detail: "Not configured" },
      { label: "Source host access token", detail: "Not configured" },
      { label: "Bounty platform token", detail: "Not configured" },
    ],
  },
  {
    key: "ollama",
    title: "Local model connection",
    icon: Cpu,
    description:
      "An optional local Ollama instance for the explanation and summarisation step, so an assessment can run without an external model provider.",
    status: "planned",
    items: [
      { label: "Endpoint", detail: "http://localhost:11434" },
      { label: "Model", detail: "Not selected" },
      { label: "Status", detail: "Backend integration not built" },
    ],
  },
  {
    key: "retention",
    title: "Data retention",
    icon: Database,
    description:
      "How long scan artefacts, evidence and audit entries are kept. Audit entries are append-only by design and will not be deletable from here.",
    status: "planned",
    items: [
      { label: "Scan artefacts", detail: "Retained indefinitely" },
      { label: "Evidence snippets", detail: "Retained indefinitely" },
      { label: "Audit log", detail: "Append-only, never purged" },
    ],
  },
  {
    key: "team",
    title: "Team",
    icon: Users,
    description:
      "Membership and roles. Authentication and RBAC do not exist in the backend yet, so there is no account to manage.",
    status: "planned",
    items: [
      { label: "Members", detail: "Accounts not implemented" },
      { label: "Roles", detail: "RBAC not implemented" },
    ],
  },
];

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configuration for assessments, integrations and data handling."
      />

      <InlineNotice tone="uv" title="Nothing on this screen saves yet" className="mb-6">
        There is no settings endpoint on the orchestrator and no account to
        attach preferences to. These panels show the shape of what is coming so
        it can be reviewed early.
      </InlineNotice>

      <div className="grid gap-4 lg:grid-cols-2">
        {GROUPS.map((group) => (
          <Panel key={group.key}>
            <PanelHeader
              title={
                <span className="flex items-center gap-2">
                  <group.icon aria-hidden className="size-4 text-faint" />
                  {group.title}
                </span>
              }
              actions={
                <span className="rounded-[var(--radius-control)] border border-line-strong bg-elevated px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                  {group.status}
                </span>
              }
            />
            <PanelBody className="space-y-4">
              <p className="text-[0.8125rem] leading-relaxed text-muted">
                {group.description}
              </p>

              <div>
                <SectionLabel className="mb-2">Fields</SectionLabel>
                <dl className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex flex-wrap items-baseline justify-between gap-2 px-3 py-2",
                      )}
                    >
                      <dt className="text-[0.8125rem] text-fg">{item.label}</dt>
                      <dd className="font-mono text-xs text-faint">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>

      <InlineNotice tone="warn" title="Keys are never stored in the browser" className="mt-6">
        When integrations are built, credentials will be held by the
        orchestrator and referenced by name. No API key appears in frontend
        source, in mock fixtures, or in this interface.
      </InlineNotice>
    </>
  );
}
