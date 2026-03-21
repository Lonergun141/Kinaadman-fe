"use client";

import { useEffect, useMemo, useState } from "react";
import { ResultsPagination } from "@/components/repository/results-pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TransitionLink } from "@/components/ui/transition-link";
import { formatDateTime, toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

interface WorkspaceRecordsTableProps {
  theses: ThesisListItem[];
  selectedId: string;
  errorMessage?: string;
  onSelect: (thesisId: string) => void;
}

const PAGE_SIZE = 10;

export function WorkspaceRecordsTable({
  theses,
  selectedId,
  errorMessage,
  onSelect,
}: WorkspaceRecordsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedTheses = useMemo(
    () =>
      [...theses].sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      ),
    [theses],
  );
  const totalPages = Math.max(1, Math.ceil(sortedTheses.length / PAGE_SIZE));
  const paginatedTheses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return sortedTheses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, sortedTheses]);
  const pageStart = sortedTheses.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, sortedTheses.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedTheses.length]);

  if (errorMessage) {
    return <EmptyState title="Records unavailable" description={errorMessage} />;
  }

  if (!sortedTheses.length) {
    return (
      <EmptyState
        title="No thesis records yet"
        description="Create your first thesis or capstone record in the workflow above. Your latest work will appear here."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-[0.85rem] bg-white shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[rgba(15,42,68,0.03)] text-[color:var(--color-primary)]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">
                Record
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">
                Program
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">
                Last updated
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTheses.map((thesis) => {
              const selected = thesis.id === selectedId;

              return (
                <tr
                  key={thesis.id}
                  className={`border-t border-[rgba(15,42,68,0.08)] transition-colors ${
                    selected ? "bg-[rgba(201,162,39,0.07)]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3.5 align-top">
                    <div className="space-y-1.5">
                      <p className="font-serif text-[1.12rem] leading-tight text-[color:var(--color-primary)]">
                        {thesis.title}
                      </p>
                      <p className="text-xs leading-6 text-[color:var(--color-muted-foreground)]">
                        {thesis.department?.name || "No department selected"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    {thesis.program?.name || "No program selected"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-[rgba(15,42,68,0.05)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-primary)]">
                      {toTitleCase(thesis.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    {formatDateTime(thesis.updated_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Button variant="ghost" size="sm" onClick={() => onSelect(thesis.id)}>
                        {selected ? "Open now" : "Continue"}
                      </Button>
                      <TransitionLink
                        href={`/theses/${thesis.id}`}
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]"
                        pendingClassName="opacity-80"
                      >
                        View detail
                      </TransitionLink>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ResultsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={sortedTheses.length}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
