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
    <div className="flex flex-col gap-3 border-t border-[rgba(15,42,68,0.08)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-6 text-[color:var(--color-muted-foreground)]">
        Showing {pageStart}-{pageEnd} of {totalResults} results
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex h-9 items-center justify-center rounded-[0.55rem] border border-[rgba(15,42,68,0.12)] bg-white px-3 text-[13px] font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[rgba(15,42,68,0.04)] disabled:pointer-events-none disabled:opacity-50"
        >
          Previous
        </button>

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
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-[0.55rem] bg-[color:var(--color-primary)] px-3 text-[13px] font-semibold text-white shadow-[0_12px_22px_rgba(0,21,42,0.14)]"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-[0.55rem] border border-[rgba(15,42,68,0.12)] bg-white px-3 text-[13px] font-medium text-[color:var(--color-primary)] transition-colors hover:bg-[rgba(15,42,68,0.04)]"
                }
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex h-9 items-center justify-center rounded-[0.55rem] border border-[rgba(15,42,68,0.12)] bg-white px-3 text-[13px] font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[rgba(15,42,68,0.04)] disabled:pointer-events-none disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
