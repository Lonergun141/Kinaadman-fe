"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { WorkspaceEditor } from "./components/workspace-editor";
import { WorkspaceRecordsTable } from "./components/workspace-records-table";
import { WorkspaceRecordSetupPanel } from "./components/workspace-record-setup-panel";
import { WorkspaceSubmissionPanel } from "./components/workspace-submission-panel";
import { WorkspaceUploadPanel } from "./components/workspace-upload-panel";
import { useWorkspaceData } from "./hooks/use-workspace-data";

type WorkspaceStage = "create" | "details" | "files" | "submit";

const stageItems: Array<{
  id: WorkspaceStage;
  step: string;
  label: string;
  description: string;
}> = [
  {
    id: "create",
    step: "Stage 1",
    label: "Create record",
    description: "Start the thesis record with the title and archive year.",
  },
  {
    id: "details",
    step: "Stage 2",
    label: "Academic details",
    description: "Complete the department, program, adviser, and abstract.",
  },
  {
    id: "files",
    step: "Stage 3",
    label: "Upload files",
    description: "Prepare the main PDF and any supporting attachments.",
  },
  {
    id: "submit",
    step: "Stage 4",
    label: "Review and submit",
    description: "Confirm the checklist and send the thesis into review.",
  },
];

export function WorkspacePageView() {
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const [selectedId, setSelectedId] = useState("");
  const [activeStage, setActiveStage] = useState<WorkspaceStage>("create");

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
    sessionUserId: sessionUser?.id,
  });

  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : "Campus member";
  const latestWorkspaceTheses = useMemo(
    () =>
      [...workspaceTheses].sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      ),
    [workspaceTheses],
  );
  const selectedThesis = selectedThesisQuery.data || null;
  const stageUnlocked = {
    create: true,
    details: Boolean(resolvedSelectedId),
    files: Boolean(resolvedSelectedId),
    submit: Boolean(resolvedSelectedId),
  };

  function renderActiveStage() {
    if (activeStage !== "create" && resolvedSelectedId && selectedThesisQuery.isPending) {
      return (
        <EmptyState
          title="Loading record"
          description="Opening the selected thesis so you can continue to the next stage."
        />
      );
    }

    switch (activeStage) {
      case "create":
        return (
          <WorkspaceRecordSetupPanel
            key={resolvedSelectedId || "new"}
            activeTenantId={activeTenantId}
            currentMembershipId={currentMembership?.id || null}
            currentUserId={sessionUser?.id || null}
            sessionName={sessionName}
            selectedThesis={selectedThesis}
            onCreated={(thesisId) => {
              setSelectedId(thesisId);
              setActiveStage("details");
            }}
            onContinue={() => setActiveStage("details")}
            onStartNew={() => {
              setSelectedId("");
              setActiveStage("create");
            }}
          />
        );
      case "details":
        return (
          <WorkspaceEditor
            key={resolvedSelectedId || "details-empty"}
            activeTenantId={activeTenantId}
            currentMembershipId={currentMembership?.id || null}
            selectedThesis={selectedThesis}
            departments={departmentsQuery.data ?? []}
            programs={programsQuery.data ?? []}
            adviserOptions={adviserOptions}
            onSaved={() => setActiveStage("files")}
            onReturnToCreate={() => setActiveStage("create")}
          />
        );
      case "files":
        return (
          <WorkspaceUploadPanel
            activeTenantId={activeTenantId}
            thesis={selectedThesis}
            isLoading={Boolean(resolvedSelectedId && selectedThesisQuery.isPending)}
            onContinue={() => setActiveStage("submit")}
            onReturnToEdit={() => setActiveStage("details")}
          />
        );
      case "submit":
        return (
          <WorkspaceSubmissionPanel
            activeTenantId={activeTenantId}
            currentMembershipId={currentMembership?.id || null}
            thesis={selectedThesis}
            isLoading={Boolean(resolvedSelectedId && selectedThesisQuery.isPending)}
            onBackToFiles={() => setActiveStage("files")}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="page-shell workspace-page-shell space-y-5">
      <PageHeader
        eyebrow="Student workspace"
        description="Finish the thesis one stage at a time."
      />

      <section className="space-y-3">
        <div className="space-y-1">
          <p className="muted-label">Workflow</p>
          <h2 className="text-[1.55rem] leading-tight">Create, complete, upload, submit</h2>
        </div>

        <div className="workspace-stage-shell rounded-[0.95rem] bg-[rgba(255,255,255,0.38)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.05)] backdrop-blur-[18px]">
          <div className="grid gap-0 bg-[rgba(255,255,255,0.3)] md:grid-cols-4">
              {stageItems.map((stage) => {
                const active = stage.id === activeStage;
                const disabled = !stageUnlocked[stage.id];

                return (
                  <button
                    key={stage.id}
                    type="button"
                    title={stage.description}
                    disabled={disabled}
                    onClick={() => setActiveStage(stage.id)}
                    className={`group relative px-4 py-3 text-left transition-all lg:px-5 lg:py-4 ${
                      active
                        ? "bg-[rgba(255,255,255,0.42)] shadow-[inset_0_-2px_0_var(--color-secondary)]"
                        : "bg-transparent hover:bg-[rgba(15,42,68,0.03)]"
                    } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                          {stage.step}
                        </p>
                        <p className="font-serif text-[1.08rem] leading-tight text-[color:var(--color-primary)]">
                          {stage.label}
                        </p>
                      </div>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(15,42,68,0.05)] text-[11px] font-semibold text-[color:var(--color-muted)]">
                        i
                      </span>
                    </div>
                    {!disabled ? (
                      <span className="workspace-stage-tooltip group-hover:block group-focus-visible:block">
                        {stage.description}
                      </span>
                    ) : null}
                  </button>
                );
              })}
          </div>

          <div className="workspace-stage-canvas">{renderActiveStage()}</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <p className="muted-label">My records</p>
          <h2 className="text-[1.55rem] leading-tight">Latest thesis and capstone records</h2>
        </div>

        <WorkspaceRecordsTable
          theses={latestWorkspaceTheses}
          selectedId={resolvedSelectedId}
          errorMessage={thesesQuery.error?.message}
          onSelect={(thesisId) => {
            setSelectedId(thesisId);
            setActiveStage("details");
          }}
        />
      </section>
    </div>
  );
}
