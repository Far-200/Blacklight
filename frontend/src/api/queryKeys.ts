/** Single registry of TanStack Query cache keys, so invalidation is greppable. */
export const queryKeys = {
  health: ["health"] as const,
  dashboard: ["dashboard", "summary"] as const,
  targets: ["targets"] as const,
  target: (targetId: string) => ["targets", targetId] as const,
  scans: ["scans"] as const,
  scan: (scanId: string) => ["scans", scanId] as const,
  findings: (scanId: string) => ["scans", scanId, "findings"] as const,
  findingSources: ["findings", "sources"] as const,
  report: (scanId: string) => ["scans", scanId, "report"] as const,
  fixes: (scanId: string) => ["scans", scanId, "fixes"] as const,
};
