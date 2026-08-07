import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import {
  FINDING_STATUSES,
  FINDING_STATUS_LABELS,
  SEVERITIES,
} from "@/types/findings";
import { SEVERITY_STYLES } from "@/utils/severity";

import type { FindingFilterState, SortKey } from "./filterState";
import { EMPTY_FILTERS } from "./filterState";
import { cn } from "@/utils/cn";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

export function FindingFilters({
  filters,
  sources,
  resultCount,
  onChange,
}: {
  filters: FindingFilterState;
  sources: string[];
  resultCount: number;
  onChange: (next: FindingFilterState) => void;
}) {
  const active =
    filters.search.length > 0 ||
    filters.severities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.sources.length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
        />
        <TextInput
          type="search"
          value={filters.search}
          placeholder="Search titles, assets, files, CWE"
          aria-label="Search findings"
          className="pl-9"
          onChange={(event) => {
            onChange({ ...filters, search: event.target.value });
          }}
        />
      </div>

      <FilterGroup label="Severity">
        {SEVERITIES.map((severity) => {
          const style = SEVERITY_STYLES[severity];
          const Icon = style.icon;
          const selected = filters.severities.includes(severity);
          return (
            <FilterChip
              key={severity}
              selected={selected}
              onClick={() => {
                onChange({
                  ...filters,
                  severities: toggle(filters.severities, severity),
                });
              }}
            >
              <Icon aria-hidden className={cn("size-3", selected ? style.text : "")} />
              {style.label}
            </FilterChip>
          );
        })}
      </FilterGroup>

      <FilterGroup label="Status">
        {FINDING_STATUSES.map((status) => (
          <FilterChip
            key={status}
            selected={filters.statuses.includes(status)}
            onClick={() => {
              onChange({ ...filters, statuses: toggle(filters.statuses, status) });
            }}
          >
            {FINDING_STATUS_LABELS[status]}
          </FilterChip>
        ))}
      </FilterGroup>

      {sources.length > 0 ? (
        <FilterGroup label="Detected by">
          {sources.map((source) => (
            <FilterChip
              key={source}
              selected={filters.sources.includes(source)}
              onClick={() => {
                onChange({ ...filters, sources: toggle(filters.sources, source) });
              }}
            >
              {source}
            </FilterChip>
          ))}
        </FilterGroup>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-xs text-muted">
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => {
              onChange({ ...filters, sort: event.target.value as SortKey });
            }}
            className="h-8 rounded-[var(--radius-control)] border border-line bg-ink px-2 text-xs text-fg hover:border-line-strong focus:border-uv focus:outline-none"
          >
            <option value="severity">Severity</option>
            <option value="confidence">Confidence</option>
            <option value="detected">Most recent</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-faint tabular-nums">
            {resultCount} shown
          </span>
          {active ? (
            <Button
              size="sm"
              variant="ghost"
              icon={<X aria-hidden className="size-3.5" />}
              onClick={() => {
                onChange({ ...EMPTY_FILTERS, sort: filters.sort });
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-[0.6875rem] tracking-[0.14em] text-faint uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-2 py-1 text-xs transition-colors",
        selected
          ? "border-uv/45 bg-uv/12 text-fg"
          : "border-line bg-ink text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
