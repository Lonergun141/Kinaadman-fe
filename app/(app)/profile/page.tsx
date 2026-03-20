"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import { roleLabels } from "@/lib/roles";
import { formatDateTime, getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

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

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Profile"
        title={sessionName}
        description="Account, membership, and tenant context sourced from the live backend session."
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill-outline">{roleLabels[activeRole]}</span>
          <span className="pill-outline">{tenantDisplayName}</span>
        </div>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active role"
          value={roleLabels[activeRole]}
          detail="Current role inferred from tenant membership."
        />
        <StatCard
          label="Tenant"
          value={tenantContext.slug.toUpperCase()}
          detail={tenantDisplayName}
          tone="secondary"
        />
        <StatCard
          label="Campus access"
          value={tenantContext.policy?.campus_only ? "Enabled" : "Open"}
          detail="Campus-only posture from tenant policy."
        />
        <StatCard
          label="Invite only"
          value={tenantContext.policy?.invite_only ? "Enabled" : "Disabled"}
          detail="Tenant onboarding posture."
          tone="neutral"
        />
      </section>

      {membershipsQuery.error ? (
        <EmptyState
          title="Membership data unavailable"
          description={membershipsQuery.error.message}
        />
      ) : null}

      <section className="grid gap-5 lg:grid-cols-3">
        <SurfaceCard eyebrow="Identity" title="Session profile">
          <dl className="space-y-3">
            {[
              { label: "Display name", value: sessionName },
              { label: "Email", value: sessionUser.email },
              { label: "Role", value: roleLabels[activeRole] },
              { label: "User ID", value: sessionUser.id },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-primary-label">{row.label}</dt>
                <dd className="text-muted mt-0.5 break-all">{row.value}</dd>
              </div>
            ))}
          </dl>
        </SurfaceCard>

        <SurfaceCard eyebrow="Membership" title="Tenant context">
          {currentMembership ? (
            <dl className="space-y-3">
              {[
                { label: "Membership ID", value: currentMembership.id },
                { label: "Status", value: currentMembership.status },
                {
                  label: "Granted at",
                  value: formatDateTime(currentMembership.created_at),
                },
                { label: "Tenant", value: tenantDisplayName },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-primary-label">{row.label}</dt>
                  <dd className="text-muted mt-0.5 break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <EmptyState
              title="Membership not resolved"
              description="The current backend login succeeded, but this user was not found in the tenant membership list."
            />
          )}
        </SurfaceCard>

        <SurfaceCard eyebrow="Security" title="Sign-in posture">
          <dl className="space-y-3">
            {[
              {
                label: "Enforce email domains",
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
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-primary-label">{row.label}</dt>
                <dd className="text-muted mt-0.5">{row.value}</dd>
              </div>
            ))}
          </dl>
        </SurfaceCard>
      </section>
    </div>
  );
}
