"use client";

import { requestJson } from "@/lib/api/client";
import type { RepositoryAnalyticsOverviewDto } from "@/types/api";
import { mapRepositoryAnalyticsOverview } from "./mappers";

export async function getRepositoryAnalyticsOverview(payload: {
  tenantId: string;
  months?: number;
  departmentId?: string;
}) {
  const response = await requestJson<RepositoryAnalyticsOverviewDto>(
    "/analytics/repository/overview",
    {
      tenantId: payload.tenantId,
      query: {
        months: payload.months,
        department_id:
          !payload.departmentId || payload.departmentId === "ALL"
            ? undefined
            : payload.departmentId,
      },
    },
  );

  return mapRepositoryAnalyticsOverview(response);
}
