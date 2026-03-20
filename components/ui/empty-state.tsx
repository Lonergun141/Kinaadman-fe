interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="paper-panel flex flex-col items-center justify-center px-6 py-12 text-center sm:px-8">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(15,42,68,0.06)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]">
        <svg
          className="h-5 w-5 text-[color:var(--color-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <p className="muted-label mb-2">Archive state</p>
      <h3 className="font-serif text-[1.55rem] leading-tight text-[color:var(--color-primary)] text-balance">
        {title}
      </h3>
      <p className="text-muted mt-2 max-w-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
