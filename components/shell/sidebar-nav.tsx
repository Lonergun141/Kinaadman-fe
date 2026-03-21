"use client";

import { NavigationGlyph } from "@/components/visuals/archive-graphics";
import { TransitionLink } from "@/components/ui/transition-link";
import { cx } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { AppRole } from "@/stores/workspace-store";
import { navigation, navigationSections } from "./navigation";

interface SidebarNavProps {
  pathname: string;
  activeRole: AppRole;
  onNavigate: () => void;
}

export function SidebarNav({
  pathname,
  activeRole,
  onNavigate,
}: SidebarNavProps) {
  const navigationPendingHref = useUiStore(
    (state) => state.navigationPendingHref,
  );

  return (
    <nav className="space-y-6" aria-label="Primary">
      {navigationSections.map((section) => {
        const items = navigation.filter(
          (item) => item.section === section && item.roles.includes(activeRole),
        );

        if (!items.length) {
          return null;
        }

        return (
          <div key={section} className="space-y-1">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              {section}
            </p>
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/repository" && pathname.startsWith(item.href));
              const pending = navigationPendingHref === item.href;

              return (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onNavigate={onNavigate}
                  className={cx(
                    "group relative flex items-center gap-3 rounded-[0.5rem] px-3 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-[color:var(--color-surface)] text-[color:var(--color-primary)] shadow-sm border border-[color:var(--color-border)]"
                      : "text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-surface-high)] hover:text-[color:var(--color-primary)] border border-transparent",
                    pending ? "bg-[color:var(--color-surface-low)] text-[color:var(--color-primary)]" : undefined,
                  )}
                  pendingClassName="bg-[color:var(--color-surface-low)] text-[color:var(--color-primary)]"
                >
                  <span
                    className={cx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] border transition-all duration-200",
                      active
                        ? "border-[rgba(15,42,68,0.1)] bg-white/94 shadow-[0_10px_18px_rgba(0,21,42,0.06)]"
                        : "border-[rgba(15,42,68,0.06)] bg-white/74 group-hover:border-[rgba(15,42,68,0.1)] group-hover:bg-white/90",
                    )}
                  >
                    <NavigationGlyph href={item.href} active={active} />
                  </span>
                  <span className="min-w-0">
                    <span className="block">{item.label}</span>
                    <span className="mt-0.5 block text-xs font-normal leading-5 text-[color:var(--color-muted)] group-hover:text-[color:var(--color-muted-foreground)]">
                      {item.description}
                    </span>
                  </span>
                  {pending ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-secondary)]"
                    />
                  ) : null}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[color:var(--color-secondary)]"
                    />
                  ) : null}
                </TransitionLink>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
