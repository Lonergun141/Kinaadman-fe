import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export async function invalidateTenantRepositoryQueries(
  queryClient: QueryClient,
  tenantId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["repository", "theses", tenantId],
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.repository.departments(tenantId),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.repository.programs(tenantId),
    }),
  ]);
}

export async function invalidateThesisDetailQuery(
  queryClient: QueryClient,
  tenantId: string,
  thesisId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.repository.thesisDetail(tenantId, thesisId),
  });
}

export async function invalidateMembershipsQuery(
  queryClient: QueryClient,
  tenantId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.users.memberships(tenantId),
  });
}

export async function invalidateAuditQuery(
  queryClient: QueryClient,
  tenantId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.admin.audit(tenantId),
  });
}
