"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { roleLabels } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { TenantMembership } from "@/types/domain";

interface MembershipRosterCardProps {
  memberships: TenantMembership[];
  errorMessage?: string;
}

export function MembershipRosterCard({
  memberships,
  errorMessage,
}: MembershipRosterCardProps) {
  return (
    <SurfaceCard eyebrow="Roster" title="Tenant memberships">
      {errorMessage ? (
        <EmptyState title="Roster unavailable" description={errorMessage} />
      ) : (
        <div className="table-shell">
          <table className="min-w-full text-sm">
            <thead className="bg-[color:var(--color-primary)] text-left text-[11px] uppercase tracking-[0.1em] text-white">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {memberships.map((member, index) => (
                <tr
                  key={member.id}
                  className={
                    index % 2 === 0
                      ? "bg-[color:var(--color-surface-lowest)]"
                      : "bg-[color:var(--color-surface)]"
                  }
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[color:var(--color-primary)]">
                      {member.user.email}
                    </p>
                    <p className="text-muted break-all text-xs">{member.id}</p>
                  </td>
                  <td className="text-muted px-4 py-3">
                    {roleLabels[member.role as AppRole] || member.role}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-base bg-slate-100 text-slate-700">
                      {member.status}
                    </span>
                  </td>
                  <td className="text-muted px-4 py-3">
                    {formatDateTime(member.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SurfaceCard>
  );
}
