"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { roleLabels } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { InvitationRecord } from "@/types/domain";
import { getInviteStatus } from "../utils";

interface RecentInvitesCardProps {
  invites: InvitationRecord[];
  errorMessage?: string;
}

export function RecentInvitesCard({
  invites,
  errorMessage,
}: RecentInvitesCardProps) {
  const [copiedInviteId, setCopiedInviteId] = useState("");

  async function handleCopy(invite: InvitationRecord) {
    if (!invite.accept_url) {
      return;
    }

    await navigator.clipboard.writeText(invite.accept_url);
    setCopiedInviteId(invite.id);
    window.setTimeout(() => setCopiedInviteId(""), 1600);
  }

  return (
    <SurfaceCard eyebrow="Recent responses" title="Created invites">
      {errorMessage ? (
        <EmptyState title="Invite history unavailable" description={errorMessage} />
      ) : invites.length ? (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div key={invite.id} className="card-item">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {invite.email}
                  </p>
                  <p className="text-muted mt-0.5 text-xs">
                    {roleLabels[invite.role as AppRole] || invite.role}
                  </p>
                </div>
                <span className="badge-base bg-slate-100 text-slate-700">
                  {getInviteStatus(invite)}
                </span>
              </div>
              <p className="muted-label mt-3">
                Created {formatDateTime(invite.created_at)}
              </p>
              <p className="muted-label mt-1">
                Expires {formatDateTime(invite.expires_at)}
              </p>
              {invite.accept_url ? (
                <div className="mt-3 space-y-2">
                  <p className="text-primary-label">Accept URL</p>
                  <p className="rounded-[0.65rem] bg-[rgba(247,249,251,0.92)] px-3 py-3 text-xs leading-6 text-[color:var(--color-muted-foreground)] break-all">
                    {invite.accept_url}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => void handleCopy(invite)}>
                    {copiedInviteId === invite.id ? "Copied" : "Copy link"}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No invites yet"
          description="Invitations created for this archive will appear here so you can track pending onboarding."
        />
      )}
    </SurfaceCard>
  );
}
