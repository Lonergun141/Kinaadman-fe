"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { roleLabels } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { SessionInvite } from "../utils";

interface RecentInvitesCardProps {
  sentInvites: SessionInvite[];
}

export function RecentInvitesCard({ sentInvites }: RecentInvitesCardProps) {
  return (
    <SurfaceCard eyebrow="Recent responses" title="Created invites">
      {sentInvites.length ? (
        <div className="space-y-3">
          {sentInvites.map((invite) => (
            <div key={invite.id} className="card-item">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                {invite.email}
              </p>
              <p className="text-muted mt-0.5 text-xs">
                {roleLabels[invite.role as AppRole] || invite.role}
              </p>
              <p className="muted-label mt-2">
                Expires {formatDateTime(invite.expires_at)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No invites yet"
          description="Sent invitations will appear here for this browser session. The backend does not expose a full invitation roster."
        />
      )}
    </SurfaceCard>
  );
}
