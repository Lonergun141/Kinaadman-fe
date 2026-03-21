"use client";

import { requestJson } from "@/lib/api/client";
import type { TenantContextDto } from "@/types/api";
import { mapTenantContext } from "./helpers";

export async function bootstrapTenant(tenantId: string) {
  const payload = await requestJson<TenantContextDto>("/tenants/bootstrap", {
    tenantId,
    auth: false,
  });

  return mapTenantContext(payload);
}

export async function listSupervisedTenants() {
  const payload = await requestJson<TenantContextDto[]>("/tenants");
  return payload.map(mapTenantContext);
}
