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

export async function updateTenantMembership(payload: {
  tenantId: string;
  membershipId: string;
  role?: string;
  status?: string;
}) {
  const response = await requestJson<TenantMembershipDto>(
    `/users/memberships/${payload.membershipId}`,
    {
      tenantId: payload.tenantId,
      method: "PATCH",
      body: {
        role: payload.role,
        status: payload.status,
      },
    },
  );

  return response as TenantMembership;
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

export async function listInvitations(tenantId: string) {
  const payload = await requestJson<InvitationDto[]>("/users/invites", {
    tenantId,
  });

  return payload as InvitationRecord[];
}
