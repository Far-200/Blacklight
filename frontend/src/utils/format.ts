/** Small, dependency-free formatting helpers used across features. */

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "—";
  return dateTimeFormatter.format(value).replace(",", "");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "—";
  return dateFormatter.format(value);
}

/** "4 minutes ago", "in 23 hours". Deliberately coarse. */
export function formatRelative(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "—";
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "—";

  const deltaSeconds = Math.round((target - now) / 1000);
  const future = deltaSeconds > 0;
  const seconds = Math.abs(deltaSeconds);

  let amount: number;
  let unit: string;

  if (seconds < 60) {
    amount = seconds;
    unit = "second";
  } else if (seconds < 3600) {
    amount = Math.round(seconds / 60);
    unit = "minute";
  } else if (seconds < 86400) {
    amount = Math.round(seconds / 3600);
    unit = "hour";
  } else if (seconds < 2592000) {
    amount = Math.round(seconds / 86400);
    unit = "day";
  } else {
    amount = Math.round(seconds / 2592000);
    unit = "month";
  }

  const plural = amount === 1 ? "" : "s";
  return future ? `in ${amount} ${unit}${plural}` : `${amount} ${unit}${plural} ago`;
}

/** Elapsed wall-clock time as "12m 04s" / "1h 12m". */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** 0–1 confidence as a percentage string. */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Shorten a UUID for display without pretending it is the whole value. */
export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
