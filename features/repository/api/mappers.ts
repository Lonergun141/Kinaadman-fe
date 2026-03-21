"use client";

import type {
  CitationExportDto,
  PublicCollectionSummaryDto,
  PublicThesisDetailDto,
  PublicThesisListItemDto,
  DepartmentDto,
  ProgramDto,
  ThesisDetailDto,
  ThesisListItemDto,
} from "@/types/api";
import type {
  CitationExport,
  PublicCollectionSummary,
  PublicThesisDetail,
  PublicThesisListItem,
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

export function mapCitationExport(payload: CitationExportDto): CitationExport {
  return payload;
}
