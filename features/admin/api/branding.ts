"use client";

import { requestJson } from "@/lib/api/client";
import type { TenantBrandingDto } from "@/types/api";
import type { TenantBranding } from "@/types/domain";

export async function updateBranding(payload: {
  tenantId: string;
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string | null;
  themeTokens?: Record<string, unknown>;
}) {
  const body: Record<string, unknown> = {
    display_name: payload.displayName,
  };

  if (payload.logoUrl && payload.logoUrl.trim()) {
    body.logo_url = payload.logoUrl.trim();
  }

  if (payload.primaryColor && payload.primaryColor.trim()) {
    body.primary_color = payload.primaryColor.trim();
  }

  if (payload.secondaryColor && payload.secondaryColor.trim()) {
    body.secondary_color = payload.secondaryColor.trim();
  }

  if (payload.themeTokens) {
    body.theme_tokens = payload.themeTokens;
  }

  const response = await requestJson<TenantBrandingDto>("/tenants/branding", {
    tenantId: payload.tenantId,
    method: "PUT",
    body,
  });

  return response as TenantBranding;
}
