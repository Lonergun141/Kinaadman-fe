"use client";

import { useQuery } from "@tanstack/react-query";
import { listTheses } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";

export function useRepositoryThesesQuery(payload: {
  tenantId: string;
  search: string;
  status: string;
  authorUserId?: string;
  visibility?: string;
  thesisType?: string;
  departmentId?: string;
  programId?: string;
  year?: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: queryKeys.repository.theses(
      payload.tenantId,
      payload.search,
      payload.status,
      payload.authorUserId,
      payload.visibility,
      payload.thesisType,
      payload.departmentId,
      payload.programId,
      payload.year,
      payload.keyword,
    ),
    queryFn: () =>
      listTheses({
        tenantId: payload.tenantId,
        search: payload.search,
        status: payload.status,
        authorUserId: payload.authorUserId,
        visibility: payload.visibility,
        thesisType: payload.thesisType,
        departmentId: payload.departmentId,
        programId: payload.programId,
        year: payload.year,
        keyword: payload.keyword,
      }),
    enabled: Boolean(payload.tenantId),
  });
}
