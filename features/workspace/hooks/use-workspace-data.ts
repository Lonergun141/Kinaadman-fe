"use client";

import { useMemo } from "react";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import { useRepositoryCatalog } from "@/features/repository/hooks/use-repository-catalog";
import { useRepositoryThesesQuery } from "@/features/repository/hooks/use-repository-theses-query";
import { useThesisDetailQuery } from "@/features/repository/hooks/use-thesis-detail-query";
import {
  getAdviserOptions,
  getCurrentMembership,
  getWorkspaceTheses,
} from "../utils";

interface UseWorkspaceDataOptions {
  tenantId: string;
  selectedId: string;
  sessionEmail?: string | null;
  sessionUserId?: string | null;
}

export function useWorkspaceData({
  tenantId,
  selectedId,
  sessionEmail,
  sessionUserId,
}: UseWorkspaceDataOptions) {
  const thesesQuery = useRepositoryThesesQuery({
    tenantId,
    search: "",
    status: "ALL",
    authorUserId: sessionUserId || undefined,
  });
  const { departmentsQuery, programsQuery } = useRepositoryCatalog(tenantId);
  const membershipsQuery = useTenantMembershipsQuery(tenantId);

  const workspaceTheses = useMemo(
    () => getWorkspaceTheses(thesesQuery.data ?? []),
    [thesesQuery.data],
  );
  const adviserOptions = useMemo(
    () => getAdviserOptions(membershipsQuery.data ?? []),
    [membershipsQuery.data],
  );
  const currentMembership = useMemo(
    () => getCurrentMembership(membershipsQuery.data ?? [], sessionEmail),
    [membershipsQuery.data, sessionEmail],
  );
  const resolvedSelectedId = workspaceTheses.some(
    (thesis) => thesis.id === selectedId,
  )
    ? selectedId
    : workspaceTheses[0]?.id || "";
  const selectedThesisQuery = useThesisDetailQuery(tenantId, resolvedSelectedId);

  return {
    thesesQuery,
    departmentsQuery,
    programsQuery,
    membershipsQuery,
    workspaceTheses,
    adviserOptions,
    currentMembership,
    resolvedSelectedId,
    selectedThesisQuery,
  };
}
