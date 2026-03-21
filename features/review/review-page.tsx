"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { TabPanels, type TabPanelItem } from "@/components/ui/tab-panels";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ReviewContextCard } from "./components/review-context-card";
import { ReviewFocusCard } from "./components/review-focus-card";
import { ReviewPublishingCard } from "./components/review-publishing-card";
import { ReviewQueueCard } from "./components/review-queue-card";
import { useReviewData } from "./hooks/use-review-data";
import { useReviewMutations } from "./hooks/use-review-mutations";
import { countPendingQueueItems, getDefaultReviewNote } from "./utils";

type ReviewStage = "queue" | "decision" | "publishing" | "context";

export function ReviewPageView() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const [selectedId, setSelectedId] = useState("");
  const [activeStage, setActiveStage] = useState<ReviewStage>("queue");
  const [notesBySelection, setNotesBySelection] = useState<
    Record<string, string>
  >({});

  const { thesesQuery, queue, currentMembership, resolvedSelectedId, focusedQuery } =
    useReviewData({
      tenantId: activeTenantId,
      activeRole,
      selectedId,
      sessionEmail: sessionUser?.email,
    });

  const pendingCount = useMemo(() => countPendingQueueItems(queue), [queue]);
  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : "Campus member";
  const focused = focusedQuery.data;
  const noteKey = `${activeRole}:${resolvedSelectedId || "default"}`;
  const note = notesBySelection[noteKey] ?? getDefaultReviewNote(activeRole);

  const {
    reviewMutation,
    startReviewMutation,
    publishMutation,
    unpublishMutation,
    archiveMutation,
    errorMessage,
  } =
    useReviewMutations({
      tenantId: activeTenantId,
      thesisId: resolvedSelectedId,
      reviewerMembershipId: currentMembership?.id || null,
      note,
    });

  const tabs = useMemo<TabPanelItem[]>(() => {
    const items: TabPanelItem[] = [
      {
        id: "queue",
        label: "Select record",
        description: "Open the review queue and choose the submission you want to work on.",
        content: (
          <section className="workspace-form-section space-y-4">
            <div className="space-y-2">
              <p className="muted-label">Queue</p>
              <h2 className="text-[1.7rem] leading-tight">Review queue</h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Start here. Pick a submission to move into decision writing.
              </p>
            </div>
            <ReviewQueueCard
              embedded
              queue={queue}
              selectedId={resolvedSelectedId}
              errorMessage={thesesQuery.error?.message}
              onSelect={(thesisId) => {
                setSelectedId(thesisId);
                setActiveStage("decision");
              }}
            />
          </section>
        ),
      },
    ];

    items.push({
      id: "decision",
      label: "Write decision",
      description:
        activeRole === "LIBRARIAN"
          ? "Record the review outcome and prepare the record for publishing."
          : "Record the review outcome and next step for this submission.",
      content: focused ? (
        <section className="workspace-form-section space-y-5">
          <div className="space-y-2">
            <p className="muted-label">Decision</p>
            <h2 className="text-[1.7rem] leading-tight">Decision workspace</h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {activeRole === "LIBRARIAN"
                ? "Capture the academic decision here, then move to publishing controls in the next stage."
                : "Review the record and capture the next action for this submission."}
            </p>
          </div>
          <ReviewFocusCard
            embedded
            activeRole={activeRole}
            thesis={focused}
            note={note}
            errorMessage={errorMessage}
            isStartReviewPending={startReviewMutation.isPending}
            isReviewPending={reviewMutation.isPending}
            isPublishPending={publishMutation.isPending}
            isUnpublishPending={unpublishMutation.isPending}
            isArchivePending={archiveMutation.isPending}
            onNoteChange={(value) =>
              setNotesBySelection((current) => ({
                ...current,
                [noteKey]: value,
              }))
            }
            onStartReview={() => startReviewMutation.mutate()}
            onApprove={() => reviewMutation.mutate("APPROVED")}
            onRequestChanges={() => reviewMutation.mutate("CHANGES_REQUESTED")}
            onPublish={() => publishMutation.mutate()}
            onUnpublish={() => unpublishMutation.mutate()}
            onArchive={() => archiveMutation.mutate()}
          />
        </section>
      ) : (
        <EmptyState
          title="No submission selected"
          description="Choose a submission from the queue first, then write the decision here."
          action={
            <Button variant="secondary" size="sm" onClick={() => setActiveStage("queue")}>
              Open queue
            </Button>
          }
        />
      ),
    });

    if (activeRole === "LIBRARIAN") {
      items.push({
        id: "publishing",
        label: "Publish record",
        description: "Set visibility, embargo, and publishing access before the record goes live.",
        content: (
          <ReviewPublishingCard
            activeTenantId={activeTenantId}
            currentMembershipId={currentMembership?.id || null}
            thesis={focused || null}
            note={note}
            onNoteChange={(value) =>
              setNotesBySelection((current) => ({
                ...current,
                [noteKey]: value,
              }))
            }
            isPublishPending={publishMutation.isPending}
            isUnpublishPending={unpublishMutation.isPending}
            isArchivePending={archiveMutation.isPending}
            onPublish={() => publishMutation.mutate()}
            onUnpublish={() => unpublishMutation.mutate()}
            onArchive={() => archiveMutation.mutate()}
          />
        ),
      });
    }

    items.push({
      id: "context",
      label: "Review context",
      description: "Keep workflow history and prior review notes close while you evaluate the record.",
      content: focused ? (
        <section className="workspace-form-section space-y-4">
          <div className="space-y-2">
            <p className="muted-label">Context</p>
            <h2 className="text-[1.7rem] leading-tight">Workflow and review history</h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Check the status trail and previous review notes before you finalize the next step.
            </p>
          </div>
          <ReviewContextCard thesis={focused} embedded />
        </section>
      ) : (
        <EmptyState
          title="No record in context"
          description="Choose a record from the queue to view its workflow and review history."
          action={
            <Button variant="secondary" size="sm" onClick={() => setActiveStage("queue")}>
              Open queue
            </Button>
          }
        />
      ),
    });

    return items;
  }, [
    activeRole,
    activeTenantId,
    archiveMutation.isPending,
    currentMembership?.id,
    errorMessage,
    focused,
    note,
    noteKey,
    publishMutation.isPending,
    queue,
    resolvedSelectedId,
    reviewMutation.isPending,
    startReviewMutation.isPending,
    thesesQuery.error?.message,
    unpublishMutation.isPending,
  ]);

  return (
    <div className="page-shell workspace-page-shell space-y-5">
      <PageHeader
        eyebrow="Review desk"
        description={
          activeRole === "LIBRARIAN"
            ? "Move through the queue, write the decision, set publishing access, and check the record history one panel at a time."
            : "Move through the queue, write the decision, and check the review context one panel at a time."
        }
      >
        <span className="pill-outline">{sessionName}</span>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Reviewable records"
          value={String(queue.length)}
          detail="Records currently visible in the review workflow."
        />
        <StatCard
          label="Pending queue"
          value={String(pendingCount)}
          detail="Submissions still waiting for a decision."
          tone="secondary"
        />
        <StatCard
          label="Reviewer"
          value={sessionName.split(" ")[0] || "Reviewer"}
          detail={sessionUser?.email || "No active session"}
          tone="neutral"
        />
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <p className="muted-label">Workflow</p>
          <h2 className="text-[1.55rem] leading-tight">
            {activeRole === "LIBRARIAN"
              ? "Queue, decide, publish, review context"
              : "Queue, decide, review context"}
          </h2>
        </div>

        <div className="workspace-stage-shell bg-[rgba(255,255,255,0.38)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.05)] backdrop-blur-[18px]">
          <TabPanels
            tabs={tabs}
            activeTabId={activeStage}
            onTabChange={(tabId) => setActiveStage(tabId as ReviewStage)}
            variant="grid"
            showDescriptionsInTabs
            className="h-full space-y-0"
            tabsClassName={`grid gap-0 border-b border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.3)] ${
              activeRole === "LIBRARIAN" ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3 xl:grid-cols-3"
            }`}
            panelClassName="workspace-stage-canvas"
          />
        </div>
      </section>
    </div>
  );
}
