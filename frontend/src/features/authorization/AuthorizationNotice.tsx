import { FileCheck, Lock, ServerCog } from "lucide-react";

import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";

/**
 * Why this screen exists.
 *
 * Written as a product explanation rather than a legal notice. The point being
 * made is that the gate is a mechanism, not a promise — it is enforced by the
 * orchestrator on every scan-start request, and the interface has no way to
 * bypass it.
 */
export function AuthorizationNotice() {
  const points = [
    {
      icon: Lock,
      title: "Nothing scans without this",
      body: "A scan job cannot reach a running state without a passing authorization record. The orchestrator checks for one on every scan-start request and treats a failure as final.",
    },
    {
      icon: ServerCog,
      title: "The check is server-side",
      body: "Blacklight re-derives the target and re-reads its authorization record on the backend each time. It never accepts an authorization claim from the browser, including from this screen.",
    },
    {
      icon: FileCheck,
      title: "Every decision is recorded",
      body: "Challenges, verifications, grants, denials and scan-start attempts are written to an append-only audit log — the allowed ones and the blocked ones alike.",
    },
  ];

  return (
    <Panel>
      <PanelHeader
        title="Why verification is required"
        description="Authorization is a product feature, not fine print."
      />
      <PanelBody>
        <ul className="space-y-4">
          {points.map((point) => (
            <li key={point.title} className="flex gap-3">
              <point.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-uv-glow" />
              <div>
                <p className="text-[0.8125rem] font-medium text-fg">{point.title}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                  {point.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}
