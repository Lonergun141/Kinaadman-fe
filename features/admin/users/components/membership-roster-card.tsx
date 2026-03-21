"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { roleLabels } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import type { AppRole } from "@/stores/workspace-store";
import type { TenantMembership } from "@/types/domain";
import { inviteRoles } from "../utils";

const membershipStatuses = ["ACTIVE", "SUSPENDED"] as const;

interface MembershipRosterCardProps {
  memberships: TenantMembership[];
  errorMessage?: string;
  isSaving: boolean;
  savingMembershipId?: string;
  onSaveMembership: (payload: {
    membershipId: string;
    role: string;
    status: string;
  }) => void;
}

export function MembershipRosterCard({
  memberships,
  errorMessage,
  isSaving,
  savingMembershipId,
  onSaveMembership,
}: MembershipRosterCardProps) {
  const [drafts, setDrafts] = useState<Record<string, { role: string; status: string }>>(
    {},
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        memberships.map((member) => [
          member.id,
          {
            role: member.role,
            status: member.status,
          },
        ]),
      ),
    );
  }, [memberships]);

  const pendingMembershipId = isSaving ? savingMembershipId || "" : "";
  const changedMemberships = useMemo(
    () =>
      new Set(
        memberships
          .filter((member) => {
            const draft = drafts[member.id];
            return draft && (draft.role !== member.role || draft.status !== member.status);
          })
          .map((member) => member.id),
      ),
    [drafts, memberships],
  );

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
                <th className="px-4 py-3 text-right">Action</th>
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
                  <td className="px-4 py-3">
                    <select
                      className="input-base h-10 min-w-[160px] py-2 pr-9"
                      value={drafts[member.id]?.role || member.role}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [member.id]: {
                            role: event.target.value,
                            status: current[member.id]?.status || member.status,
                          },
                        }))
                      }
                    >
                      {inviteRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role] || role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input-base h-10 min-w-[140px] py-2 pr-9"
                      value={drafts[member.id]?.status || member.status}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [member.id]: {
                            role: current[member.id]?.role || member.role,
                            status: event.target.value,
                          },
                        }))
                      }
                    >
                      {membershipStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-muted px-4 py-3">
                    {formatDateTime(member.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        pendingMembershipId === member.id || !changedMemberships.has(member.id)
                      }
                      onClick={() =>
                        onSaveMembership({
                          membershipId: member.id,
                          role: drafts[member.id]?.role || member.role,
                          status: drafts[member.id]?.status || member.status,
                        })
                      }
                    >
                      {pendingMembershipId === member.id ? "Saving..." : "Save"}
                    </Button>
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
