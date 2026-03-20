"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail, cx } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { SessionUser, TenantContext } from "@/types/domain";
import { navigation } from "./navigation";

interface TopBarProps {
  railId: string;
  pathname: string;
  sidebarOpen: boolean;
  tenantContext: TenantContext;
  activeRole: AppRole;
  sessionUser: SessionUser;
  onOpenNavigation: () => void;
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

const navPriority: Record<string, number> = {
  "/repository": 0,
  "/workspace": 1,
  "/review": 2,
  "/admin/users": 3,
  "/admin/branding": 4,
  "/admin/policy": 5,
  "/admin/audit": 6,
  "/profile": 7,
};

export function TopBar({
  railId,
  pathname,
  sidebarOpen,
  tenantContext,
  activeRole,
  sessionUser,
  onOpenNavigation,
}: TopBarProps) {
  const visibleNav = navigation
    .filter((item) => item.roles.includes(activeRole))
    .sort((a, b) => (navPriority[a.href] ?? 99) - (navPriority[b.href] ?? 99))
    .slice(0, 4);
  const tenantDisplayName =
    tenantContext.branding?.display_name || tenantContext.name;
  const sessionName = getDisplayNameFromEmail(sessionUser.email);

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-10">
      <div className="glass-bar flex min-h-[88px] items-center justify-between gap-6 rounded-b-[1.25rem] px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[rgba(15,42,68,0.05)] p-2 text-[color:var(--color-primary)] transition-colors hover:bg-[rgba(15,42,68,0.09)] lg:hidden"
            aria-controls={railId}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={onOpenNavigation}
          >
            <MenuIcon />
          </button>

          <div className="min-w-0 shrink-0">
            <p className="font-serif text-[1.9rem] italic leading-none text-[color:var(--color-primary)]">
              {tenantDisplayName}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
              Institutional Repository
            </p>
          </div>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Section navigation">
            {visibleNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/repository" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "pb-1 text-sm font-medium transition-colors duration-200",
                    active
                      ? "border-b-2 border-[color:var(--color-secondary)] text-[color:var(--color-secondary)]"
                      : "text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 rounded-full bg-[rgba(15,42,68,0.04)] px-4 py-2 md:flex">
            <span className="badge-base bg-[rgba(201,162,39,0.14)] text-[color:var(--color-primary)]">
              {tenantContext.policy?.campus_only ? "Campus only" : "Tenant access"}
            </span>
            <span className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
              {roleLabels[activeRole]}
            </span>
          </div>

          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold text-[color:var(--color-primary)]">
              {sessionName}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
              {roleLabels[activeRole]}
            </p>
          </div>

          <Avatar
            name={sessionName}
            size="md"
            className="bg-[color:var(--color-primary-container)]"
          />
        </div>
      </div>
    </header>
  );
}
