"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { SessionUser, TenantContext } from "@/types/domain";

interface TopBarProps {
  railId: string;
  sidebarOpen: boolean;
  tenantContext: TenantContext;
  activeRole: AppRole;
  sessionUser: SessionUser;
  onOpenNavigation: () => void;
  onSignOut: () => void;
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
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

export function TopBar({
  railId,
  sidebarOpen,
  activeRole,
  sessionUser,
  onOpenNavigation,
  onSignOut,
}: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const sessionName = getDisplayNameFromEmail(sessionUser.email);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)]">
      <div className="relative flex h-[52px] w-full items-center justify-between px-4">
        <div className="flex w-12 items-center justify-start">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-primary)] lg:hidden"
            aria-controls={railId}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={onOpenNavigation}
          >
            <MenuIcon />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <Image
            src="/icon-light.png"
            alt="Kinaadman"
            width={28}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>

        <div className="relative flex w-12 items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-primary)]"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <MenuIcon />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] p-4 shadow-lg ring-1 ring-black/5">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={sessionName}
                    size="sm"
                    className="bg-[color:var(--color-surface-high)] text-[color:var(--color-primary)]"
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
                <div className="mt-4 rounded-[0.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-medium text-[color:var(--color-primary)]">
                    {roleLabels[activeRole]}
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full justify-center rounded-[0.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-3 py-2 text-sm font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-primary)]"
                  onClick={() => {
                    setProfileOpen(false);
                    onSignOut();
                  }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
