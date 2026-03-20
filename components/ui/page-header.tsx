interface PageHeaderProps {
  eyebrow: string;
  title: string;
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
    <header className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] xl:items-end">
      <div className="max-w-4xl space-y-4">
        <p className="muted-label">{eyebrow}</p>
        <h1 className="max-w-4xl text-[clamp(2.4rem,4vw,4.4rem)] leading-[0.94] font-medium tracking-[-0.04em] text-balance">
          {title}
        </h1>
        <p className="text-muted max-w-2xl text-[15px]">{description}</p>
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-3 xl:justify-end xl:pb-2">
          {children}
        </div>
      ) : null}
    </header>
  );
}
