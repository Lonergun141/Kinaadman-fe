"use client";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import { roleLabels } from "@/lib/roles";
import type { AppRole } from "@/stores/workspace-store";
import { inviteRoles } from "../utils";

interface InviteFormCardProps {
  email: string;
  role: AppRole;
  errorMessage?: string;
  isPending: boolean;
  onEmailChange: (value: string) => void;
  onRoleChange: (role: AppRole) => void;
  onSubmit: () => void;
}

export function InviteFormCard({
  email,
  role,
  errorMessage,
  isPending,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: InviteFormCardProps) {
  return (
    <SurfaceCard eyebrow="Invite form" title="Send invitation">
      <div className="space-y-3">
        <TextInput
          label="Email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        <SelectField
          label="Role"
          value={role}
          onChange={(event) => onRoleChange(event.target.value as AppRole)}
        >
          {inviteRoles.map((value) => (
            <option key={value} value={value}>
              {roleLabels[value]}
            </option>
          ))}
        </SelectField>
        {errorMessage ? (
          <div className="rounded-lg bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
            {errorMessage}
          </div>
        ) : null}
        <Button
          fullWidth
          onClick={onSubmit}
          disabled={isPending || !email.trim()}
        >
          {isPending ? "Sending..." : "Send campus invite"}
        </Button>
      </div>
    </SurfaceCard>
  );
}
