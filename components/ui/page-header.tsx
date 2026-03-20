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
    <header className="space-y-4">
      <div className="max-w-4xl space-y-3">
        <p className="muted-label">{eyebrow}</p>
        <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.98] font-medium tracking-[-0.03em]">
          {title}
        </h1>
        <p className="text-muted max-w-2xl text-[15px]">{description}</p>
      </div>
      {children}
    </header>
  );
}
