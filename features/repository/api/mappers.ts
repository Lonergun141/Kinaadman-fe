"use client";

import type {
  AnalyticsCountBucketDto,
  AnalyticsValueBucketDto,
  CitationExportDto,
  PublicCollectionSummaryDto,
  PublicThesisDetailDto,
  PublicThesisListItemDto,
  RepositoryAnalyticsMonthDto,
  RepositoryAnalyticsOverviewDto,
  RepositoryAnalyticsSummaryDto,
  DepartmentDto,
  ProgramDto,
  ThesisDetailDto,
  ThesisListItemDto,
} from "@/types/api";
import type {
  AnalyticsCountBucket,
  AnalyticsValueBucket,
  CitationExport,
  PublicCollectionSummary,
  PublicThesisDetail,
  PublicThesisListItem,
  RepositoryAnalyticsMonth,
  RepositoryAnalyticsOverview,
  RepositoryAnalyticsSummary,
  DepartmentOption,
  ProgramOption,
  ThesisDetail,
  ThesisListItem,
} from "@/types/domain";

export function mapDepartment(payload: DepartmentDto): DepartmentOption {
  return payload;
}

export function mapProgram(payload: ProgramDto): ProgramOption {
  return payload;
}

export function mapThesisListItem(payload: ThesisListItemDto): ThesisListItem {
  return payload;
}

export function mapThesisDetail(payload: ThesisDetailDto): ThesisDetail {
  return payload;
}

export function mapPublicThesisListItem(
  payload: PublicThesisListItemDto,
): PublicThesisListItem {
  return payload;
}

export function mapPublicThesisDetail(
  payload: PublicThesisDetailDto,
): PublicThesisDetail {
  return payload;
}

export function mapPublicCollectionSummary(
  payload: PublicCollectionSummaryDto,
): PublicCollectionSummary {
  return payload;
}

export function mapAnalyticsCountBucket(
  payload: AnalyticsCountBucketDto,
): AnalyticsCountBucket {
  return payload;
}

export function mapAnalyticsValueBucket(
  payload: AnalyticsValueBucketDto,
): AnalyticsValueBucket {
  return payload;
}

export function mapRepositoryAnalyticsMonth(
  payload: RepositoryAnalyticsMonthDto,
): RepositoryAnalyticsMonth {
  return payload;
}

export function mapRepositoryAnalyticsSummary(
  payload: RepositoryAnalyticsSummaryDto,
): RepositoryAnalyticsSummary {
  return payload;
}

export function mapRepositoryAnalyticsOverview(
  payload: RepositoryAnalyticsOverviewDto,
): RepositoryAnalyticsOverview {
  return {
    as_of: payload.as_of,
    window_months: payload.window_months,
    summary: mapRepositoryAnalyticsSummary(payload.summary),
    monthly_activity: payload.monthly_activity.map(mapRepositoryAnalyticsMonth),
    status_data: payload.status_data.map(mapAnalyticsCountBucket),
    department_data: payload.department_data.map(mapAnalyticsCountBucket),
    active_department_data: payload.active_department_data.map(
      mapAnalyticsCountBucket,
    ),
    visibility_data: payload.visibility_data.map(mapAnalyticsValueBucket),
    blocker_data: payload.blocker_data.map(mapAnalyticsCountBucket),
    pipeline_data: payload.pipeline_data.map(mapAnalyticsCountBucket),
    readiness_split: payload.readiness_split.map(mapAnalyticsValueBucket),
  };
}

export function mapCitationExport(payload: CitationExportDto): CitationExport {
  return payload;
}
