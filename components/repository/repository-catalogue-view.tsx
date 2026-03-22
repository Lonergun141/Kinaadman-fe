import { ResultsPagination } from "@/components/repository/results-pagination";
import { ThesisCards } from "@/components/repository/thesis-cards";
import { ThesisTable } from "@/components/repository/thesis-table";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SidePanel } from "@/components/ui/side-panel";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TabPanels } from "@/components/ui/tab-panels";
import type { ThesisListItem } from "@/types/domain";
import {
  RepositoryFilterControls,
  type RepositoryFilterControlsProps,
} from "./repository-filter-controls";

interface RepositoryCatalogueViewProps {
  filterControls: RepositoryFilterControlsProps;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  selectedDepartmentName: string | null;
  selectedProgramName: string | null;
  visibleThesesCount: number;
  filteredThesesCount: number;
  publishedCount: number;
  reviewCount: number;
  paginatedTheses: ThesisListItem[];
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
  hasAnyFilters: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

export function RepositoryCatalogueView({
  filterControls,
  filtersOpen,
  onFiltersOpenChange,
  selectedDepartmentName,
  selectedProgramName,
  visibleThesesCount,
  filteredThesesCount,
  publishedCount,
  reviewCount,
  paginatedTheses,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  onPageChange,
  hasAnyFilters,
  isLoading,
  errorMessage,
}: RepositoryCatalogueViewProps) {
  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Repository"
        description="Search, filter, and review the live tenant archive through a document-first catalogue that keeps metadata readable and actions obvious."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible records"
          value={String(visibleThesesCount)}
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
          value={String(filterControls.departments.length)}
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
            <Button variant="secondary" onClick={() => onFiltersOpenChange(true)}>
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
                content: errorMessage ? (
                  <EmptyState
                    title="Repository unavailable"
                    description={errorMessage}
                  />
                ) : isLoading ? (
                  <EmptyState
                    title="Loading archive"
                    description="Preparing the latest archive records for reading."
                  />
                ) : filteredThesesCount > 0 ? (
                  <div className="space-y-4">
                    <ThesisTable items={paginatedTheses} />
                    <ThesisCards items={paginatedTheses} />
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
                            {filteredThesesCount} / {visibleThesesCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-primary-label">Programs surfaced</dt>
                          <dd className="text-muted mt-1">
                            {filterControls.programs.length} program options remain
                            visible inside the current lens.
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
                {filteredThesesCount} / {visibleThesesCount}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Records currently visible after your filters are applied.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-primary-label">Active filters</p>
              <div className="flex flex-wrap gap-2">
                {filterControls.search ? (
                  <span className="pill-outline">Search: {filterControls.search}</span>
                ) : null}
                {filterControls.status !== "ALL" ? (
                  <span className="pill-outline">{filterControls.status}</span>
                ) : null}
                {filterControls.department !== "ALL" ? (
                  <span className="pill-outline">
                    {selectedDepartmentName || "Department"}
                  </span>
                ) : null}
                {filterControls.program !== "ALL" ? (
                  <span className="pill-outline">
                    {selectedProgramName || "Program"}
                  </span>
                ) : null}
                {!hasAnyFilters ? (
                  <span className="pill-outline">No extra filters applied</span>
                ) : null}
              </div>
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => onFiltersOpenChange(true)}
            >
              Open filter drawer
            </Button>
          </div>
        </SidePanel>
      </section>

      <Drawer
        open={filtersOpen}
        onClose={() => onFiltersOpenChange(false)}
        eyebrow="Reading lens"
        title="Refine the archive"
        description="Use search and metadata controls without crowding the catalogue surface."
      >
        <RepositoryFilterControls
          {...filterControls}
          onApply={() => onFiltersOpenChange(false)}
        />
      </Drawer>
    </div>
  );
}
