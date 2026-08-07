import type { ReportViewModel } from "@/types/findings";

import { hoursAgo } from "./support";

/**
 * Mock reports. The backend does not generate reports and no model call is
 * made from the frontend — this narrative was written by hand as a fixture.
 * See frontend/API_GAPS.md.
 */

const AURORA_REPORT: ReportViewModel = {
  scanId: "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a01",
  targetName: "Aurora Storefront",
  targetIdentifier: "https://shop.aurora-labs.dev",
  generatedAt: hoursAgo(5),
  overallRisk: "critical",
  executiveSummary:
    "Twelve findings were confirmed across the Aurora Storefront application and its source repository. One is critical: a production database password is committed to version control and present in repository history, so it must be rotated rather than merely deleted. Three high-severity findings follow — a SQL statement built by string concatenation on the order-lookup path, a session cookie missing Secure and SameSite, and a dependency covered by published advisories that processes user-uploaded images. The remaining findings are hardening gaps: absent security headers, verbose error responses, and legacy TLS versions still offered at the edge. Nothing in this assessment demonstrates a successful intrusion; these are conditions an attacker would look for, evidenced by tool output.",
  scope: {
    inScope: ["shop.aurora-labs.dev", "github.com/aurora-labs/storefront"],
    outOfScope: [
      "admin.aurora-labs.dev",
      "Any host not resolving under aurora-labs.dev",
      "Third-party payment provider endpoints",
    ],
    authorizationMethod: "DNS TXT record",
    authorizationDecidedAt: hoursAgo(6),
  },
  methodology: [
    "Domain ownership verified through a DNS TXT challenge before any request was sent to the target.",
    "Passive reconnaissance of publicly reachable endpoints and response metadata.",
    "Repository inspection across 412 files, covering dependency manifests and tracked configuration.",
    "Secret detection over the working tree and reachable history.",
    "Static analysis with 214 rules against the application source.",
    "Configuration review of TLS parameters and HTTP response headers.",
    "Normalization and deduplication of 31 raw tool results into 12 findings.",
    "AI-assisted explanation of each finding, grounded in the collected evidence.",
  ],
  severityCounts: { critical: 1, high: 3, medium: 4, low: 3, info: 1 },
  prioritizedFindingIds: ["f-0001", "f-0002", "f-0004", "f-0003", "f-0007"],
  limitations: [
    "No exploitation was attempted. Findings describe conditions observed, not proven intrusions.",
    "Credential stuffing, brute force and volumetric testing were disabled and were not performed.",
    "Only the staging deployment was assessed. Production configuration may differ.",
    "Authenticated application areas were not covered — no test account was supplied.",
    "Scanner confidence is reported per finding. Findings below 0.8 confidence warrant manual verification before remediation work is scheduled.",
  ],
  authorizationStatement:
    "This assessment was performed against a target whose ownership was verified through a DNS TXT challenge on the root domain aurora-labs.dev before any scan module executed. The scope gate recorded a passing authorization record, and the audit log holds an entry for the scan-start decision. Restricted test classes remained disabled for the duration of the assessment.",
};

export const mockReportsByScan: Record<string, ReportViewModel> = {
  "7c9e1d20-4b6a-4f13-8a55-2b0d9e4f1a01": AURORA_REPORT,
};
