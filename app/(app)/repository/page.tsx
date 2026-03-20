"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResultsPagination } from "@/components/repository/results-pagination";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SelectField } from "@/components/ui/select-field";
import { SidePanel } from "@/components/ui/side-panel";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TabPanels } from "@/components/ui/tab-panels";
import { ScholarResults } from "@/components/repository/scholar-results";
import { ThesisCards } from "@/components/repository/thesis-cards";
import { ThesisTable } from "@/components/repository/thesis-table";
import { listDepartments, listPrograms, listTheses } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail, toTitleCase } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const RESULTS_PER_PAGE = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRole, activeTenantId, deferredSearch, status, department, program]);

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

  if (activeRole === "STUDENT") {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-[1080px] space-y-10">
          <section className="space-y-5">
            <div className="max-w-3xl space-y-3">
              <p className="muted-label">Repository</p>
              <h1 className="text-[clamp(2.5rem,4vw,4.2rem)] leading-[0.94] tracking-[-0.04em] text-balance">
                Search the archive
              </h1>
              <p className="text-muted max-w-2xl">
                Find theses quickly through a search-first catalogue built for
                scanning titles, metadata, and publication status without extra
                dashboard noise.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label
                  className="relative flex-1 rounded-full bg-[rgba(255,255,255,0.84)] px-5 shadow-[0_18px_32px_rgba(0,21,42,0.08),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-[20px] transition-all duration-200 focus-within:shadow-[0_0_0_4px_rgba(201,162,39,0.12),0_24px_38px_rgba(0,21,42,0.08)]"
                  htmlFor="repository-search"
                >
                  <svg
                    className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--color-muted)]"
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
                    placeholder="Search by title, topic, department, or program"
                    className="w-full bg-transparent py-4 pl-8 pr-3 text-base text-[color:var(--color-foreground)] outline-none placeholder:text-[color:var(--color-muted)] sm:text-lg"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="min-w-[152px]"
                    onClick={() => setFiltersOpen(true)}
                  >
                    {extraFilterCount > 0
                      ? `Filters (${extraFilterCount})`
                      : "Filters"}
                  </Button>
                  {hasAnyFilters ? (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear search
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-primary-label">
                    {repositoryQuery.isPending
                      ? "Loading the archive"
                      : repositoryQuery.error
                        ? "Archive unavailable"
                        : deferredSearch
                          ? `${filteredTheses.length} matching result${
                              filteredTheses.length === 1 ? "" : "s"
                            } in ${tenantDisplayName}`
                          : `${visibleTheses.length} record${
                              visibleTheses.length === 1 ? "" : "s"
                            } in ${tenantDisplayName}`}
                  </p>
                  <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    {deferredSearch
                      ? "Results narrow in place as you search, while department, program, and status filters stay tucked away until needed."
                      : "The full tenant repository is shown by default. Start typing to narrow the list."}
                  </p>
                  {!repositoryQuery.isPending && !repositoryQuery.error && filteredTheses.length > 0 ? (
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                      Showing {pageStart}-{pageEnd} of {filteredTheses.length}
                    </p>
                  ) : null}
                </div>

                {deferredSearch || activeFilterLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2 lg:max-w-[420px] lg:justify-end">
                    {deferredSearch ? (
                      <span className="pill-outline">Query: {deferredSearch}</span>
                    ) : null}
                    {activeFilterLabels.map((label) => (
                      <span key={label} className="pill-outline">
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {repositoryQuery.error ? (
              <EmptyState
                title="Repository unavailable"
                description={repositoryQuery.error.message}
              />
            ) : repositoryQuery.isPending ? (
              <EmptyState
                title="Loading archive"
                description="The frontend is fetching repository records and preparing the search results list."
              />
            ) : visibleTheses.length === 0 ? (
              <EmptyState
                title="No repository records yet"
                description="This tenant does not have any thesis or capstone records available yet."
              />
            ) : filteredTheses.length > 0 ? (
              <div className="space-y-6">
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

          <Drawer
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            eyebrow="Search filters"
            title="Refine archive results"
            description="Keep the main page focused on search and open the metadata controls only when you need them."
          >
            {renderFilterControls()}
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Repository"
        title={`${tenantDisplayName} collection`}
        description="Search, filter, and review the live tenant archive through a document-first catalogue that keeps metadata readable and actions obvious."
      >
        <span className="pill-outline">{roleLabels[activeRole]}</span>
        <span className="pill-outline">{sessionName}</span>
        <span className="pill-outline">{tenantDisplayName}</span>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible records"
          value={String(visibleTheses.length)}
          detail="Tenant-scoped catalogue entries returned by the backend."
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
                    description="The frontend is fetching live repository records from the backend."
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
                        Keyword search and status filtering are sent to the backend.
                        Department and program controls refine the returned dataset
                        locally to keep the archive responsive across large result sets.
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
                Records in the current lens after server and client refinement.
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
