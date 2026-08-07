import { useQuery } from "@tanstack/react-query";

import { fetchHealth } from "@/api/healthApi";
import { queryKeys } from "@/api/queryKeys";

export type BackendConnectionState = "checking" | "online" | "offline";

/**
 * Polls GET /health — a real, implemented endpoint.
 *
 * This runs in mock mode too. The connection indicator should report the actual
 * state of the orchestrator regardless of where screen data is coming from,
 * otherwise "mock mode" quietly becomes "we have no idea".
 */
export function useBackendHealth(): {
  state: BackendConnectionState;
  lastCheckedAt: number | undefined;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 10_000,
  });

  const state: BackendConnectionState = query.isPending
    ? "checking"
    : query.isError || query.data?.status !== "ok"
      ? "offline"
      : "online";

  return {
    state,
    lastCheckedAt: query.dataUpdatedAt || query.errorUpdatedAt || undefined,
    refetch: () => {
      void query.refetch();
    },
  };
}
