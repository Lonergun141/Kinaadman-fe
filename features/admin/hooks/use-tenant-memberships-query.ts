"use client";

import { useQuery } from "@tanstack/react-query";
import { listTenantMemberships } from "@/features/admin/api";
import { queryKeys } from "@/lib/query-keys";

export function useTenantMembershipsQuery(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.users.memberships(tenantId),
    queryFn: () => listTenantMemberships(tenantId),
    enabled: Boolean(tenantId),
  });
}
