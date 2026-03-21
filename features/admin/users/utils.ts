import type { InvitationRecord, TenantMembership } from "@/types/domain";
import type { AppRole } from "@/stores/workspace-store";

export const inviteRoles: AppRole[] = [
  "STUDENT",
  "ADVISER",
  "LIBRARIAN",
  "TENANT_ADMIN",
];

export function getUserManagementStats(memberships: TenantMembership[]) {
  return {
    activeCount: memberships.filter((member) => member.status === "ACTIVE").length,
    roleCount: new Set(memberships.map((member) => member.role)).size,
  };
}

export type SessionInvite = Pick<
  InvitationRecord,
  "id" | "email" | "role" | "expires_at" | "created_at" | "accepted_at" | "accept_url"
>;

export function mergeInvites(
  storedInvites: InvitationRecord[],
  sessionInvites: SessionInvite[],
) {
  const invites = new Map<string, InvitationRecord>();

  storedInvites.forEach((invite) => {
    invites.set(invite.id, invite);
  });
  sessionInvites.forEach((invite) => {
    invites.set(invite.id, {
      ...invites.get(invite.id),
      ...invite,
    } as InvitationRecord);
  });

  return [...invites.values()].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

export function getInviteStatus(invite: Pick<InvitationRecord, "accepted_at" | "expires_at">) {
  if (invite.accepted_at) {
    return "Accepted";
  }

  return new Date(invite.expires_at).getTime() < Date.now() ? "Expired" : "Pending";
}
