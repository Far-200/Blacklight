import type { DiffHunk } from "@/types/findings";
import { cn } from "@/utils/cn";

/**
 * A minimal unified-diff view.
 *
 * Deliberately not a code editor: this content is read, not edited, and a full
 * editor would add hundreds of kilobytes to render forty lines. Added and
 * removed lines carry a +/− gutter mark as well as a tint, so the diff is
 * readable without colour.
 */
export function DiffViewer({
  hunks,
  filePath,
  className,
}: {
  hunks: DiffHunk[];
  filePath: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-control)] border border-line bg-void",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-3 py-1.5">
        <span className="truncate font-mono text-[0.6875rem] text-muted">
          {filePath}
        </span>
        <span className="shrink-0 font-mono text-[0.625rem] text-faint">
          unified diff
        </span>
      </div>

      <div className="overflow-x-auto">
        {hunks.map((hunk, hunkIndex) => (
          <div key={hunkIndex}>
            <p className="border-y border-line bg-elevated/40 px-3 py-1 font-mono text-[0.6875rem] text-faint">
              {hunk.header}
            </p>

            <table className="w-full border-collapse font-mono text-[0.8125rem]">
              <caption className="sr-only">
                Proposed changes to {filePath}
              </caption>
              <tbody>
                {hunk.lines.map((line, lineIndex) => (
                  <tr
                    key={lineIndex}
                    className={cn(
                      line.kind === "added" && "bg-ok/8",
                      line.kind === "removed" && "bg-danger/8",
                    )}
                  >
                    <td className="w-10 px-2 py-0.5 text-right align-top text-faint select-none">
                      {line.oldLine ?? ""}
                    </td>
                    <td className="w-10 px-2 py-0.5 text-right align-top text-faint select-none">
                      {line.newLine ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-5 px-1 py-0.5 text-center align-top select-none",
                        line.kind === "added"
                          ? "text-ok"
                          : line.kind === "removed"
                            ? "text-danger"
                            : "text-faint",
                      )}
                      aria-label={
                        line.kind === "added"
                          ? "Added line"
                          : line.kind === "removed"
                            ? "Removed line"
                            : undefined
                      }
                    >
                      {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
                    </td>
                    <td
                      className={cn(
                        "py-0.5 pr-3 whitespace-pre",
                        line.kind === "context" ? "text-fg/75" : "text-fg",
                      )}
                    >
                      {line.content || " "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
