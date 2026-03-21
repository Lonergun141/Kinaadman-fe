"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import { roleLabels } from "@/lib/roles";
import { formatDateTime, getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

function ProfileCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[0.95rem] border border-[rgba(15,42,68,0.08)] bg-white shadow-[0_18px_32px_rgba(0,21,42,0.04)]">
      <header className="border-b border-[rgba(15,42,68,0.08)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-[1.4rem] leading-tight text-[color:var(--color-primary)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="px-5 py-2 sm:px-6">{children}</div>
    </section>
  );
}

function DetailList({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="divide-y divide-[rgba(15,42,68,0.08)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 py-3.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-4"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
            {row.label}
          </dt>
          <dd className="text-sm leading-6 text-[color:var(--color-foreground)] break-all">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PolicyBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-[0.75rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(247,249,251,0.92)] px-4 py-3">
      <span className="text-sm text-[color:var(--color-foreground)]">{label}</span>
      <span
        className={
          active
            ? "rounded-full bg-[rgba(201,162,39,0.14)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]"
            : "rounded-full bg-[rgba(15,42,68,0.06)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]"
        }
      >
        {active ? "Enabled" : "Off"}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const membershipsQuery = useTenantMembershipsQuery(activeTenantId);

  const currentMembership = useMemo(
    () =>
      membershipsQuery.data?.find(
        (membership) =>
          membership.user.email.toLowerCase() === sessionUser?.email.toLowerCase(),
      ) || null,
    [membershipsQuery.data, sessionUser?.email],
  );

  if (!sessionUser || !tenantContext) {
    return null;
  }

  const tenantDisplayName =
    tenantContext.branding?.display_name || tenantContext.name;
  const sessionName = getDisplayNameFromEmail(sessionUser.email);
  const initials = sessionName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Account overview"
        description="Your archive access, role, and account settings in one place."
      />

      <section className="rounded-[1rem] border border-[rgba(15,42,68,0.08)] bg-white shadow-[0_20px_38px_rgba(0,21,42,0.05)]">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[rgba(15,42,68,0.08)] font-serif text-[1.35rem] text-[color:var(--color-primary)]">
              {initials || "U"}
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="font-serif text-[1.85rem] leading-none text-[color:var(--color-primary)]">
                  {sessionName}
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  {sessionUser.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="pill-outline">{roleLabels[activeRole]}</span>
                <span className="pill-outline">{tenantDisplayName}</span>
                <span className="pill-outline">
                  {tenantContext.policy?.campus_only ? "Campus only" : "Open access"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(247,249,251,0.9)] px-4 py-3">
              <p className="muted-label">Membership</p>
              <p className="mt-2 text-sm text-[color:var(--color-foreground)]">
                {currentMembership?.status || "Unavailable"}
              </p>
            </div>
            <div className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(247,249,251,0.9)] px-4 py-3">
              <p className="muted-label">Joined</p>
              <p className="mt-2 text-sm text-[color:var(--color-foreground)]">
                {currentMembership
                  ? formatDateTime(currentMembership.created_at)
                  : "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {membershipsQuery.error ? (
        <EmptyState
          title="Membership data unavailable"
          description={membershipsQuery.error.message}
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <ProfileCard
            title="Account details"
            description="Basic information tied to your signed-in archive account."
          >
            <DetailList
              rows={[
                { label: "Display name", value: sessionName },
                { label: "Email", value: sessionUser.email },
                { label: "Role", value: roleLabels[activeRole] },
                { label: "User ID", value: sessionUser.id },
              ]}
            />
          </ProfileCard>

        </div>

        <div className="space-y-5">
          <ProfileCard
            title="Security settings"
            description="Policies that affect sign-in and access protection."
          >
            <DetailList
              rows={[
                {
                  label: "Email domain enforcement",
                  value: tenantContext.policy?.enforce_email_domains
                    ? "Enabled"
                    : "Disabled",
                },
                {
                  label: "Trusted devices",
                  value: tenantContext.policy?.allow_remember_device
                    ? "Allowed"
                    : "Disabled",
                },
                {
                  label: "Max login attempts",
                  value: String(tenantContext.policy?.max_login_attempts || 0),
                },
                {
                  label: "Lockout period",
                  value: `${tenantContext.policy?.lockout_minutes || 0} minutes`,
                },
              ]}
            />
          </ProfileCard>
        </div>
      </section>
    </div>
  );
}
