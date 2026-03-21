"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/text-input";
import { bootstrapTenant, listSupervisedTenants } from "@/features/auth/api";
import { queryKeys } from "@/lib/query-keys";
import { roleLabels } from "@/lib/roles";
import { cx, getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
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

function ProfileMenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function SwitchClientIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h11l-2.5-2.5" />
      <path d="M17 17H6l2.5 2.5" />
      <path d="M18 7l-2.5-2.5" />
      <path d="M6 17l2.5 2.5" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5H6v14h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

export function TopBar({
  railId,
  sidebarOpen,
  tenantContext,
  activeRole,
  sessionUser,
  onOpenNavigation,
  onSignOut,
}: TopBarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [switchingTenantId, setSwitchingTenantId] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const sessionName = getDisplayNameFromEmail(sessionUser.email);
  const deferredClientSearch = useDeferredValue(clientSearch);
  const setTenantId = useAuthStore((state) => state.setTenantId);
  const setTenantContext = useTenantStore((state) => state.setTenantContext);
  const setActiveTenantId = useWorkspaceStore((state) => state.setActiveTenantId);
  const isSuperAdmin = activeRole === "SUPER_ADMIN" || sessionUser.isSuperAdmin;
  const currentClientLabel = tenantContext.branding?.display_name || tenantContext.name;
  const clientsQuery = useQuery({
    queryKey: queryKeys.tenant.supervisionList,
    queryFn: listSupervisedTenants,
    enabled: isSuperAdmin,
  });
  const filteredClients = useMemo(() => {
    const normalizedSearch = deferredClientSearch.trim().toLowerCase();
    const clients = clientsQuery.data ?? [];

    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) => {
      const displayName = client.branding?.display_name || client.name;
      return [displayName, client.name, client.slug]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [clientsQuery.data, deferredClientSearch]);

  function closeClientPicker() {
    setClientPickerOpen(false);
    setClientSearch("");
    setSwitchError(null);
  }

  async function handleSwitchClient(nextTenant: TenantContext) {
    if (nextTenant.id === tenantContext.id) {
      closeClientPicker();
      return;
    }

    setSwitchError(null);
    setSwitchingTenantId(nextTenant.id);

    try {
      const nextContext = await bootstrapTenant(nextTenant.id);
      setTenantId(nextTenant.id);
      setTenantContext(nextContext);
      setActiveTenantId(nextTenant.id);
      closeClientPicker();
      router.refresh();
    } catch (error) {
      setSwitchError(
        error instanceof Error ? error.message : "Unable to switch to the selected client.",
      );
    } finally {
      setSwitchingTenantId(null);
    }
  }

  return (
    <>
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
              <ProfileMenuIcon />
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
                      Client
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-[color:var(--color-primary)]">
                      {currentClientLabel}
                    </p>
                    <p className="mt-1 truncate text-xs leading-5 text-[color:var(--color-muted)]">
                      {tenantContext.slug}
                    </p>
                  </div>
                  <div className="mt-3 rounded-[0.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-medium text-[color:var(--color-primary)]">
                      {roleLabels[activeRole]}
                    </p>
                  </div>
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[0.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-3 py-2 text-sm font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-primary)]"
                      onClick={() => {
                        setProfileOpen(false);
                        setClientPickerOpen(true);
                        setSwitchError(null);
                      }}
                    >
                      <SwitchClientIcon />
                      Switch client
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[0.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-3 py-2 text-sm font-medium text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-primary)]"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                  >
                    <SignOutIcon />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <Modal
        open={clientPickerOpen}
        onClose={closeClientPicker}
        eyebrow="Super admin"
        title="Select a client"
        description="Enter a client workspace in supervision mode. The rest of the app will reload into that tenant's data."
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="ghost" onClick={closeClientPicker}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <TextInput
            label="Search clients"
            placeholder="Search by archive name or slug"
            value={clientSearch}
            onChange={(event) => setClientSearch(event.target.value)}
          />
          {switchError ? (
            <div className="rounded-[0.75rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
              {switchError}
            </div>
          ) : null}
          {clientsQuery.error ? (
            <div className="rounded-[0.75rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
              {clientsQuery.error.message}
            </div>
          ) : null}
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const displayName = client.branding?.display_name || client.name;
              const isCurrentClient = client.id === tenantContext.id;
              const isSwitching = switchingTenantId === client.id;

              return (
                <button
                  key={client.id}
                  type="button"
                  className={cx(
                    "w-full rounded-[0.95rem] border px-4 py-4 text-left transition-all",
                    isCurrentClient
                      ? "border-[color:var(--color-secondary)] bg-[rgba(201,162,39,0.08)]"
                      : "border-[rgba(15,42,68,0.08)] bg-white hover:border-[rgba(15,42,68,0.18)] hover:bg-[rgba(247,249,251,0.92)]",
                  )}
                  disabled={isCurrentClient || Boolean(switchingTenantId)}
                  onClick={() => void handleSwitchClient(client)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-[color:var(--color-primary)]">
                        {displayName}
                      </p>
                      <p className="truncate text-sm text-[color:var(--color-muted-foreground)]">
                        {client.name}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                        {client.slug}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                        isCurrentClient
                          ? "bg-[rgba(201,162,39,0.16)] text-[color:var(--color-secondary)]"
                          : "bg-[rgba(15,42,68,0.06)] text-[color:var(--color-muted)]",
                      )}
                    >
                      {isCurrentClient
                        ? "Current"
                        : isSwitching
                          ? "Entering"
                          : "Enter"}
                    </span>
                  </div>
                </button>
              );
            })}
            {!clientsQuery.isPending && !filteredClients.length ? (
              <div className="rounded-[0.95rem] border border-dashed border-[rgba(15,42,68,0.12)] bg-[rgba(247,249,251,0.72)] px-4 py-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
                No matching clients were found.
              </div>
            ) : null}
            {clientsQuery.isPending ? (
              <div className="rounded-[0.95rem] border border-dashed border-[rgba(15,42,68,0.12)] bg-[rgba(247,249,251,0.72)] px-4 py-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
                Loading supervised clients...
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
