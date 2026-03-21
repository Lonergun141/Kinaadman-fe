"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ResultsPagination } from "@/components/repository/results-pagination";
import { TransitionLink } from "@/components/ui/transition-link";
import { listPublicCollections, listPublicTheses } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";
import { formatDate, toTitleCase } from "@/lib/utils";
import type { CollectionBucket, PublicThesisListItem, ThesisAuthor } from "@/types/domain";

const RESULTS_PER_PAGE = 10;

export default function PublicTenantRepositoryPage() {
  const params = useParams<{ tenantSlug: string }>();
  const tenantSlug = params.tenantSlug;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [currentPage, setCurrentPage] = useState(1);

  const thesesQuery = useQuery({
    queryKey: queryKeys.repository.publicTheses(tenantSlug, deferredSearch),
    queryFn: () =>
      listPublicTheses({
        tenantSlug,
        search: deferredSearch,
      }),
    enabled: Boolean(tenantSlug),
  });

  const collectionsQuery = useQuery({
    queryKey: queryKeys.repository.publicCollections(tenantSlug),
    queryFn: () => listPublicCollections(tenantSlug),
    enabled: Boolean(tenantSlug),
  });

  const items = thesesQuery.data ?? [];
  const tenantName =
    items[0]?.tenant_name ||
    tenantSlug.replaceAll("-", " ").replace(/\b\w/g, (match) => match.toUpperCase());
  const totalPages = Math.max(1, Math.ceil(items.length / RESULTS_PER_PAGE));
  const resolvedPage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (resolvedPage - 1) * RESULTS_PER_PAGE;

    return items.slice(start, start + RESULTS_PER_PAGE);
  }, [items, resolvedPage]);
  const pageStart = items.length ? (resolvedPage - 1) * RESULTS_PER_PAGE + 1 : 0;
  const pageEnd = items.length ? Math.min(resolvedPage * RESULTS_PER_PAGE, items.length) : 0;

  return (
    <main className="page-shell space-y-6">
      <section className="mx-auto max-w-[1180px] rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.96)] shadow-[0_18px_32px_rgba(0,21,42,0.04)]">
        <div className="border-b border-[rgba(15,42,68,0.08)] px-4 py-4 sm:px-6">
          <p className="muted-label">Public repository</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-[2.4rem] italic text-[color:var(--color-primary)]">
              {tenantName}
            </h1>
            <span className="text-sm text-[color:var(--color-muted-foreground)]">
              Research archive
            </span>
          </div>
        </div>

        <div className="grid gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <label className="relative">
            <span className="sr-only">Search public repository</span>
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
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search public theses, capstones, or keywords"
              className="input-base pl-10"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-[rgba(15,42,68,0.08)] bg-white px-4 py-4">
              <p className="text-primary-label">Repository type mix</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(collectionsQuery.data?.thesis_types ?? []).slice(0, 4).map((bucket: CollectionBucket) => (
                  <span key={bucket.value} className="pill-outline">
                    {toTitleCase(bucket.label)} ({bucket.count})
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-[rgba(15,42,68,0.08)] bg-white px-4 py-4">
              <p className="text-primary-label">Browse by year</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(collectionsQuery.data?.years ?? []).slice(0, 4).map((bucket: CollectionBucket) => (
                  <span key={bucket.value} className="pill-outline">
                    {bucket.label} ({bucket.count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(15,42,68,0.08)] px-4 py-3 text-xs text-[color:var(--color-muted-foreground)] sm:px-6">
          {thesesQuery.isPending
            ? "Loading public repository records"
            : deferredSearch
              ? `${items.length} result${items.length === 1 ? "" : "s"} for "${deferredSearch}"`
              : `${items.length} public record${items.length === 1 ? "" : "s"} available`}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] space-y-4">
        {thesesQuery.error ? (
          <div className="border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.05)] px-4 py-4 text-sm text-[color:var(--color-error)]">
            {thesesQuery.error.message}
          </div>
        ) : null}

        {thesesQuery.isPending ? (
          <div className="border border-[rgba(15,42,68,0.08)] bg-white px-4 py-6 text-sm text-[color:var(--color-muted-foreground)]">
            Loading public search results...
          </div>
        ) : items.length ? (
          <div className="overflow-hidden border border-[rgba(15,42,68,0.08)] bg-white">
            {paginatedItems.map((item: PublicThesisListItem) => (
              <article
                key={item.id}
                className="grid gap-4 border-b border-[rgba(15,42,68,0.08)] px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_210px]"
              >
                <div>
                  <p className="text-[11px] leading-5 text-[color:var(--color-muted)]">
                    {[item.tenant_name, item.department?.name, item.program?.name]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                  <TransitionLink
                    href={`/discover/${tenantSlug}/theses/${item.public_slug}`}
                    className="mt-1 block max-w-4xl font-serif text-[clamp(1.22rem,1.9vw,1.58rem)] leading-[1.12] text-[color:var(--color-primary-container)] transition-colors hover:text-[color:var(--color-secondary)]"
                    pendingClassName="opacity-80"
                  >
                    {item.title}
                  </TransitionLink>
                  <p className="mt-1 text-[13px] leading-6 text-[color:var(--color-muted-foreground)]">
                    {item.authors.length
                      ? item.authors.map((author: ThesisAuthor) => author.display_name).join(", ")
                      : "Unknown author"}{" "}
                    | {item.year}
                  </p>
                  <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-[color:var(--color-muted-foreground)]">
                    {item.research_category || item.methodology || "Institutional repository record"}.
                    {" "}
                    {item.status === "PUBLISHED"
                      ? `Published ${formatDate(item.published_at)}.`
                      : `Updated ${formatDate(item.updated_at)}.`}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                    <TransitionLink
                      href={`/discover/${tenantSlug}/theses/${item.public_slug}`}
                      className="text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                      pendingClassName="opacity-80"
                    >
                      View record
                    </TransitionLink>
                    <span>{toTitleCase(item.thesis_type)}</span>
                    <span>{toTitleCase(item.visibility)}</span>
                    <span>{item.language}</span>
                  </div>
                </div>

                <div className="hidden text-right lg:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]">
                    [{item.status === "PUBLISHED" ? "Published" : toTitleCase(item.status)}]
                  </p>
                  <p className="mt-1 text-base text-[color:var(--color-primary-container)]">
                    {item.program?.name || item.department?.name || tenantName}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                    {item.college_name || item.department?.name || "Institutional repository"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-[rgba(15,42,68,0.08)] bg-white px-4 py-8 text-center text-sm text-[color:var(--color-muted-foreground)]">
            No public records matched this search.
          </div>
        )}

        <ResultsPagination
          currentPage={resolvedPage}
          totalPages={totalPages}
          totalResults={items.length}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
