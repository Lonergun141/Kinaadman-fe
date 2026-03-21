"use client";

import { usePathname } from "next/navigation";
import {
  getVisualVariantFromPath,
  HeaderIllustration,
  NavigationGlyph,
} from "@/components/visuals/archive-graphics";

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
  const pathname = usePathname();
  const visualVariant = getVisualVariantFromPath(pathname);

  return (
    <header className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
      <div className="max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white/88 text-[color:var(--color-primary)] shadow-[0_14px_24px_rgba(0,21,42,0.05)]">
            <NavigationGlyph
              href={pathname.startsWith("/theses") ? "/repository" : pathname}
              active
              className="h-[18px] w-[18px]"
            />
          </span>
          <p className="muted-label">{eyebrow}</p>
        </div>
        {title ? (
          <h1 className="text-[clamp(2rem,3vw,3rem)] leading-[0.96] tracking-[-0.04em] text-balance">
            {title}
          </h1>
        ) : null}
        <p className="text-muted max-w-2xl text-[15px]">{description}</p>
      </div>
      <div className="space-y-3 xl:justify-self-end">
        {children ? (
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {children}
          </div>
        ) : null}
        <HeaderIllustration variant={visualVariant} className="w-full min-w-[260px]" />
      </div>
    </header>
  );
}
