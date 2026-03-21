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
    <section className={`paper-panel p-5 sm:p-6 lg:p-6 ${className}`.trim()}>
      {eyebrow || title ? (
        <div className="mb-5 space-y-2.5">
          {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
          {title ? (
            <h2 className="text-[1.55rem] leading-tight font-medium tracking-[-0.025em] text-balance">
              {title}
            </h2>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
