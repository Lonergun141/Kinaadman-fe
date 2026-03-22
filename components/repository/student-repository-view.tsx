import { ResultsPagination } from "@/components/repository/results-pagination";
import { ScholarResults } from "@/components/repository/scholar-results";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";
import { STATUS_RAIL_OPTIONS } from "../../lib/utils/repository-page-utils";
import {
  RepositoryFilterControls,
  type RepositoryFilterControlsProps,
} from "./repository-filter-controls";

interface StudentRepositoryViewProps {
  tenantDisplayName: string;
  deferredSearch: string;
  activeFilterLabels: string[];
  extraFilterCount: number;
  hasAnyFilters: boolean;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  paginatedTheses: ThesisListItem[];
  visibleThesesCount: number;
  filteredThesesCount: number;
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  errorMessage: string | null;
  filterControls: RepositoryFilterControlsProps;
}

function RailButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
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

export function StudentRepositoryView({
  tenantDisplayName,
  deferredSearch,
  activeFilterLabels,
  extraFilterCount,
  hasAnyFilters,
  filtersOpen,
  onFiltersOpenChange,
  paginatedTheses,
  visibleThesesCount,
  filteredThesesCount,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  onPageChange,
  isLoading,
  errorMessage,
  filterControls,
}: StudentRepositoryViewProps) {
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
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                id="repository-search"
                value={filterControls.search}
                onChange={(event) => filterControls.onSearchChange(event.target.value)}
                placeholder="Search theses, capstones, or topics"
                className="h-11 w-full rounded-[0.65rem] border border-[rgba(15,42,68,0.12)] bg-white pl-10 pr-4 text-[15px] text-[color:var(--color-foreground)] outline-none transition-shadow placeholder:text-[color:var(--color-muted)] focus:border-[rgba(201,162,39,0.5)] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
              />
            </label>
            <div className="flex items-center gap-2 xl:hidden">
              <Button
                variant="secondary"
                size="sm"
                className="min-w-[132px]"
                onClick={() => onFiltersOpenChange(true)}
              >
                {extraFilterCount > 0 ? `Filters (${extraFilterCount})` : "Filters"}
              </Button>
              {hasAnyFilters ? (
                <Button variant="ghost" size="sm" onClick={filterControls.onClearFilters}>
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
          <div className="border-t border-[rgba(15,42,68,0.08)] px-4 py-2.5 text-xs text-[color:var(--color-muted-foreground)] sm:px-5">
            {isLoading
              ? "Loading archive records"
              : errorMessage
                ? "Archive unavailable"
                : deferredSearch
                  ? `About ${filteredThesesCount} result${filteredThesesCount === 1 ? "" : "s"} for "${deferredSearch}"`
                  : `About ${visibleThesesCount} result${visibleThesesCount === 1 ? "" : "s"} in ${tenantDisplayName}`}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5 border-r border-[rgba(15,42,68,0.08)] pr-5">
              <div className="space-y-3">
                <p className="muted-label">Status</p>
                <div className="space-y-2">
                  {STATUS_RAIL_OPTIONS.map((option) => (
                    <RailButton
                      key={option}
                      label={option === "ALL" ? "Any status" : toTitleCase(option)}
                      active={filterControls.status === option}
                      onClick={() => filterControls.onStatusChange(option)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="muted-label">Department</p>
                <div className="space-y-2">
                  <RailButton
                    label="Any department"
                    active={filterControls.department === "ALL"}
                    onClick={() => {
                      filterControls.onDepartmentChange("ALL");
                      filterControls.onProgramChange("ALL");
                    }}
                  />
                  {filterControls.departments.slice(0, 8).map((option) => (
                    <RailButton
                      key={option.id}
                      label={option.name}
                      active={filterControls.department === option.id}
                      onClick={() => {
                        filterControls.onDepartmentChange(option.id);
                        filterControls.onProgramChange("ALL");
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <SelectField
                  label="Program"
                  value={filterControls.program}
                  onChange={(event) => filterControls.onProgramChange(event.target.value)}
                >
                  <option value="ALL">Any program</option>
                  {filterControls.programs.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </SelectField>
              </div>

              {hasAnyFilters ? (
                <Button variant="ghost" size="sm" onClick={filterControls.onClearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </aside>

          <section className="space-y-4">
            {(deferredSearch || activeFilterLabels.length > 0) &&
              !isLoading &&
              !errorMessage ? (
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

            {errorMessage ? (
              <EmptyState title="Repository unavailable" description={errorMessage} />
            ) : isLoading ? (
              <EmptyState
                title="Loading archive"
                description="Gathering archive records and preparing the result list."
              />
            ) : visibleThesesCount === 0 ? (
              <EmptyState
                title="No repository records yet"
                description="This tenant does not have any thesis or capstone records available yet."
              />
            ) : filteredThesesCount > 0 ? (
              <div className="space-y-4">
                <ScholarResults
                  items={paginatedTheses}
                  tenantDisplayName={tenantDisplayName}
                />
                <ResultsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={filteredThesesCount}
                  pageStart={pageStart}
                  pageEnd={pageEnd}
                  onPageChange={onPageChange}
                />
              </div>
            ) : (
              <EmptyState
                title="No matching records"
                description="Try a broader keyword or clear one of the filters to reopen the archive list."
                action={
                  hasAnyFilters ? (
                    <Button variant="ghost" onClick={filterControls.onClearFilters}>
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
          onClose={() => onFiltersOpenChange(false)}
          eyebrow="Search filters"
          title="Refine results"
          description="Narrow the list without leaving the search page."
        >
          <RepositoryFilterControls
            {...filterControls}
            onApply={() => onFiltersOpenChange(false)}
          />
        </Drawer>
      </div>
    </div>
  );
}
