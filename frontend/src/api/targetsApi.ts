import { env } from "@/config/env";
import { findMockTarget, mockTargets } from "@/mocks/targets";
import { clone, mockLatency } from "@/mocks/support";

import { NotImplementedOnBackendError } from "./client";
import type { TargetCreateRequest, TargetResponse } from "./contracts";

/**
 * Targets.
 *
 * The backend has models for targets but no routes, so every function here is
 * mock-only. When VITE_USE_MOCKS=false these throw rather than guessing a URL —
 * inventing an endpoint would make a missing feature look like a broken one.
 */

export async function listTargets(): Promise<TargetResponse[]> {
  if (!env.useMocks) throw new NotImplementedOnBackendError("GET /targets");
  return mockLatency(clone(mockTargets));
}

export async function getTarget(targetId: string): Promise<TargetResponse> {
  if (!env.useMocks)
    throw new NotImplementedOnBackendError(`GET /targets/${targetId}`);

  const target = findMockTarget(targetId);
  if (!target) throw new Error(`No target with id ${targetId}`);
  return mockLatency(clone(target));
}

/**
 * Creating a target is the entry point for the whole workflow and it does not
 * exist yet. The mock returns a target with `authorization_status: "pending"`,
 * which is what the real endpoint should also do — a freshly created target is
 * never authorized.
 */
export async function createTarget(
  body: TargetCreateRequest,
): Promise<TargetResponse> {
  if (!env.useMocks) throw new NotImplementedOnBackendError("POST /targets");

  const created: TargetResponse = {
    id: crypto.randomUUID(),
    name: body.name,
    target_type: body.target_type,
    ownership_mode: body.ownership_mode,
    identifier: body.identifier,
    root_domain: body.root_domain ?? null,
    bounty_program: body.bounty_program ?? null,
    repository_url: body.repository_url ?? null,
    notes: body.notes ?? null,
    created_at: new Date().toISOString(),
    authorization_status: "pending",
  };

  // Kept in the in-memory fixture list so the authorization gate can find it
  // immediately after creation. Lost on reload, which is correct for a mock.
  mockTargets.unshift(created);
  return mockLatency(clone(created), 600);
}
