"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { sendInvitation } from "@/features/admin/api";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import { useWorkspaceStore, type AppRole } from "@/stores/workspace-store";
import { InviteFormCard } from "./components/invite-form-card";
import { MembershipRosterCard } from "./components/membership-roster-card";
import { RecentInvitesCard } from "./components/recent-invites-card";
import { getUserManagementStats, type SessionInvite } from "./utils";

export function AdminUsersPageView() {
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const membershipsQuery = useTenantMembershipsQuery(activeTenantId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("STUDENT");
  const [sentInvites, setSentInvites] = useState<SessionInvite[]>([]);

  const inviteMutation = useMutation({
    mutationFn: sendInvitation,
    onSuccess: (invite) => {
      setSentInvites((current) => [invite, ...current].slice(0, 5));
      setEmail("");
    },
  });

  const members = membershipsQuery.data ?? [];
  const { activeCount, roleCount } = getUserManagementStats(members);

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Tenant administration"
        title="Membership roster and invitations"
        description="The current backend supports listing tenant memberships and sending invite links. It does not expose an invitation listing endpoint or the raw acceptance token."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active users"
          value={String(activeCount)}
          detail="Current active memberships."
        />
        <StatCard
          label="Roles represented"
          value={String(roleCount)}
          detail="Distinct membership roles inside the tenant."
          tone="secondary"
        />
        <StatCard
          label="Session invites"
          value={String(sentInvites.length)}
          detail="Invites successfully created during this browser session."
        />
        <StatCard
          label="Tenant scope"
          value={activeTenantId ? "Resolved" : "Missing"}
          detail="All roster actions are scoped by the active tenant header."
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <MembershipRosterCard
          memberships={members}
          errorMessage={membershipsQuery.error?.message}
        />

        <div className="space-y-5">
          <InviteFormCard
            email={email}
            role={role}
            errorMessage={inviteMutation.error?.message}
            isPending={inviteMutation.isPending}
            onEmailChange={setEmail}
            onRoleChange={setRole}
            onSubmit={() =>
              inviteMutation.mutate({
                tenantId: activeTenantId,
                email,
                role,
              })
            }
          />
          <RecentInvitesCard sentInvites={sentInvites} />
        </div>
      </section>
    </div>
  );
}
