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
  "id" | "email" | "role" | "expires_at"
>;
