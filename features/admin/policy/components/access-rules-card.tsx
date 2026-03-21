"use client";

import { SelectField } from "@/components/ui/select-field";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { TenantPolicy } from "@/types/domain";
import { booleanValue } from "../utils";

interface AccessRulesCardProps {
  policy: TenantPolicy;
  onPolicyChange: (updates: Partial<TenantPolicy>) => void;
}

export function AccessRulesCard({
  policy,
  onPolicyChange,
}: AccessRulesCardProps) {
  return (
    <SurfaceCard eyebrow="Access rules" title="Membership gating">
      <div className="space-y-4">
        <SelectField
          label="Campus only"
          value={booleanValue(policy.campus_only)}
          onChange={(event) =>
            onPolicyChange({ campus_only: event.target.value === "true" })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </SelectField>
        <SelectField
          label="Invite only"
          value={booleanValue(policy.invite_only)}
          onChange={(event) =>
            onPolicyChange({ invite_only: event.target.value === "true" })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </SelectField>
        <SelectField
          label="Enforce email domains"
          value={booleanValue(policy.enforce_email_domains)}
          onChange={(event) =>
            onPolicyChange({
              enforce_email_domains: event.target.value === "true",
            })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </SelectField>
        <SelectField
          label="Enforce IP allowlist"
          value={booleanValue(policy.enforce_ip_allowlist)}
          onChange={(event) =>
            onPolicyChange({
              enforce_ip_allowlist: event.target.value === "true",
            })
          }
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </SelectField>
      </div>
    </SurfaceCard>
  );
}
