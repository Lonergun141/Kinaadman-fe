"use client";

import { useQuery } from "@tanstack/react-query";
import { listAuditLog } from "@/features/admin/api";
import { queryKeys } from "@/lib/query-keys";

export function useAuditLogQuery(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.admin.audit(tenantId),
    queryFn: () => listAuditLog(tenantId),
    enabled: Boolean(tenantId),
  });
}
