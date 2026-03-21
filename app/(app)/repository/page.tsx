"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResultsPagination } from "@/components/repository/results-pagination";
import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SelectField } from "@/components/ui/select-field";
import { SidePanel } from "@/components/ui/side-panel";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TabPanels } from "@/components/ui/tab-panels";
import { TransitionLink } from "@/components/ui/transition-link";
import { ScholarResults } from "@/components/repository/scholar-results";
import { ThesisCards } from "@/components/repository/thesis-cards";
import { ThesisTable } from "@/components/repository/thesis-table";
import { listDepartments, listPrograms, listTheses } from "@/features/repository/api";
import {
  countLibrarianDeskItems,
  getLibrarianDeskFilterLabel,
  getPrimaryReadinessMessage,
  matchesLibrarianDeskFilter,
  sortLibrarianDeskItems,
  type LibrarianDeskFilter,
} from "@/lib/publication-readiness";
import { queryKeys } from "@/lib/query-keys";
import { roleLabels } from "@/lib/roles";
import { formatDate, getDisplayNameFromEmail, toTitleCase } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { ThesisListItem } from "@/types/domain";

const RESULTS_PER_PAGE = 10;
const STATUS_OPTIONS = [
  "ALL",
  "PUBLISHED",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "DRAFT",
  "CHANGES_REQUESTED",
  "ARCHIVED",
] as const;

const TENANT_ADMIN_ATTENTION_STATUSES = new Set([
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "CHANGES_REQUESTED",
]);
const TENANT_ADMIN_DRAFT_STATUSES = new Set(["DRAFT", "CHANGES_REQUESTED"]);
const TENANT_ADMIN_ARCHIVE_STATUSES = new Set(["PUBLISHED", "ARCHIVED"]);
const TENANT_ADMIN_WORKFLOW_LENSES = [
  "ALL",
  "ACTIVE",
  "READY",
  "DRAFTS",
  "PUBLISHED",
] as const;

type TenantAdminWorkflowLens =
  (typeof TENANT_ADMIN_WORKFLOW_LENSES)[number];

