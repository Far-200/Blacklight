import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

import { CopyButton } from "./CopyButton";

/**
 * Verbatim tool output.
 *
 * Monospace is reserved for material like this — things a machine produced and
 * a human needs to read character by character. It is never used for prose.
 */
export function CodeEvidence({
  content,
  caption,
  startLine,
  copyable = true,
  className,
}: {
  content: string;
  /** Where the evidence came from, e.g. "Collected from gitleaks". */
  caption?: ReactNode;
  /** When set, lines are numbered from here — matching the source file. */
  startLine?: number;
  copyable?: boolean;
  className?: string;
}) {
  const lines = content.split("\n");

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[var(--radius-control)] border border-line bg-void",
        className,
      )}
    >
      {caption || copyable ? (
        <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-ink px-3 py-1.5">
          <span className="truncate font-mono text-[0.6875rem] tracking-wide text-faint">
            {caption}
          </span>
          {copyable ? (
            <CopyButton value={content} variant="ghost" size="sm" label="Copy" />
          ) : null}
        </figcaption>
      ) : null}

      <pre className="overflow-x-auto px-3 py-2.5 text-[0.8125rem] leading-relaxed">
        <code>
          {lines.map((line, index) => (
            <span key={index} className="flex gap-4">
              {startLine !== undefined ? (
                <span
                  aria-hidden
                  className="w-8 shrink-0 text-right text-faint select-none"
                >
                  {startLine + index}
                </span>
              ) : null}
              <span className="whitespace-pre text-fg/90">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
