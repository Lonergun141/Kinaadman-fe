"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { TabPanels } from "@/components/ui/tab-panels";
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
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: sendInvitation,
    onSuccess: (invite) => {
      setSentInvites((current) => [invite, ...current].slice(0, 5));
      setEmail("");
      setInviteModalOpen(false);
    },
  });

  const members = membershipsQuery.data ?? [];
  const { activeCount, roleCount } = getUserManagementStats(members);

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Tenant administration"
        title="Membership roster and campus invitations"
        description="Manage who belongs in the tenant, which roles are represented, and which new members should receive archive access next."
      >
        <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(true)}>
          Send invitation
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <TabPanels
        tabs={[
          {
            id: "roster",
            label: "Roster",
            description:
              "Membership management stays isolated in one view so the page body does not compete with invite tools.",
            content: (
              <MembershipRosterCard
                memberships={members}
                errorMessage={membershipsQuery.error?.message}
              />
            ),
          },
          {
            id: "invites",
            label: "Recent invites",
            description:
              "Session-local invite history is available on demand instead of occupying a second permanent column.",
            content: <RecentInvitesCard sentInvites={sentInvites} />,
          },
        ]}
      />

      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        eyebrow="Invite form"
        title="Send campus invitation"
        description="Create a new membership invitation without forcing the form into the main administration canvas."
      >
        <InviteFormCard
          embedded
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
      </Modal>
    </div>
  );
}
