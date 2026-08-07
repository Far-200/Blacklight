import type { FindingStatus, Severity } from "@/types/findings";

/** Filter and sort state for the findings list. */

export type SortKey = "severity" | "confidence" | "detected";

export interface FindingFilterState {
  search: string;
  severities: Severity[];
  statuses: FindingStatus[];
  sources: string[];
  sort: SortKey;
}

export const EMPTY_FILTERS: FindingFilterState = {
  search: "",
  severities: [],
  statuses: [],
  sources: [],
  sort: "severity",
};
