"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useAuditLogQuery } from "@/features/admin/hooks/use-audit-log-query";
import { formatDateTime } from "@/lib/utils";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function AuditLogPageView() {
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const auditQuery = useAuditLogQuery(activeTenantId);

  const events = useMemo(() => auditQuery.data ?? [], [auditQuery.data]);
  const entityTypes = useMemo(
    () => new Set(events.map((event) => event.entity_type)).size,
    [events],
  );
  const latestTimestamp = events[0]?.created_at || null;
  const roleLabel =
    activeRole === "LIBRARIAN" ? "Librarian access" : "Administrative access";

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Audit log"
        description="Review the activity trail for repository decisions, publishing actions, and archive changes."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible events"
          value={String(events.length)}
          detail="Activity entries shown for this archive."
        />
        <StatCard
          label="Entity types"
          value={String(entityTypes)}
          detail="Distinct record types represented in the feed."
          tone="secondary"
        />
        <StatCard
          label="Latest event"
          value={latestTimestamp ? "Recorded" : "None"}
          detail={
            latestTimestamp ? formatDateTime(latestTimestamp) : "No audit entries yet."
          }
        />
        <StatCard
          label="Access"
          value={roleLabel}
          detail={
            tenantContext?.branding?.display_name ||
            tenantContext?.name ||
            "Tenant context unavailable."
          }
          tone="neutral"
        />
      </section>

      <SurfaceCard eyebrow="Activity feed" title="Recent audit events">
        {auditQuery.error ? (
          <EmptyState
            title="Audit feed unavailable"
            description={auditQuery.error.message}
          />
        ) : events.length ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="card-item">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {event.action}
                    </p>
                    <p className="text-muted text-xs">
                      {event.entity_type}
                      {event.entity_id ? ` | ${event.entity_id}` : ""}
                    </p>
                  </div>
                  <span className="badge-base bg-slate-100 text-slate-700">
                    Audit
                  </span>
                </div>
                <p className="muted-label mt-2">{formatDateTime(event.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No audit entries yet"
            description="No activity has been recorded for this archive yet."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
