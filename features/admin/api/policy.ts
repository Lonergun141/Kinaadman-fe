"use client";

import { requestJson } from "@/lib/api/client";
import type { TenantPolicyDto } from "@/types/api";
import type { TenantPolicy } from "@/types/domain";

export async function updatePolicy(payload: {
  tenantId: string;
  policy: TenantPolicy;
}) {
  const response = await requestJson<TenantPolicyDto>("/tenants/policy", {
    tenantId: payload.tenantId,
    method: "PUT",
    body: {
      campus_only: payload.policy.campus_only,
      invite_only: payload.policy.invite_only,
      enforce_email_domains: payload.policy.enforce_email_domains,
      enforce_ip_allowlist: payload.policy.enforce_ip_allowlist,
      max_login_attempts: payload.policy.max_login_attempts,
      lockout_minutes: payload.policy.lockout_minutes,
      otp_ttl_seconds: payload.policy.otp_ttl_seconds,
      access_token_ttl_seconds: payload.policy.access_token_ttl_seconds,
      refresh_token_ttl_seconds: payload.policy.refresh_token_ttl_seconds,
      require_2fa_email_otp: payload.policy.require_2fa_email_otp,
      allow_remember_device: payload.policy.allow_remember_device,
    },
  });

  return response as TenantPolicy;
}
