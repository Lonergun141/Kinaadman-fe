"use client";

import { requestJson } from "@/lib/api/client";
import type { InvitationDto, TenantMembershipDto } from "@/types/api";
import type { InvitationRecord, TenantMembership } from "@/types/domain";

export async function listTenantMemberships(tenantId: string) {
  const payload = await requestJson<TenantMembershipDto[]>("/users/memberships", {
    tenantId,
  });

  return payload as TenantMembership[];
}

export async function sendInvitation(payload: {
  tenantId: string;
  email: string;
  role: string;
}) {
  const response = await requestJson<InvitationDto>("/users/invites", {
    tenantId: payload.tenantId,
    method: "POST",
    body: {
      email: payload.email,
      role: payload.role,
    },
  });

  return response as InvitationRecord;
}
