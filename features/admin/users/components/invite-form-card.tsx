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
  embedded?: boolean;
}

function InviteFormContent({
  email,
  role,
  errorMessage,
  isPending,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: InviteFormCardProps) {
  return (
    <div className="space-y-4">
      <TextInput
        label="Campus email"
        hint="Send access to the email that should receive the invitation link."
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
        <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
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
  );
}

export function InviteFormCard({
  embedded = false,
  ...props
}: InviteFormCardProps) {
  if (embedded) {
    return <InviteFormContent embedded={embedded} {...props} />;
  }

  return (
    <SurfaceCard eyebrow="Invite form" title="Send invitation">
      <InviteFormContent embedded={embedded} {...props} />
    </SurfaceCard>
  );
}
