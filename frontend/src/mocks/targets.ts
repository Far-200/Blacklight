import type { TargetResponse } from "@/api/contracts";

import { daysAgo, hoursAgo } from "./support";

/**
 * Mock targets. There is no POST /targets or GET /targets on the backend yet,
 * so every target screen resolves from here. See frontend/API_GAPS.md.
 */
export const mockTargets: TargetResponse[] = [
  {
    id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c01",
    name: "Aurora Storefront",
    target_type: "web",
    ownership_mode: "self_owned",
    identifier: "https://shop.aurora-labs.dev",
    root_domain: "aurora-labs.dev",
    bounty_program: null,
    repository_url: "https://github.com/aurora-labs/storefront",
    notes: "Staging deployment. Production database is not reachable from this host.",
    created_at: daysAgo(11),
    authorization_status: "passing",
  },
  {
    id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c02",
    name: "Payments API",
    target_type: "web",
    ownership_mode: "self_owned",
    identifier: "https://api.aurora-labs.dev",
    root_domain: "aurora-labs.dev",
    bounty_program: null,
    repository_url: "https://github.com/aurora-labs/payments-api",
    notes: null,
    created_at: daysAgo(4),
    authorization_status: "passing",
  },
  {
    id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c03",
    name: "Helios public program",
    target_type: "web",
    ownership_mode: "bug_bounty",
    identifier: "https://www.helios-demo.example",
    root_domain: null,
    bounty_program: "Helios Security — public program",
    repository_url: null,
    notes: "Rate limit set to 2 req/s per program policy.",
    created_at: daysAgo(2),
    authorization_status: "passing",
  },
  {
    id: "b1a7f2c4-0f1e-4a3b-9c2d-1e5f7a8b9c04",
    name: "Internal toolserver (MCP)",
    target_type: "mcp",
    ownership_mode: "self_owned",
    identifier: "https://tools.aurora-labs.dev/mcp",
    root_domain: "aurora-labs.dev",
    bounty_program: null,
    repository_url: null,
    notes: "MCP module is not built yet — target registered for planning only.",
    created_at: hoursAgo(20),
    authorization_status: "pending",
  },
];

export function findMockTarget(targetId: string): TargetResponse | undefined {
  return mockTargets.find((target) => target.id === targetId);
}
