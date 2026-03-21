"use client";

import { useMemo } from "react";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import { useRepositoryThesesQuery } from "@/features/repository/hooks/use-repository-theses-query";
import { useThesisDetailQuery } from "@/features/repository/hooks/use-thesis-detail-query";
import type { AppRole } from "@/stores/workspace-store";
import { getReviewQueue, getReviewerMembership } from "../utils";

interface UseReviewDataOptions {
  tenantId: string;
  activeRole: AppRole;
  selectedId: string;
  sessionEmail?: string | null;
}

export function useReviewData({
  tenantId,
  activeRole,
  selectedId,
  sessionEmail,
}: UseReviewDataOptions) {
  const thesesQuery = useRepositoryThesesQuery({
    tenantId,
    search: "",
    status: "ALL",
  });
  const membershipsQuery = useTenantMembershipsQuery(tenantId);

  const queue = useMemo(
    () => getReviewQueue(thesesQuery.data ?? [], activeRole),
    [activeRole, thesesQuery.data],
  );
  const currentMembership = useMemo(
    () => getReviewerMembership(membershipsQuery.data ?? [], sessionEmail),
    [membershipsQuery.data, sessionEmail],
  );
  const resolvedSelectedId = queue.some((thesis) => thesis.id === selectedId)
    ? selectedId
    : queue[0]?.id || "";
  const focusedQuery = useThesisDetailQuery(tenantId, resolvedSelectedId);

  return {
    thesesQuery,
    membershipsQuery,
    queue,
    currentMembership,
    resolvedSelectedId,
    focusedQuery,
  };
}
