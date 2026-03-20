"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { SubmissionChecklistCard } from "./components/submission-checklist-card";
import { WorkspaceEditor } from "./components/workspace-editor";
import { WorkspaceQueueCard } from "./components/workspace-queue-card";
import { WorkspaceTimelineCard } from "./components/workspace-timeline-card";
import { useWorkspaceData } from "./hooks/use-workspace-data";
import { getWorkspaceStats } from "./utils";

export function WorkspacePageView() {
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const [selectedId, setSelectedId] = useState("");

  const {
    thesesQuery,
    departmentsQuery,
    programsQuery,
    workspaceTheses,
    adviserOptions,
    currentMembership,
    resolvedSelectedId,
    selectedThesisQuery,
  } = useWorkspaceData({
    tenantId: activeTenantId,
    selectedId,
    sessionEmail: sessionUser?.email,
  });

  const { draftCount, submittedCount } = useMemo(
    () => getWorkspaceStats(workspaceTheses),
    [workspaceTheses],
  );
  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : "Campus member";
  const tenantDisplayName =
    tenantContext?.branding?.display_name || tenantContext?.name || "Tenant archive";

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Student workspace"
        title="Draft editing and submission workflow"
        description="Create thesis drafts, maintain repository metadata, and submit a completed record into the review queue."
      >
        <span className="pill-outline">Signed in as {sessionName}</span>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Workspace records"
          value={String(workspaceTheses.length)}
          detail="Current backend theses visible inside the authoring workspace."
        />
        <StatCard
          label="Drafts"
          value={String(draftCount)}
          detail="Entries that can still be submitted to review."
          tone="secondary"
        />
        <StatCard
          label="Submitted"
          value={String(submittedCount)}
          detail="Records already moving through review states."
        />
        <StatCard
          label="Tenant"
          value={tenantContext?.slug.toUpperCase() || "N/A"}
          detail={tenantDisplayName}
          tone="neutral"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <WorkspaceQueueCard
            theses={workspaceTheses}
            selectedId={resolvedSelectedId}
            errorMessage={thesesQuery.error?.message}
            onSelect={setSelectedId}
          />

          <SurfaceCard eyebrow="Draft editor" title="Metadata editing surface">
            {resolvedSelectedId && selectedThesisQuery.isPending ? (
              <EmptyState
                title="Loading draft"
                description="The frontend is fetching the selected thesis detail from the backend."
              />
            ) : (
              <WorkspaceEditor
                key={resolvedSelectedId || "new"}
                activeTenantId={activeTenantId}
                currentMembershipId={currentMembership?.id || null}
                sessionName={sessionName}
                selectedThesis={selectedThesisQuery.data || null}
                departments={departmentsQuery.data ?? []}
                programs={programsQuery.data ?? []}
                adviserOptions={adviserOptions}
                onCreated={setSelectedId}
              />
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-5">
          <SubmissionChecklistCard />
          <WorkspaceTimelineCard thesis={selectedThesisQuery.data || null} />
        </div>
      </section>
    </div>
  );
}
