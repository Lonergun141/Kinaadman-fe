import { cx } from "@/lib/utils";
import { SurfaceCard } from "./surface-card";

interface SidePanelProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidePanel({
  eyebrow,
  title,
  description,
  children,
  className,
}: SidePanelProps) {
  return (
    <aside className={cx("xl:sticky xl:top-28 xl:self-start", className)}>
      <SurfaceCard eyebrow={eyebrow} title={title}>
        {description ? (
          <p className="text-muted mb-5 text-sm">{description}</p>
        ) : null}
        {children}
      </SurfaceCard>
    </aside>
  );
}
