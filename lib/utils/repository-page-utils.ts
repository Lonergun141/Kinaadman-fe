import {
  getPrimaryReadinessMessage,
  type LibrarianDeskFilter,
} from "@/lib/publication-readiness";
import type { AppRole } from "@/stores/workspace-store";
import { toTitleCase } from "@/lib/utils";
import type {
  DepartmentOption,
  ProgramOption,
  ThesisListItem,
} from "@/types/domain";

export const RESULTS_PER_PAGE = 10;
export const STATUS_RAIL_OPTIONS = [
  "ALL",
  "PUBLISHED",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "DRAFT",
  "CHANGES_REQUESTED",
  "ARCHIVED",
] as const;
export const STATUS_SELECT_OPTIONS = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "CHANGES_REQUESTED",
  "ARCHIVED",
] as const;
export const LIBRARIAN_FILTER_ITEMS: LibrarianDeskFilter[] = [
  "ALL",
  "READY",
  "NEEDS_ADVISER",
  "NEEDS_PANEL",
  "NEEDS_METADATA",
  "PUBLISHED",
];

const TENANT_ADMIN_ATTENTION_STATUSES = new Set([
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "CHANGES_REQUESTED",
]);
const TENANT_ADMIN_DRAFT_STATUSES = new Set(["DRAFT", "CHANGES_REQUESTED"]);
const TENANT_ADMIN_ARCHIVE_STATUSES = new Set(["PUBLISHED", "ARCHIVED"]);

export const TENANT_ADMIN_WORKFLOW_LENSES = [
  "ALL",
  "ACTIVE",
  "READY",
  "DRAFTS",
  "PUBLISHED",
] as const;

export type TenantAdminWorkflowLens =
  (typeof TENANT_ADMIN_WORKFLOW_LENSES)[number];

interface RepositoryFilterState {
  search: string;
  status: string;
  department: string;
  program: string;
}

interface FilterRepositoryThesesOptions extends RepositoryFilterState {
  activeRole: AppRole;
}

export function getVisibleDepartments(
  departments: DepartmentOption[],
  visibleTheses: ThesisListItem[],
) {
  return departments.filter((option) =>
    visibleTheses.some((thesis) => thesis.department?.id === option.id),
  );
}

export function getVisiblePrograms(
  programs: ProgramOption[],
  visibleTheses: ThesisListItem[],
  department: string,
) {
  return programs.filter((option) => {
    if (department !== "ALL" && option.department_id !== department) {
      return false;
    }

    return visibleTheses.some((thesis) => thesis.program?.id === option.id);
  });
}

export function filterRepositoryTheses(
  items: ThesisListItem[],
  { activeRole, search, status, department, program }: FilterRepositoryThesesOptions,
) {
  const normalizedSearch = search.toLowerCase();

  return items.filter((thesis) => {
    const searchableText = [
      thesis.title,
      thesis.department?.name,
      thesis.program?.name,
      String(thesis.year),
      toTitleCase(thesis.status),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      activeRole !== "STUDENT" ||
      !normalizedSearch ||
      searchableText.includes(normalizedSearch);
    const matchesStatus =
      activeRole !== "STUDENT" ||
      status === "ALL" ||
      thesis.status === status;
    const matchesDepartment =
      department === "ALL" || thesis.department?.id === department;
    const matchesProgram = program === "ALL" || thesis.program?.id === program;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment &&
      matchesProgram
    );
  });
}

export function hasRepositoryFilters({
  search,
  status,
  department,
  program,
}: RepositoryFilterState) {
  return (
    Boolean(search.trim()) ||
    status !== "ALL" ||
    department !== "ALL" ||
    program !== "ALL"
  );
}

export function getActiveRepositoryFilterLabels(
  status: string,
  selectedDepartmentName: string | null,
  selectedProgramName: string | null,
) {
  const labels: string[] = [];

  if (status !== "ALL") {
    labels.push(`Status: ${toTitleCase(status)}`);
  }

  if (selectedDepartmentName) {
    labels.push(selectedDepartmentName);
  }

  if (selectedProgramName) {
    labels.push(selectedProgramName);
  }

  return labels;
}

export function sortByUpdatedAtDesc(items: ThesisListItem[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

export function matchesTenantAdminWorkflowLens(
  thesis: ThesisListItem,
  lens: TenantAdminWorkflowLens,
) {
  switch (lens) {
    case "ACTIVE":
      return TENANT_ADMIN_ATTENTION_STATUSES.has(thesis.status);
    case "READY":
      return thesis.publication_readiness.can_publish_now;
    case "DRAFTS":
      return TENANT_ADMIN_DRAFT_STATUSES.has(thesis.status);
    case "PUBLISHED":
      return TENANT_ADMIN_ARCHIVE_STATUSES.has(thesis.status);
    default:
      return true;
  }
}

export function getTenantAdminWorkflowLensLabel(
  lens: TenantAdminWorkflowLens,
) {
  switch (lens) {
    case "ACTIVE":
      return "Needs attention";
    case "READY":
      return "Ready to publish";
    case "DRAFTS":
      return "Drafts";
    case "PUBLISHED":
      return "Published and archived";
    default:
      return "All records";
  }
}

export function getTenantAdminWorkflowSummary(thesis: ThesisListItem) {
  if (thesis.publication_readiness.can_publish_now) {
    return "Ready for publishing.";
  }

  switch (thesis.status) {
    case "DRAFT":
      return "Draft still being prepared.";
    case "SUBMITTED":
      return "Submitted and waiting for review to start.";
    case "IN_REVIEW":
      return "Currently moving through review.";
    case "CHANGES_REQUESTED":
      return "Returned for revisions.";
    case "APPROVED":
      return "Approved, but still missing publication requirements.";
    case "PUBLISHED":
      return "Published in the tenant repository.";
    case "ARCHIVED":
      return "Archived record retained for reference.";
    default:
      return getPrimaryReadinessMessage(thesis.publication_readiness);
  }
}

export function getTenantAdminWorkflowDetail(thesis: ThesisListItem) {
  const blockers = thesis.publication_readiness.blockers;

  if (!blockers.length) {
    return `Readiness score ${thesis.publication_readiness.readiness_score}%.`;
  }

  return `Blockers: ${blockers.slice(0, 2).join(", ")}.`;
}

export function countTenantAdminOpenWorkflowItems(items: ThesisListItem[]) {
  return items.filter((thesis) =>
    TENANT_ADMIN_ATTENTION_STATUSES.has(thesis.status),
  ).length;
}

export function countTenantAdminReadyItems(items: ThesisListItem[]) {
  return items.filter((thesis) => thesis.publication_readiness.can_publish_now)
    .length;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  resultsPerPage = RESULTS_PER_PAGE,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / resultsPerPage));
  const resolvedPage = Math.min(currentPage, totalPages);
  const startIndex = (resolvedPage - 1) * resultsPerPage;

  return {
    paginatedItems: items.slice(startIndex, startIndex + resultsPerPage),
    totalPages,
    resolvedPage,
    pageStart: items.length ? startIndex + 1 : 0,
    pageEnd: items.length ? Math.min(resolvedPage * resultsPerPage, items.length) : 0,
  };
}
