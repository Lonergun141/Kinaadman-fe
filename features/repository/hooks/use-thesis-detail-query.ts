"use client";

import { useQuery } from "@tanstack/react-query";
import { getThesis } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";

export function useThesisDetailQuery(tenantId: string, thesisId: string) {
  return useQuery({
    queryKey: queryKeys.repository.thesisDetail(tenantId, thesisId),
    queryFn: () => getThesis(tenantId, thesisId),
    enabled: Boolean(tenantId && thesisId),
  });
}
