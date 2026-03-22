"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDepartments, listPrograms, listTheses } from "@/features/repository/api";
import {
  matchesLibrarianDeskFilter,
  sortLibrarianDeskItems,
  type LibrarianDeskFilter,
} from "@/lib/publication-readiness";
import { queryKeys } from "@/lib/query-keys";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { RepositoryCatalogueView } from "../../../components/repository/repository-catalogue-view";
import { type RepositoryFilterControlsProps } from "../../../components/repository/repository-filter-controls";
import { LibrarianRepositoryView } from "../../../components/repository/librarian-repository-view";
import { StudentRepositoryView } from "../../../components/repository/student-repository-view";
import { TenantAdminRepositoryView } from "../../../components/repository/tenant-admin-repository-view";
import {
  filterRepositoryTheses,
  getActiveRepositoryFilterLabels,
  getVisibleDepartments,
  getVisiblePrograms,
  hasRepositoryFilters,
  matchesTenantAdminWorkflowLens,
  paginateItems,
  sortByUpdatedAtDesc,
  type TenantAdminWorkflowLens,
} from "../../../lib/utils/repository-page-utils";

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
  const deferredSearch = useDeferredValue(search.trim());
  const pageScopeKey = [
    activeRole,
    activeTenantId,
    deferredSearch,
    status,
    department,
    program,
    deskFilter,
    tenantAdminWorkflowLens,
  ].join("|");
  const [paginationState, setPaginationState] = useState({
    page: 1,
    scopeKey: pageScopeKey,
  });
  const currentPage =
    paginationState.scopeKey === pageScopeKey ? paginationState.page : 1;

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
    () => getVisibleDepartments(departmentsQuery.data ?? [], visibleTheses),
    [departmentsQuery.data, visibleTheses],
  );
  const programs = useMemo(
    () => getVisiblePrograms(programsQuery.data ?? [], visibleTheses, department),
    [department, programsQuery.data, visibleTheses],
  );
  const filteredTheses = useMemo(
    () =>
      filterRepositoryTheses(visibleTheses, {
        activeRole,
        search: deferredSearch,
        status,
        department,
        program,
      }),
    [activeRole, deferredSearch, department, program, status, visibleTheses],
  );
  const publishedCount = useMemo(
    () => visibleTheses.filter((thesis) => thesis.status === "PUBLISHED").length,
    [visibleTheses],
  );
  const reviewCount = useMemo(
    () =>
      visibleTheses.filter((thesis) =>
        ["SUBMITTED", "IN_REVIEW", "APPROVED"].includes(thesis.status),
      ).length,
    [visibleTheses],
  );
  const selectedDepartmentName =
    departments.find((option) => option.id === department)?.name || null;
  const selectedProgramName =
    programs.find((option) => option.id === program)?.name || null;
  const activeFilterLabels = useMemo(
    () =>
      getActiveRepositoryFilterLabels(
        status,
        selectedDepartmentName,
        selectedProgramName,
      ),
    [selectedDepartmentName, selectedProgramName, status],
  );
  const hasAnyFilters = hasRepositoryFilters({
    search,
    status,
    department,
    program,
  });
  const {
    paginatedItems: paginatedTheses,
    totalPages,
    resolvedPage,
    pageStart,
    pageEnd,
  } = useMemo(() => paginateItems(filteredTheses, currentPage), [filteredTheses, currentPage]);
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
  const tenantDisplayName =
    tenantContext?.branding?.display_name || tenantContext?.name || "Tenant archive";
  const repositoryLoading = repositoryQuery.isPending;
  const repositoryErrorMessage = repositoryQuery.error?.message ?? null;
  const repositoryUserLabel = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : roleLabels[activeRole];
  const filterControls: RepositoryFilterControlsProps = {
    search,
    status,
    department,
    program,
    departments,
    programs,
    onSearchChange: setSearch,
    onStatusChange: setStatus,
    onDepartmentChange: handleDepartmentChange,
    onProgramChange: setProgram,
    onClearFilters: clearFilters,
  };

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setDepartment("ALL");
    setProgram("ALL");
  }

  function handleDepartmentChange(nextDepartment: string) {
    setDepartment(nextDepartment);

    const nextPrograms = getVisiblePrograms(
      programsQuery.data ?? [],
      visibleTheses,
      nextDepartment,
    );

    if (program !== "ALL" && !nextPrograms.some((option) => option.id === program)) {
      setProgram("ALL");
    }
  }

  function clearDeskFilters() {
    setSearch("");
    setDeskFilter("ALL");
  }

  function resetTenantAdminView() {
    clearFilters();
    setTenantAdminWorkflowLens("ALL");
  }

  function handlePageChange(page: number) {
    setPaginationState({
      page,
      scopeKey: pageScopeKey,
    });
  }

  if (activeRole === "STUDENT") {
    return (
      <StudentRepositoryView
        tenantDisplayName={tenantDisplayName}
        deferredSearch={deferredSearch}
        activeFilterLabels={activeFilterLabels}
        extraFilterCount={[status !== "ALL", department !== "ALL", program !== "ALL"].filter(Boolean).length}
        hasAnyFilters={hasAnyFilters}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
        paginatedTheses={paginatedTheses}
        visibleThesesCount={visibleTheses.length}
        filteredThesesCount={filteredTheses.length}
        currentPage={resolvedPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={handlePageChange}
        isLoading={repositoryLoading}
        errorMessage={repositoryErrorMessage}
        filterControls={filterControls}
      />
    );
  }

  if (activeRole === "TENANT_ADMIN") {
    return (
      <TenantAdminRepositoryView
        userLabel={repositoryUserLabel}
        tenantAdminWorkflowLens={tenantAdminWorkflowLens}
        onTenantAdminWorkflowLensChange={setTenantAdminWorkflowLens}
        onResetArchiveLens={resetTenantAdminView}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        visibleTheses={visibleTheses}
        filteredTheses={filteredTheses}
        tenantAdminRows={tenantAdminRows}
        publishedCount={publishedCount}
        hasAnyFilters={hasAnyFilters}
        isLoading={repositoryLoading}
        errorMessage={repositoryErrorMessage}
        filterControls={filterControls}
      />
    );
  }

  if (activeRole === "LIBRARIAN") {
    return (
      <LibrarianRepositoryView
        userLabel={repositoryUserLabel}
        search={search}
        deskFilter={deskFilter}
        onSearchChange={setSearch}
        onDeskFilterChange={setDeskFilter}
        onClearDeskFilters={clearDeskFilters}
        visibleTheses={visibleTheses}
        librarianDeskItems={librarianDeskItems}
        isLoading={repositoryLoading}
        errorMessage={repositoryErrorMessage}
      />
    );
  }

  return (
    <RepositoryCatalogueView
      filterControls={filterControls}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={setFiltersOpen}
      selectedDepartmentName={selectedDepartmentName}
      selectedProgramName={selectedProgramName}
      visibleThesesCount={visibleTheses.length}
      filteredThesesCount={filteredTheses.length}
      publishedCount={publishedCount}
      reviewCount={reviewCount}
      paginatedTheses={paginatedTheses}
      currentPage={resolvedPage}
      totalPages={totalPages}
      pageStart={pageStart}
      pageEnd={pageEnd}
      onPageChange={handlePageChange}
      hasAnyFilters={hasAnyFilters}
      isLoading={repositoryLoading}
      errorMessage={repositoryErrorMessage}
    />
  );
}
