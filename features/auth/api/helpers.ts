"use client";

import { isAppRole } from "@/lib/access";
import type { AppRole } from "@/stores/workspace-store";
import type { TenantContextDto, TenantMembershipDto } from "@/types/api";
import type { TenantContext } from "@/types/domain";

export function mapTenantContext(payload: TenantContextDto): TenantContext {
  return {
    id: payload.id,
    slug: payload.slug,
    name: payload.name,
    is_active: payload.is_active,
    branding: payload.branding,
    policy: payload.policy,
  };
}

export function resolveMembership(
  memberships: TenantMembershipDto[],
  email: string,
): { role: AppRole; membershipId: string | null } {
  const membership = memberships.find(
    (item) => item.user.email.toLowerCase() === email.toLowerCase(),
  );

  if (!membership || !isAppRole(membership.role)) {
    throw new Error("No supported tenant membership was found for this account.");
  }

  return {
    role: membership.role,
    membershipId: membership.id,
  };
}
