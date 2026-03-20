interface SurfaceCardProps {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}

export function SurfaceCard({
  title,
  eyebrow,
  children,
  className = "",
}: SurfaceCardProps) {
  return (
    <section className={`paper-panel p-6 sm:p-7 lg:p-8 ${className}`.trim()}>
      {eyebrow || title ? (
        <div className="mb-6 space-y-2">
          {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
          {title ? (
            <h2 className="text-[1.5rem] leading-tight font-medium tracking-[-0.02em]">
              {title}
            </h2>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
