"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { TabPanels } from "@/components/ui/tab-panels";
import {
  listInvitations,
  sendInvitation,
  updateTenantMembership,
} from "@/features/admin/api";
import { useTenantMembershipsQuery } from "@/features/admin/hooks/use-tenant-memberships-query";
import {
  invalidateInvitationsQuery,
  invalidateMembershipsQuery,
} from "@/lib/query/invalidation";
import { queryKeys } from "@/lib/query-keys";
import { useWorkspaceStore, type AppRole } from "@/stores/workspace-store";
import { InviteFormCard } from "./components/invite-form-card";
import { MembershipRosterCard } from "./components/membership-roster-card";
import { RecentInvitesCard } from "./components/recent-invites-card";
import {
  getInviteStatus,
  getUserManagementStats,
  mergeInvites,
  type SessionInvite,
} from "./utils";

export function AdminUsersPageView() {
  const queryClient = useQueryClient();
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const membershipsQuery = useTenantMembershipsQuery(activeTenantId);
  const invitesQuery = useQuery({
    queryKey: queryKeys.users.invites(activeTenantId),
    queryFn: () => listInvitations(activeTenantId),
    enabled: Boolean(activeTenantId),
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("STUDENT");
  const [sentInvites, setSentInvites] = useState<SessionInvite[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState("roster");

  const inviteMutation = useMutation({
    mutationFn: sendInvitation,
    onSuccess: async (invite) => {
      setSentInvites((current) => [invite, ...current].slice(0, 5));
      setEmail("");
      setActiveTabId("invites");
      setInviteModalOpen(false);
      await invalidateInvitationsQuery(queryClient, activeTenantId);
    },
  });

  const membershipMutation = useMutation({
    mutationFn: updateTenantMembership,
    onSuccess: async () => {
      await invalidateMembershipsQuery(queryClient, activeTenantId);
    },
  });

  const members = membershipsQuery.data ?? [];
  const invites = useMemo(
    () => mergeInvites(invitesQuery.data ?? [], sentInvites),
    [invitesQuery.data, sentInvites],
  );
  const { activeCount, roleCount } = getUserManagementStats(members);
  const pendingInviteCount = invites.filter((invite) => getInviteStatus(invite) === "Pending").length;

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Archive administration"
        description="Manage who belongs in this archive, which roles are represented, and who should receive access next."
      >
        <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(true)}>
          Send invitation
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active users"
          value={String(activeCount)}
          detail="People who currently have access."
        />
        <StatCard
          label="Roles represented"
          value={String(roleCount)}
          detail="Different roles currently represented in this archive."
          tone="secondary"
        />
        <StatCard
          label="Pending invites"
          value={String(pendingInviteCount)}
          detail="Outstanding invitations that still need to be accepted."
        />
        <StatCard
          label="Archive access"
          value={activeTenantId ? "Resolved" : "Missing"}
          detail="People and invitations are managed within the archive you currently have open."
          tone="neutral"
        />
      </section>

      <TabPanels
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
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
                isSaving={membershipMutation.isPending}
                savingMembershipId={membershipMutation.variables?.membershipId}
                onSaveMembership={({ membershipId, role, status }) =>
                  membershipMutation.mutate({
                    tenantId: activeTenantId,
                    membershipId,
                    role,
                    status,
                  })
                }
              />
            ),
          },
          {
            id: "invites",
            label: "Recent invites",
            description:
              "Recently created invitations stay close at hand without taking over the main page.",
            content: (
              <RecentInvitesCard
                invites={invites}
                errorMessage={invitesQuery.error?.message}
              />
            ),
          },
        ]}
      />

      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        eyebrow="Invite form"
        title="Send campus invitation"
        description="Invite a new person without interrupting the main roster view."
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
