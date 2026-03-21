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
  onNavigate: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    pathname,
    railId,
    sidebarOpen,
    activeRole,
    tenantContext,
    onNavigate,
  },
  ref,
) {
  const tenantDisplayName =
    tenantContext.branding?.display_name || tenantContext.name;

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
      <div className="flex h-full flex-col overflow-hidden border-r border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-4 pb-5 pt-5 lg:pb-6">
        <div className="flex-1 overflow-y-auto px-2 pt-6">
          <SidebarNav
            pathname={pathname}
            activeRole={activeRole}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </aside>
  );
});
