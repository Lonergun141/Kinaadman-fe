import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TransitionLink } from "@/components/ui/transition-link";
import {
  countLibrarianDeskItems,
  getLibrarianDeskFilterLabel,
  getPrimaryReadinessMessage,
  type LibrarianDeskFilter,
} from "@/lib/publication-readiness";
import type { ThesisListItem } from "@/types/domain";
import { LIBRARIAN_FILTER_ITEMS } from "../../lib/utils/repository-page-utils";
import { RepositorySearchField } from "./repository-search-field";

interface LibrarianRepositoryViewProps {
  userLabel: string;
  search: string;
  deskFilter: LibrarianDeskFilter;
  onSearchChange: (value: string) => void;
  onDeskFilterChange: (filter: LibrarianDeskFilter) => void;
  onClearDeskFilters: () => void;
  visibleTheses: ThesisListItem[];
  librarianDeskItems: ThesisListItem[];
  isLoading: boolean;
  errorMessage: string | null;
}

export function LibrarianRepositoryView({
  userLabel,
  search,
  deskFilter,
  onSearchChange,
  onDeskFilterChange,
  onClearDeskFilters,
  visibleTheses,
  librarianDeskItems,
  isLoading,
  errorMessage,
}: LibrarianRepositoryViewProps) {
  const hasDeskFilters = Boolean(search.trim()) || deskFilter !== "ALL";

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Library control desk"
        description="Search the archive like a librarian: see what is ready to publish, what is blocked, and what still needs documentary clearance."
      >
        <span className="pill-outline">{userLabel}</span>
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
          <RepositorySearchField
            id="librarian-desk-search"
            label="Search records"
            value={search}
            onChange={onSearchChange}
            placeholder="Search title, author, program, or department"
          />
          <div className="flex flex-wrap gap-2">
            {LIBRARIAN_FILTER_ITEMS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onDeskFilterChange(filter)}
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

      {errorMessage ? (
        <EmptyState title="Repository unavailable" description={errorMessage} />
      ) : isLoading ? (
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
                    <TransitionLink
                      href={`/theses/${thesis.id}`}
                      className="block text-[1.35rem] font-semibold leading-tight text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
                      pendingClassName="opacity-80"
                    >
                      {thesis.title}
                    </TransitionLink>
                    <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                      {thesis.authors.map((author) => author.display_name).join(", ") ||
                        "Author not recorded"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="pill-outline">
                      {thesis.program?.name ||
                        thesis.department?.name ||
                        "Program not assigned"}
                    </span>
                    <span className="pill-outline">{thesis.year}</span>
                    <span className="pill-outline">{thesis.thesis_type}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <StatusBadge status={thesis.status} />
                  <ReadinessBadge
                    status={
                      thesis.publication_readiness.can_publish_now
                        ? "READY"
                        : "PENDING"
                    }
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
                  <TransitionLink
                    href={`/theses/${thesis.id}`}
                    className="text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                    pendingClassName="opacity-80"
                  >
                    Open record
                  </TransitionLink>
                  <TransitionLink
                    href="/review"
                    className="text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                    pendingClassName="opacity-80"
                  >
                    Open review desk
                  </TransitionLink>
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
            hasDeskFilters ? (
              <Button variant="ghost" onClick={onClearDeskFilters}>
                Clear desk filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
