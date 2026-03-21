"use client";

import { clearClientSession, mapTokens, requestJson } from "@/lib/api/client";
import { isAppRole } from "@/lib/access";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { LoginResponseDto, TenantMembershipDto } from "@/types/api";
import type { SessionUser } from "@/types/domain";
import { bootstrapTenant } from "./tenant";

export async function listMemberships(tenantId: string) {
  return requestJson<TenantMembershipDto[]>("/users/memberships", {
    tenantId,
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
    const tenantContext = await bootstrapTenant(payload.tenantId);
    if (!isAppRole(loginResponse.user.role)) {
      throw new Error("No supported tenant membership was found for this account.");
    }
    const sessionUser: SessionUser = {
      id: loginResponse.user.id,
      email: loginResponse.user.email,
      role: loginResponse.user.role,
      membershipId: loginResponse.user.membership_id,
      isSuperAdmin: loginResponse.user.is_super_admin,
    };

    useAuthStore.getState().setSession({
      tokens,
      sessionUser,
      tenantId: payload.tenantId,
    });
    useTenantStore.getState().setTenantContext(tenantContext);
    useWorkspaceStore.getState().setActiveRole(loginResponse.user.role);
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
