"use client";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import type { TenantPolicy } from "@/types/domain";
import { booleanValue } from "../utils";

interface SecuritySettingsCardProps {
  policy: TenantPolicy;
  isPending: boolean;
  onPolicyChange: (updates: Partial<TenantPolicy>) => void;
  onSave: () => void;
}

export function SecuritySettingsCard({
  policy,
  isPending,
  onPolicyChange,
  onSave,
}: SecuritySettingsCardProps) {
  return (
    <SurfaceCard eyebrow="Security" title="Session and lockout">
      <div className="space-y-4">
        <SelectField
          label="Require OTP"
          value={booleanValue(policy.require_2fa_email_otp)}
          onChange={(event) =>
            onPolicyChange({
              require_2fa_email_otp: event.target.value === "true",
            })
          }
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </SelectField>
        <TextInput
          label="Max login attempts"
          value={String(policy.max_login_attempts)}
          onChange={(event) =>
            onPolicyChange({
              max_login_attempts: Number(event.target.value) || 0,
            })
          }
        />
        <TextInput
          label="Lockout minutes"
          value={String(policy.lockout_minutes)}
          onChange={(event) =>
            onPolicyChange({
              lockout_minutes: Number(event.target.value) || 0,
            })
          }
        />
        <TextInput
          label="Access token TTL (seconds)"
          value={String(policy.access_token_ttl_seconds)}
          onChange={(event) =>
            onPolicyChange({
              access_token_ttl_seconds: Number(event.target.value) || 0,
            })
          }
        />
        <TextInput
          label="Refresh token TTL (seconds)"
          value={String(policy.refresh_token_ttl_seconds)}
          onChange={(event) =>
            onPolicyChange({
              refresh_token_ttl_seconds: Number(event.target.value) || 0,
            })
          }
        />
        <Button onClick={onSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save policy"}
        </Button>
      </div>
    </SurfaceCard>
  );
}