function sortByUpdatedAtDesc(items: ThesisListItem[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

function matchesTenantAdminWorkflowLens(
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

function getTenantAdminWorkflowLensLabel(lens: TenantAdminWorkflowLens) {
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

function getTenantAdminWorkflowSummary(thesis: ThesisListItem) {
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

function getTenantAdminWorkflowDetail(thesis: ThesisListItem) {
  const blockers = thesis.publication_readiness.blockers;

  if (!blockers.length) {
    return `Readiness score ${thesis.publication_readiness.readiness_score}%.`;
  }

  return `Blockers: ${blockers.slice(0, 2).join(", ")}.`;
}

interface TenantAdminRowListProps {
  items: ThesisListItem[];
}

function TenantAdminRowList({
  items,
}: TenantAdminRowListProps) {
  return (
    <div className="overflow-hidden rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white">
      <div className="hidden grid-cols-[minmax(0,2.1fr)_minmax(0,1.35fr)_140px_140px_170px_116px] gap-4 border-b border-[rgba(15,42,68,0.08)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)] xl:grid">
        <span>Record</span>
        <span>Workflow</span>
        <span>Status</span>
        <span>Readiness</span>
        <span>Archive info</span>
        <span className="text-right">Action</span>
      </div>

      <div>
        {items.map((thesis, index) => (
          <article
            key={thesis.id}
            className={`grid gap-4 px-5 py-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.35fr)_140px_140px_170px_116px] xl:px-6 ${
              index > 0 ? "border-t border-[rgba(15,42,68,0.08)]" : ""
            }`}
          >
            <div className="min-w-0 space-y-2">
              <TransitionLink
                href={`/theses/${thesis.id}`}
                className="block text-[1.08rem] font-semibold leading-snug text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
                pendingClassName="opacity-80"
              >
                {thesis.title}
              </TransitionLink>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {thesis.authors.map((author) => author.display_name).join(", ") ||
                  "Author not recorded"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-primary)]">
                {getTenantAdminWorkflowSummary(thesis)}
              </p>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {getTenantAdminWorkflowDetail(thesis)}
              </p>
            </div>

            <div className="flex items-start xl:items-center">
              <StatusBadge status={thesis.status} />
            </div>

            <div className="flex items-start xl:items-center">
              <ReadinessBadge
                status={
                  thesis.publication_readiness.can_publish_now ? "READY" : "PENDING"
                }
              >
                {thesis.publication_readiness.can_publish_now
                  ? "Ready"
                  : `${thesis.publication_readiness.blocker_count} blockers`}
              </ReadinessBadge>
            </div>

            <div className="space-y-1 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              <p>
                {thesis.program?.name ||
                  thesis.department?.name ||
                  "Program not assigned"}
              </p>
              <p>
                {toTitleCase(thesis.visibility)} | {thesis.year}
              </p>
              <p>Updated {formatDate(thesis.updated_at)}</p>
            </div>

            <div className="flex items-start xl:justify-end">
              <TransitionLink
                href={`/theses/${thesis.id}`}
                className="text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                pendingClassName="opacity-80"
              >
                Open
              </TransitionLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function RepositoryPage() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantContext = useTenantStore((state) => state.tenantContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [program, setProgram] = useState("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deskFilter, setDeskFilter] = useState<LibrarianDeskFilter>("ALL");
  const [tenantAdminWorkflowLens, setTenantAdminWorkflowLens] =
    useState<TenantAdminWorkflowLens>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim());

  const studentCatalogueQuery = useQuery({
    queryKey: queryKeys.repository.theses(activeTenantId, "", "ALL"),
    queryFn: () =>
      listTheses({
        tenantId: activeTenantId,
      }),
    enabled: Boolean(activeTenantId) && activeRole === "STUDENT",
  });

  const thesesQuery = useQuery({
    queryKey: queryKeys.repository.theses(activeTenantId, deferredSearch, status),
    queryFn: () =>
      listTheses({
        tenantId: activeTenantId,
        search: deferredSearch,
        status,
      }),
    enabled: Boolean(activeTenantId) && activeRole !== "STUDENT",
  });

  const repositoryQuery = activeRole === "STUDENT" ? studentCatalogueQuery : thesesQuery;

  const departmentsQuery = useQuery({
    queryKey: queryKeys.repository.departments(activeTenantId),
    queryFn: () => listDepartments(activeTenantId),
    enabled: Boolean(activeTenantId),
  });

  const programsQuery = useQuery({
    queryKey: queryKeys.repository.programs(activeTenantId),
    queryFn: () => listPrograms(activeTenantId),
    enabled: Boolean(activeTenantId),
  });

  const visibleTheses = useMemo(
    () => (activeRole === "STUDENT" ? studentCatalogueQuery.data ?? [] : thesesQuery.data ?? []),
    [activeRole, studentCatalogueQuery.data, thesesQuery.data],
  );
  const departments = useMemo(
    () =>
      (departmentsQuery.data ?? []).filter((option) =>
        visibleTheses.some((thesis) => thesis.department?.id === option.id),
      ),
    [departmentsQuery.data, visibleTheses],
  );
  const programs = useMemo(
    () =>
      (programsQuery.data ?? []).filter((option) => {
        if (department !== "ALL" && option.department_id !== department) {
          return false;
        }

        return visibleTheses.some((thesis) => thesis.program?.id === option.id);
      }),
    [department, programsQuery.data, visibleTheses],
  );

  const filteredTheses = useMemo(
    () =>
      visibleTheses.filter((thesis) => {
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
          !deferredSearch ||
          searchableText.includes(deferredSearch.toLowerCase());
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
      }),
    [activeRole, deferredSearch, department, program, status, visibleTheses],
  );

  const publishedCount = visibleTheses.filter(
    (thesis) => thesis.status === "PUBLISHED",
  ).length;
  const reviewCount = visibleTheses.filter((thesis) =>
    ["SUBMITTED", "IN_REVIEW", "APPROVED"].includes(thesis.status),
  ).length;
  const tenantDisplayName =
    tenantContext?.branding?.display_name || tenantContext?.name || "Tenant archive";
  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : "Campus member";
  const selectedDepartmentName =
    departments.find((option) => option.id === department)?.name || null;
  const selectedProgramName =
    programs.find((option) => option.id === program)?.name || null;
  const extraFilterCount = [
    status !== "ALL",
    department !== "ALL",
    program !== "ALL",
  ].filter(Boolean).length;
  const activeFilterLabels = useMemo(() => {
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
  }, [selectedDepartmentName, selectedProgramName, status]);
  const hasAnyFilters =
    Boolean(search.trim()) ||
    status !== "ALL" ||
    department !== "ALL" ||
    program !== "ALL";
  const totalPages = Math.max(1, Math.ceil(filteredTheses.length / RESULTS_PER_PAGE));
  const resolvedPage = Math.min(currentPage, totalPages);
  const paginatedTheses = useMemo(() => {
    const startIndex = (resolvedPage - 1) * RESULTS_PER_PAGE;

    return filteredTheses.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [filteredTheses, resolvedPage]);
  const pageStart = filteredTheses.length
    ? (resolvedPage - 1) * RESULTS_PER_PAGE + 1
    : 0;
  const pageEnd = filteredTheses.length
    ? Math.min(resolvedPage * RESULTS_PER_PAGE, filteredTheses.length)
    : 0;
  const librarianDeskItems = useMemo(
    () =>
      sortLibrarianDeskItems(filteredTheses).filter((thesis) =>
        matchesLibrarianDeskFilter(thesis, deskFilter),
      ),
    [deskFilter, filteredTheses],
  );
  const tenantAdminRows = useMemo(
    () =>
      sortByUpdatedAtDesc(filteredTheses).filter((thesis) =>
        matchesTenantAdminWorkflowLens(thesis, tenantAdminWorkflowLens),
      ),
    [filteredTheses, tenantAdminWorkflowLens],
  );
  const tenantAdminOpenWorkflowCount = useMemo(
    () =>
      visibleTheses.filter((thesis) =>
        TENANT_ADMIN_ATTENTION_STATUSES.has(thesis.status),
      ).length,
    [visibleTheses],
  );
  const tenantAdminReadyCount = useMemo(
    () =>
      visibleTheses.filter((thesis) => thesis.publication_readiness.can_publish_now)
        .length,
    [visibleTheses],
  );
  const librarianFilterItems: LibrarianDeskFilter[] = [
    "ALL",
    "READY",
    "NEEDS_ADVISER",
    "NEEDS_PANEL",
    "NEEDS_METADATA",
    "PUBLISHED",
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeRole,
    activeTenantId,
    deferredSearch,
    status,
    department,
    program,
    deskFilter,
    tenantAdminWorkflowLens,
  ]);

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setDepartment("ALL");
    setProgram("ALL");
  }

  function renderFilterControls() {
    return (
      <div className="space-y-4">
        <label className="flex flex-col gap-2.5">
          <span className="text-primary-label">Search records</span>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, abstract, or topic"
              className="input-base pl-9"
            />
          </div>
        </label>

        <SelectField
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
          <option value="CHANGES_REQUESTED">Changes requested</option>
          <option value="ARCHIVED">Archived</option>
        </SelectField>

        <SelectField
          label="Department"
          value={department}
          onChange={(event) => {
            const nextDepartment = event.target.value;
            setDepartment(nextDepartment);

            if (
              nextDepartment !== "ALL" &&
              !programs.some((option) => option.id === program)
            ) {
              setProgram("ALL");
            }
          }}
        >
          <option value="ALL">All departments</option>
          {departments.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Program"
          value={program}
          onChange={(event) => setProgram(event.target.value)}
        >
          <option value="ALL">All programs</option>
          {programs.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => setFiltersOpen(false)}>
            Apply filters
          </Button>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      </div>
    );
  }

  function renderRailButton(
    itemKey: string,
    label: string,
    active: boolean,
    onClick: () => void,
  ) {
    return (
      <button
        key={itemKey}
        type="button"
        onClick={onClick}
        className={
          active
            ? "block w-full rounded-[0.45rem] px-0 py-1.5 text-left text-sm font-semibold text-[color:var(--color-secondary)]"
            : "block w-full rounded-[0.45rem] px-0 py-1.5 text-left text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-primary)]"
        }
      >
        {label}
      </button>
    );
  }

  if (activeRole === "STUDENT") {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-[1180px] space-y-5">
          <section className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.94)] shadow-[0_18px_32px_rgba(0,21,42,0.04)]">
            <div className="flex items-center gap-3 border-b border-[rgba(15,42,68,0.08)] px-4 py-3 sm:px-5">
              <span className="font-serif text-[1.8rem] italic text-[color:var(--color-primary-container)]">
                {tenantDisplayName}
              </span>
              <span className="text-sm text-[color:var(--color-muted-foreground)]">
                Repository
              </span>
            </div>
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center">
              <label className="relative flex-1" htmlFor="repository-search">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  id="repository-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search theses, capstones, or topics"
                  className="h-11 w-full rounded-[0.65rem] border border-[rgba(15,42,68,0.12)] bg-white pl-10 pr-4 text-[15px] text-[color:var(--color-foreground)] outline-none transition-shadow placeholder:text-[color:var(--color-muted)] focus:border-[rgba(201,162,39,0.5)] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
                />
              </label>
              <div className="flex items-center gap-2 xl:hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-w-[132px]"
                  onClick={() => setFiltersOpen(true)}
                >
                  {extraFilterCount > 0 ? `Filters (${extraFilterCount})` : "Filters"}
                </Button>
                {hasAnyFilters ? (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="border-t border-[rgba(15,42,68,0.08)] px-4 py-2.5 text-xs text-[color:var(--color-muted-foreground)] sm:px-5">
              {repositoryQuery.isPending
                ? "Loading archive records"
                : repositoryQuery.error
                  ? "Archive unavailable"
                  : deferredSearch
                    ? `About ${filteredTheses.length} result${filteredTheses.length === 1 ? "" : "s"} for "${deferredSearch}"`
                    : `About ${visibleTheses.length} result${visibleTheses.length === 1 ? "" : "s"} in ${tenantDisplayName}`}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-5 border-r border-[rgba(15,42,68,0.08)] pr-5">
                <div className="space-y-3">
                  <p className="muted-label">Status</p>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.map((option) =>
                      renderRailButton(
                        option,
                        option === "ALL" ? "Any status" : toTitleCase(option),
                        status === option,
                        () => setStatus(option),
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="muted-label">Department</p>
                  <div className="space-y-2">
                    {renderRailButton("any-department", "Any department", department === "ALL", () => {
                        setDepartment("ALL");
                        setProgram("ALL");
                      })}
                    {departments.slice(0, 8).map((option) =>
                      renderRailButton(
                        option.id,
                        option.name,
                        department === option.id,
                        () => {
                          setDepartment(option.id);
                          setProgram("ALL");
                        },
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <SelectField
                    label="Program"
                    value={program}
                    onChange={(event) => setProgram(event.target.value)}
                  >
                    <option value="ALL">Any program</option>
                    {programs.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {hasAnyFilters ? (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </aside>

            <section className="space-y-4">
              {(deferredSearch || activeFilterLabels.length > 0) && !repositoryQuery.isPending && !repositoryQuery.error ? (
                <div className="flex flex-wrap gap-2">
                  {deferredSearch ? (
                    <span className="pill-outline">Search: {deferredSearch}</span>
                  ) : null}
                  {activeFilterLabels.map((label) => (
                    <span key={label} className="pill-outline">
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}

              {repositoryQuery.error ? (
                <EmptyState
                  title="Repository unavailable"
                  description={repositoryQuery.error.message}
                />
              ) : repositoryQuery.isPending ? (
                <EmptyState
                  title="Loading archive"
                  description="Gathering archive records and preparing the result list."
                />
              ) : visibleTheses.length === 0 ? (
                <EmptyState
                  title="No repository records yet"
                  description="This tenant does not have any thesis or capstone records available yet."
                />
              ) : filteredTheses.length > 0 ? (
                <div className="space-y-4">
                  <ScholarResults
                    items={paginatedTheses}
                    tenantDisplayName={tenantDisplayName}
                  />
                  <ResultsPagination
                    currentPage={resolvedPage}
                    totalPages={totalPages}
                    totalResults={filteredTheses.length}
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : (
                <EmptyState
                  title="No matching records"
                  description="Try a broader keyword or clear one of the filters to reopen the archive list."
                  action={
                    hasAnyFilters ? (
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </section>
          </div>

          <Drawer
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            eyebrow="Search filters"
            title="Refine results"
            description="Narrow the list without leaving the search page."
          >
            {renderFilterControls()}
          </Drawer>
        </div>
      </div>
    );
  }

  if (activeRole === "TENANT_ADMIN") {
    const tenantAdminWorkflowCounts = TENANT_ADMIN_WORKFLOW_LENSES.map((lens) => ({
      lens,
      count: filteredTheses.filter((thesis) =>
        matchesTenantAdminWorkflowLens(thesis, lens),
      ).length,
    }));
    const tenantAdminTotalPages = Math.max(
      1,
      Math.ceil(tenantAdminRows.length / RESULTS_PER_PAGE),
    );
    const tenantAdminResolvedPage = Math.min(currentPage, tenantAdminTotalPages);
    const tenantAdminPaginatedRows = tenantAdminRows.slice(
      (tenantAdminResolvedPage - 1) * RESULTS_PER_PAGE,
      tenantAdminResolvedPage * RESULTS_PER_PAGE,
    );
    const tenantAdminPageStart = tenantAdminRows.length
      ? (tenantAdminResolvedPage - 1) * RESULTS_PER_PAGE + 1
      : 0;
    const tenantAdminPageEnd = tenantAdminRows.length
      ? Math.min(tenantAdminResolvedPage * RESULTS_PER_PAGE, tenantAdminRows.length)
      : 0;

    return (
      <div className="page-shell space-y-6">
        <PageHeader
          eyebrow="Repository administration"
          description="Manage the tenant archive through one scalable list that keeps workflow state, readiness, and core thesis information visible."
        >
          <span className="pill-outline">
            {sessionUser ? getDisplayNameFromEmail(sessionUser.email) : roleLabels[activeRole]}
          </span>
        </PageHeader>

        <section className="paper-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="muted-label">Tenant archive</p>
              <h2 className="text-[clamp(1.9rem,3vw,2.8rem)] leading-[0.98] tracking-[-0.04em] text-balance">
                Simple repository list
              </h2>
              <p className="text-muted max-w-3xl">
                Search, filter, and review every thesis from one page. Workflow
                state, status, readiness, and core archive details stay visible
                in a row-based list that scales better as records grow.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_180px_220px_220px]">
              <label className="flex flex-col gap-2.5" htmlFor="tenant-admin-repository-search">
                <span className="text-primary-label">Search records</span>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <input
                    id="tenant-admin-repository-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, topic, department, or program"
                    className="input-base pl-9"
                  />
                </div>
              </label>

              <SelectField
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_REVIEW">In review</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
                <option value="CHANGES_REQUESTED">Changes requested</option>
                <option value="ARCHIVED">Archived</option>
              </SelectField>

              <SelectField
                label="Department"
                value={department}
                onChange={(event) => {
                  const nextDepartment = event.target.value;
                  setDepartment(nextDepartment);

                  if (
                    nextDepartment !== "ALL" &&
                    !programs.some((option) => option.id === program)
                  ) {
                    setProgram("ALL");
                  }
                }}
              >
                <option value="ALL">All departments</option>
                {departments.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Program"
                value={program}
                onChange={(event) => setProgram(event.target.value)}
              >
                <option value="ALL">All programs</option>
                {programs.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[rgba(15,42,68,0.08)] pt-5">
              {tenantAdminWorkflowCounts.map(({ lens, count }) => (
                <button
                  key={lens}
                  type="button"
                  onClick={() => setTenantAdminWorkflowLens(lens)}
                  className={
                    tenantAdminWorkflowLens === lens
                      ? "rounded-full bg-[rgba(201,162,39,0.18)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]"
                      : "rounded-full bg-[rgba(15,42,68,0.05)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                  }
                >
                  {getTenantAdminWorkflowLensLabel(lens)} ({count})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[rgba(15,42,68,0.08)] pt-4 text-sm text-[color:var(--color-muted-foreground)]">
              <span className="font-semibold text-[color:var(--color-primary)]">
                {tenantAdminRows.length} shown
              </span>
              <span>{tenantAdminOpenWorkflowCount} in workflow</span>
              <span>{tenantAdminReadyCount} ready to publish</span>
              <span>{publishedCount} published</span>
              <span>{departments.length} departments</span>
              {hasAnyFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear metadata filters
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        {repositoryQuery.error ? (
          <EmptyState
            title="Repository unavailable"
            description={repositoryQuery.error.message}
          />
        ) : repositoryQuery.isPending ? (
          <EmptyState
            title="Loading tenant archive"
            description="Preparing the repository list and workflow information."
          />
        ) : visibleTheses.length === 0 ? (
          <EmptyState
            title="No repository records yet"
            description="This tenant does not have any thesis or capstone records available yet."
          />
        ) : tenantAdminRows.length ? (
          <section className="paper-panel overflow-hidden p-0">
            <div className="space-y-2 border-b border-[rgba(15,42,68,0.08)] px-6 py-5 sm:px-7">
              <p className="muted-label">Managed archive list</p>
              <h2 className="text-[1.45rem] leading-tight font-medium tracking-[-0.025em] text-balance">
                Tenant repository records
              </h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Every row keeps the thesis title, workflow state, status,
                readiness, archive context, and direct access to the detail
                view in one place.
              </p>
            </div>

            <TenantAdminRowList items={tenantAdminPaginatedRows} />

            <div className="border-t border-[rgba(15,42,68,0.08)] px-6 py-5 sm:px-7">
              <ResultsPagination
                currentPage={tenantAdminResolvedPage}
                totalPages={tenantAdminTotalPages}
                totalResults={tenantAdminRows.length}
                pageStart={tenantAdminPageStart}
                pageEnd={tenantAdminPageEnd}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        ) : (
          <EmptyState
            title="No matching records"
            description="Try another workflow lens or clear the metadata filters to reopen the archive list."
            action={
              hasAnyFilters || tenantAdminWorkflowLens !== "ALL" ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearFilters();
                    setTenantAdminWorkflowLens("ALL");
                  }}
                >
                  Reset archive lens
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    );
  }

  if (activeRole === "LIBRARIAN") {
    return (
      <div className="page-shell space-y-6">
        <PageHeader
          eyebrow="Library control desk"
          description="Search the archive like a librarian: see what is ready to publish, what is blocked, and what still needs documentary clearance."
        >
          <span className="pill-outline">
            {sessionUser ? getDisplayNameFromEmail(sessionUser.email) : roleLabels[activeRole]}
          </span>
        </PageHeader>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ready to publish"
            value={String(countLibrarianDeskItems(visibleTheses, "READY"))}
            detail="Approved records with a complete publishing checklist."
          />
          <StatCard
            label="Needs adviser"
            value={String(countLibrarianDeskItems(visibleTheses, "NEEDS_ADVISER"))}
            detail="Records still missing an adviser recommendation."
            tone="secondary"
          />
          <StatCard
            label="Needs panel"
            value={String(countLibrarianDeskItems(visibleTheses, "NEEDS_PANEL"))}
            detail="Records waiting on panel lineup or panel approval."
          />
          <StatCard
            label="Needs metadata"
            value={String(countLibrarianDeskItems(visibleTheses, "NEEDS_METADATA"))}
            detail="Records missing file, defense, or rights information."
            tone="neutral"
          />
        </section>

        <section className="rounded-[1rem] border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5 shadow-[0_18px_32px_rgba(0,21,42,0.04)] sm:px-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <label className="flex flex-col gap-2.5" htmlFor="librarian-desk-search">
              <span className="text-primary-label">Search records</span>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  id="librarian-desk-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, author, program, or department"
                  className="input-base pl-9"
                />
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {librarianFilterItems.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDeskFilter(filter)}
                  className={
                    deskFilter === filter
                      ? "rounded-full bg-[rgba(201,162,39,0.18)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]"
                      : "rounded-full bg-[rgba(15,42,68,0.05)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                  }
                >
                  {getLibrarianDeskFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {repositoryQuery.error ? (
          <EmptyState
            title="Repository unavailable"
            description={repositoryQuery.error.message}
          />
        ) : repositoryQuery.isPending ? (
          <EmptyState
            title="Loading library desk"
            description="Gathering records and checking their publishing readiness."
          />
        ) : librarianDeskItems.length ? (
          <section className="grid gap-4">
            {librarianDeskItems.map((thesis) => (
              <article
                key={thesis.id}
                className="rounded-[1rem] border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5 shadow-[0_18px_32px_rgba(0,21,42,0.04)] sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="muted-label">Library record</p>
                      <a
                        href={`/theses/${thesis.id}`}
                        className="block text-[1.35rem] font-semibold leading-tight text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
                      >
                        {thesis.title}
                      </a>
                      <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                        {thesis.authors.map((author) => author.display_name).join(", ") ||
                          "Author not recorded"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="pill-outline">
                        {thesis.program?.name || thesis.department?.name || "Program not assigned"}
                      </span>
                      <span className="pill-outline">{thesis.year}</span>
                      <span className="pill-outline">{thesis.thesis_type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <StatusBadge status={thesis.status} />
                    <ReadinessBadge
                      status={thesis.publication_readiness.can_publish_now ? "READY" : "PENDING"}
                    >
                      {thesis.publication_readiness.can_publish_now
                        ? "Ready to publish"
                        : `${thesis.publication_readiness.blocker_count} blockers`}
                    </ReadinessBadge>
                  </div>
                </div>

                <div className="mt-5 rounded-[0.9rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(247,249,251,0.86)] px-4 py-4">
                  <p className="text-primary-label">Publishing signal</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                    {getPrimaryReadinessMessage(thesis.publication_readiness)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {thesis.publication_readiness.blockers.slice(0, 3).map((blocker) => (
                      <span key={blocker} className="pill-outline">
                        {blocker}
                      </span>
                    ))}
                    {!thesis.publication_readiness.blockers.length ? (
                      <span className="pill-outline">Publishing checklist complete</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                    {thesis.publication_readiness.readiness_score}% ready
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`/theses/${thesis.id}`}
                      className="text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      Open record
                    </a>
                    <a
                      href="/review"
                      className="text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                    >
                      Open review desk
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No matching librarian records"
            description="Try a broader search or switch to another librarian filter."
            action={
              search || deskFilter !== "ALL" ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setDeskFilter("ALL");
                  }}
                >
                  Clear desk filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Repository"
        description="Search, filter, and review the live tenant archive through a document-first catalogue that keeps metadata readable and actions obvious."
      >
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible records"
          value={String(visibleTheses.length)}
          detail="Records currently visible in this archive view."
        />
        <StatCard
          label="Published"
          value={String(publishedCount)}
          detail="Finalized theses ready for long-term discovery."
          tone="secondary"
        />
        <StatCard
          label="Under review"
          value={String(reviewCount)}
          detail="Records still moving through institutional workflow."
        />
        <StatCard
          label="Departments"
          value={String(departments.length)}
          detail="Academic units represented in the visible catalogue."
          tone="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="muted-label">Curated research</p>
              <h2 className="text-[clamp(2rem,3vw,3.2rem)] leading-[0.96] tracking-[-0.04em] text-balance">
                Archive catalogue
              </h2>
              <p className="text-muted max-w-2xl">
                Important metadata stays visible first, so users can scan title,
                discipline, status, and recency before opening a full record.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
              Refine archive
            </Button>
          </div>

          <TabPanels
            tabs={[
              {
                id: "catalogue",
                label: "Catalogue",
                description:
                  "The main catalogue stays in focus here while filters and collection notes move off the primary canvas.",
                content: thesesQuery.error ? (
                  <EmptyState
                    title="Repository unavailable"
                    description={thesesQuery.error.message}
                  />
                ) : thesesQuery.isPending ? (
                  <EmptyState
                    title="Loading archive"
                    description="Preparing the latest archive records for reading."
                  />
                ) : filteredTheses.length > 0 ? (
                  <div className="space-y-4">
                    <ThesisTable items={paginatedTheses} />
                    <ThesisCards items={paginatedTheses} />
                    <ResultsPagination
                      currentPage={resolvedPage}
                      totalPages={totalPages}
                      totalResults={filteredTheses.length}
                      pageStart={pageStart}
                      pageEnd={pageEnd}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No matching records"
                    description="Try a broader keyword or clear one of the metadata filters to reopen the archive."
                  />
                ),
              },
              {
                id: "notes",
                label: "Collection notes",
                description:
                  "Supporting guidance is available without forcing more cards into the catalogue view.",
                content: (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <SurfaceCard eyebrow="Search logic" title="How results are resolved">
                      <p className="text-muted">
                        Search looks across titles and abstracts first, while
                        department, program, and status filters help you narrow the
                        archive to the records that matter most.
                      </p>
                    </SurfaceCard>
                    <SurfaceCard eyebrow="Coverage" title="Current archive spread">
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-primary-label">Visible result window</dt>
                          <dd className="mt-2 font-serif text-[1.7rem] leading-none text-[color:var(--color-primary)]">
                            {filteredTheses.length} / {visibleTheses.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-primary-label">Programs surfaced</dt>
                          <dd className="text-muted mt-1">
                            {programs.length} program options remain visible inside the
                            current lens.
                          </dd>
                        </div>
                      </dl>
                    </SurfaceCard>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <SidePanel
          eyebrow="Reading lens"
          title="Current refinement"
          description="Keep the catalogue focused and open supporting controls only when you need them."
        >
          <div className="space-y-4">
            <div className="inline-note">
              <p className="text-primary-label">Visible result window</p>
              <p className="mt-2 font-serif text-[1.7rem] leading-none text-[color:var(--color-primary)]">
                {filteredTheses.length} / {visibleTheses.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Records currently visible after your filters are applied.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-primary-label">Active filters</p>
              <div className="flex flex-wrap gap-2">
                {search ? <span className="pill-outline">Search: {search}</span> : null}
                {status !== "ALL" ? <span className="pill-outline">{status}</span> : null}
                {department !== "ALL" ? (
                  <span className="pill-outline">
                    {selectedDepartmentName || "Department"}
                  </span>
                ) : null}
                {program !== "ALL" ? (
                  <span className="pill-outline">
                    {selectedProgramName || "Program"}
                  </span>
                ) : null}
                {!search && status === "ALL" && department === "ALL" && program === "ALL" ? (
                  <span className="pill-outline">No extra filters applied</span>
                ) : null}
              </div>
            </div>

            <Button fullWidth variant="secondary" onClick={() => setFiltersOpen(true)}>
              Open filter drawer
            </Button>
          </div>
        </SidePanel>
      </section>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        eyebrow="Reading lens"
        title="Refine the archive"
        description="Use search and metadata controls without crowding the catalogue surface."
      >
        {renderFilterControls()}
      </Drawer>
    </div>
  );
}
