"use client";

import { useQuery } from "@tanstack/react-query";
import { listTheses } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";

export function useRepositoryThesesQuery(payload: {
  tenantId: string;
  search: string;
  status: string;
}) {
  return useQuery({
    queryKey: queryKeys.repository.theses(
      payload.tenantId,
      payload.search,
      payload.status,
    ),
    queryFn: () =>
      listTheses({
        tenantId: payload.tenantId,
        search: payload.search,
        status: payload.status,
      }),
    enabled: Boolean(payload.tenantId),
  });
}
