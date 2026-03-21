"use client";

import { requestJson } from "@/lib/api/client";
import type { AuditLogDto } from "@/types/api";
import type { AuditLogEntry } from "@/types/domain";

export async function listAuditLog(tenantId: string) {
  const response = await requestJson<AuditLogDto[]>("/core/audit", {
    tenantId,
  });

  return response as AuditLogEntry[];
}
