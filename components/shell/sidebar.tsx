"use client";

import { forwardRef } from "react";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail, cx } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { SessionUser, TenantContext } from "@/types/domain";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { SidebarNav } from "./sidebar-nav";

interface SidebarProps {
  pathname: string;
  railId: string;
  sidebarOpen: boolean;
  activeRole: AppRole;
  tenantContext: TenantContext;
  sessionUser: SessionUser;
  onNavigate: () => void;
  onSignOut: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    pathname,
    railId,
    sidebarOpen,
    activeRole,
    tenantContext,
    sessionUser,
    onNavigate,
    onSignOut,
  },
  ref,
) {
  const tenantDisplayName =
    tenantContext.branding?.display_name || tenantContext.name;
  const sessionName = getDisplayNameFromEmail(sessionUser.email);

  return (
    <aside
      ref={ref}
      id={railId}
      aria-label="Primary navigation"
      className={cx(
        "fixed inset-y-0 left-0 z-50 w-[min(88vw,288px)] transition duration-200 lg:static lg:h-full lg:min-h-0 lg:w-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex h-full flex-col overflow-hidden bg-[color:var(--color-surface-lowest)] shadow-[16px_0_40px_rgba(0,21,42,0.06)]">
        <div className="px-4 pb-4 pt-5">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] p-4 shadow-[0_1px_2px_rgba(15,42,68,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Current tenant
            </p>
            <h2 className="mt-3 font-serif text-[1.45rem] leading-tight text-[color:var(--color-primary)]">
              {tenantDisplayName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {tenantContext.slug.toUpperCase()} archive context
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav
            pathname={pathname}
            activeRole={activeRole}
            onNavigate={onNavigate}
          />
        </div>

        <div className="px-4 pb-4 pt-3">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-4 py-4 shadow-[0_1px_2px_rgba(15,42,68,0.05)]">
            <div className="flex items-center gap-3">
              <Avatar
                name={sessionName}
                size="sm"
                className="bg-[color:var(--color-primary-container)] text-white"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[color:var(--color-primary)]">
                  {sessionName}
                </p>
                <p className="truncate text-xs leading-5 text-[color:var(--color-muted)]">
                  {sessionUser.email}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                Role
              </p>
              <p className="mt-1 text-sm font-medium text-[color:var(--color-primary)]">
                {roleLabels[activeRole]}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full justify-center"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
});
