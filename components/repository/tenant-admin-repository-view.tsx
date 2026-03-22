import { ResultsPagination } from "@/components/repository/results-pagination";
import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SelectField } from "@/components/ui/select-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { TransitionLink } from "@/components/ui/transition-link";
import { formatDate, toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";
import {
  countTenantAdminOpenWorkflowItems,
  countTenantAdminReadyItems,
  getTenantAdminWorkflowDetail,
  getTenantAdminWorkflowLensLabel,
  getTenantAdminWorkflowSummary,
  matchesTenantAdminWorkflowLens,
  paginateItems,
  TENANT_ADMIN_WORKFLOW_LENSES,
  type TenantAdminWorkflowLens,
} from "../../lib/utils/repository-page-utils";
import { RepositorySearchField } from "./repository-search-field";
import type { RepositoryFilterControlsProps } from "./repository-filter-controls";

interface TenantAdminRepositoryViewProps {
  userLabel: string;
  tenantAdminWorkflowLens: TenantAdminWorkflowLens;
  onTenantAdminWorkflowLensChange: (lens: TenantAdminWorkflowLens) => void;
  onResetArchiveLens: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  visibleTheses: ThesisListItem[];
  filteredTheses: ThesisListItem[];
  tenantAdminRows: ThesisListItem[];
  publishedCount: number;
  hasAnyFilters: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  filterControls: RepositoryFilterControlsProps;
}

function TenantAdminRowList({ items }: { items: ThesisListItem[] }) {
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
            className={`grid gap-4 px-5 py-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.35fr)_140px_140px_170px_116px] xl:px-6 ${index > 0 ? "border-t border-[rgba(15,42,68,0.08)]" : ""
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

export function TenantAdminRepositoryView({
  userLabel,
  tenantAdminWorkflowLens,
  onTenantAdminWorkflowLensChange,
  onResetArchiveLens,
  currentPage,
  onPageChange,
  visibleTheses,
  filteredTheses,
  tenantAdminRows,
  publishedCount,
  hasAnyFilters,
  isLoading,
  errorMessage,
  filterControls,
}: TenantAdminRepositoryViewProps) {
  const tenantAdminWorkflowCounts = TENANT_ADMIN_WORKFLOW_LENSES.map((lens) => ({
    lens,
    count: filteredTheses.filter((thesis) =>
      matchesTenantAdminWorkflowLens(thesis, lens),
    ).length,
  }));
  const {
    paginatedItems: tenantAdminPaginatedRows,
    totalPages,
    resolvedPage,
    pageStart,
    pageEnd,
  } = paginateItems(tenantAdminRows, currentPage);
  const openWorkflowCount = countTenantAdminOpenWorkflowItems(visibleTheses);
  const readyCount = countTenantAdminReadyItems(visibleTheses);

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Repository administration"
        description="Manage the tenant archive through one scalable list that keeps workflow state, readiness, and core thesis information visible."
      >
        <span className="pill-outline">{userLabel}</span>
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
              state, status, readiness, and core archive details stay visible in a
              row-based list that scales better as records grow.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_180px_220px_220px]">
            <RepositorySearchField
              id="tenant-admin-repository-search"
              label="Search records"
              value={filterControls.search}
              onChange={filterControls.onSearchChange}
              placeholder="Search title, topic, department, or program"
            />

            <SelectField
              label="Status"
              value={filterControls.status}
              onChange={(event) => filterControls.onStatusChange(event.target.value)}
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
              value={filterControls.department}
              onChange={(event) =>
                filterControls.onDepartmentChange(event.target.value)
              }
            >
              <option value="ALL">All departments</option>
              {filterControls.departments.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Program"
              value={filterControls.program}
              onChange={(event) => filterControls.onProgramChange(event.target.value)}
            >
              <option value="ALL">All programs</option>
              {filterControls.programs.map((option) => (
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
                onClick={() => onTenantAdminWorkflowLensChange(lens)}
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
            <span>{openWorkflowCount} in workflow</span>
            <span>{readyCount} ready to publish</span>
            <span>{publishedCount} published</span>
            <span>{filterControls.departments.length} departments</span>
            {hasAnyFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={filterControls.onClearFilters}
              >
                Clear metadata filters
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {errorMessage ? (
        <EmptyState title="Repository unavailable" description={errorMessage} />
      ) : isLoading ? (
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
            <h2 className="text-[1.45rem] font-medium leading-tight tracking-[-0.025em] text-balance">
              Tenant repository records
            </h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Every row keeps the thesis title, workflow state, status,
              readiness, archive context, and direct access to the detail view
              in one place.
            </p>
          </div>

          <TenantAdminRowList items={tenantAdminPaginatedRows} />

          <div className="border-t border-[rgba(15,42,68,0.08)] px-6 py-5 sm:px-7">
            <ResultsPagination
              currentPage={resolvedPage}
              totalPages={totalPages}
              totalResults={tenantAdminRows.length}
              pageStart={pageStart}
              pageEnd={pageEnd}
              onPageChange={onPageChange}
            />
          </div>
        </section>
      ) : (
        <EmptyState
          title="No matching records"
          description="Try another workflow lens or clear the metadata filters to reopen the archive list."
          action={
            hasAnyFilters || tenantAdminWorkflowLens !== "ALL" ? (
              <Button variant="ghost" onClick={onResetArchiveLens}>
                Reset archive lens
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
