import { Button } from "@/components/ui/button";

interface ResultsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
}

function getPageWindow(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages: number[] = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return [...new Set(pages)];
}

export function ResultsPagination({
  currentPage,
  totalPages,
  totalResults,
  pageStart,
  pageEnd,
  onPageChange,
}: ResultsPaginationProps) {
  if (totalResults <= 10) {
    return null;
  }

  const pages = getPageWindow(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-4 rounded-[0.5rem] bg-[rgba(255,255,255,0.7)] px-5 py-4 shadow-[0_18px_30px_rgba(0,21,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
        Showing {pageStart}-{pageEnd} of {totalResults} results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showGap = previousPage && page - previousPage > 1;

          return (
            <span key={page} className="contents">
              {showGap ? (
                <span className="px-1 text-sm text-[color:var(--color-muted)]">...</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={
                  page === currentPage
                    ? "inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(0,21,42,0.18)]"
                    : "inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.7)] px-3 text-sm font-semibold text-[color:var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)] transition-colors hover:bg-[color:var(--color-surface-high)]"
                }
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            </span>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
