"use client";

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

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const className = cx(
    "h-4 w-4 shrink-0 transition-transform duration-200",
    active
      ? "text-[color:var(--color-primary)]"
      : "text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-primary)]",
  );

  if (href === "/repository") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 6.75h14M5 12h14M5 17.25h14" strokeLinecap="round" />
        <path d="M4 4h16v16H4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (href === "/profile") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
        <path d="M4.5 19.5a7.5 7.5 0 0115 0" strokeLinecap="round" />
      </svg>
    );
  }

  if (href === "/workspace") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" strokeLinejoin="round" />
        <path d="M8 9h8M8 13h5" strokeLinecap="round" />
      </svg>
    );
  }

  if (href === "/review") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 5.5h12v13H6z" strokeLinejoin="round" />
        <path d="M9 9.5h6M9 13.5h6" strokeLinecap="round" />
        <path d="m8.5 17 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 6h14M5 12h14M5 18h14" strokeLinecap="round" />
    </svg>
  );
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
                  <NavIcon href={item.href} active={active} />
                  <span>{item.label}</span>
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
