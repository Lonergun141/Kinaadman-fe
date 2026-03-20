"use client";

import { clearClientSession, mapTokens, requestJson } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { LoginResponseDto, TenantMembershipDto } from "@/types/api";
import type { SessionUser } from "@/types/domain";
import { resolveMembership } from "./helpers";
import { bootstrapTenant } from "./tenant";

export async function listMemberships(tenantId: string) {
  return requestJson<TenantMembershipDto[]>("/users/memberships", {
    tenantId,
    auth: false,
    allowRefresh: false,
  });
}

export async function loginWithBackend(payload: {
  email: string;
  password: string;
  tenantId: string;
}) {
  try {
    const loginResponse = await requestJson<LoginResponseDto>("/auth/login", {
      method: "POST",
      auth: false,
      tenantId: payload.tenantId,
      body: {
        email: payload.email,
        password: payload.password,
        tenant_hint: payload.tenantId,
      },
      allowRefresh: false,
    });

    const tokens = mapTokens(loginResponse.tokens);
    const [tenantContext, memberships] = await Promise.all([
      bootstrapTenant(payload.tenantId),
      listMemberships(payload.tenantId),
    ]);

    const membership = resolveMembership(memberships, loginResponse.user.email);
    const sessionUser: SessionUser = {
      id: loginResponse.user.id,
      email: loginResponse.user.email,
      role: membership.role,
      membershipId: membership.membershipId,
    };

    useAuthStore.getState().setSession({
      tokens,
      sessionUser,
      tenantId: payload.tenantId,
    });
    useTenantStore.getState().setTenantContext(tenantContext);
    useWorkspaceStore.getState().setActiveRole(membership.role);
    useWorkspaceStore.getState().setActiveTenantId(payload.tenantId);

    return {
      sessionUser,
      tenantContext,
    };
  } catch (error) {
    clearClientSession();
    throw error;
  }
}

export async function logoutFromBackend() {
  const refreshToken = useAuthStore.getState().tokens?.refreshToken;

  if (refreshToken) {
    try {
      await requestJson("/auth/logout", {
        method: "POST",
        body: {
          refresh_token: refreshToken,
        },
        allowRefresh: false,
      });
    } catch {
      // Ignore logout failures and clear the client session anyway.
    }
  }

  clearClientSession();
  useWorkspaceStore.getState().setActiveTenantId("");
  useWorkspaceStore.getState().setActiveRole("STUDENT");
}
