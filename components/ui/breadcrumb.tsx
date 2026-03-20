import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {index > 0 ? (
              <svg
                className="h-3.5 w-3.5 text-[color:var(--color-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            ) : null}
            {isLast || !item.href ? (
              <span className="font-medium text-[color:var(--color-primary)]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="font-medium text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
