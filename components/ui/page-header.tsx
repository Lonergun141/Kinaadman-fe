interface PageHeaderProps {
  eyebrow: string;
  title?: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <header className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] xl:items-end">
      <div className="max-w-4xl space-y-4">
        <p className="muted-label">{eyebrow}</p>
        {title ? (
          <h1 className="text-[clamp(2rem,3vw,3rem)] leading-[0.96] tracking-[-0.04em] text-balance">
            {title}
          </h1>
        ) : null}
        <p className="text-muted max-w-2xl text-[15px]">{description}</p>
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {children}
        </div>
      ) : null}
    </header>
  );
}
