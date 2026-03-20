"use client";

import type {
  DepartmentDto,
  ProgramDto,
  ThesisDetailDto,
  ThesisListItemDto,
} from "@/types/api";
import type {
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
