import type { LucideIcon } from "lucide-react";
import { Boxes, Database, Globe, Server } from "lucide-react";

import type { TargetType } from "@/types/domain";
import { cn } from "@/utils/cn";

interface TargetTypeOption {
  value: TargetType;
  label: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
}

const OPTIONS: TargetTypeOption[] = [
  {
    value: "web",
    label: "Web / source project",
    description:
      "A deployed web application, optionally with its source repository for static analysis.",
    icon: Globe,
    available: true,
  },
  {
    value: "apk",
    label: "Android package",
    description:
      "An uploaded APK, analysed for hardcoded secrets, insecure storage and exported components.",
    icon: Boxes,
    available: false,
  },
  {
    value: "sql",
    label: "Database / SQL",
    description:
      "A database endpoint, reviewed for exposure, privilege configuration and injection surface.",
    icon: Database,
    available: false,
  },
  {
    value: "mcp",
    label: "MCP server",
    description:
      "A Model Context Protocol server, tested for auth bypass, cross-scope tool calls and instruction smuggling.",
    icon: Server,
    available: false,
  },
];

/**
 * Step one: what kind of thing are we assessing.
 *
 * Only the web module exists. The other three are shown because they are the
 * planned scope of the product and hiding them would misrepresent it, but they
 * are visibly unavailable rather than clickable and broken.
 */
export function TargetTypeStep({
  value,
  onSelect,
}: {
  value: TargetType;
  onSelect: (type: TargetType) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Target type</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={!option.available}
              aria-pressed={selected}
              onClick={() => {
                onSelect(option.value);
              }}
              className={cn(
                "rounded-[var(--radius-panel)] border p-4 text-left transition-colors",
                option.available
                  ? selected
                    ? "border-uv bg-uv/8"
                    : "border-line bg-surface hover:border-line-strong hover:bg-elevated"
                  : "cursor-not-allowed border-line bg-surface/50 opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <option.icon
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0",
                    selected ? "text-uv-glow" : "text-faint",
                  )}
                />
                {option.available ? null : (
                  <span className="rounded-[var(--radius-control)] border border-line-strong bg-elevated px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                    Planned
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-medium text-fg">{option.label}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
