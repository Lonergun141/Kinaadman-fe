import { TransitionLink } from "@/components/ui/transition-link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-muted)]"
    >
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
              <TransitionLink
                href={item.href}
                className="rounded-full px-2 py-0.5 font-medium transition-colors hover:bg-[rgba(15,42,68,0.05)] hover:text-[color:var(--color-primary)]"
                pendingClassName="opacity-75"
              >
                {item.label}
              </TransitionLink>
            )}
          </span>
        );
      })}
    </nav>
  );
}
