"use client";

import { useQuery } from "@tanstack/react-query";
import { listDepartments, listPrograms } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";

export function useRepositoryCatalog(tenantId: string) {
  const departmentsQuery = useQuery({
    queryKey: queryKeys.repository.departments(tenantId),
    queryFn: () => listDepartments(tenantId),
    enabled: Boolean(tenantId),
  });

  const programsQuery = useQuery({
    queryKey: queryKeys.repository.programs(tenantId),
    queryFn: () => listPrograms(tenantId),
    enabled: Boolean(tenantId),
  });

  return {
    departmentsQuery,
    programsQuery,
  };
}
