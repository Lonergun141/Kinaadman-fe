"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ReviewContextCard } from "./components/review-context-card";
import { ReviewFocusCard } from "./components/review-focus-card";
import { ReviewQueueCard } from "./components/review-queue-card";
import { useReviewData } from "./hooks/use-review-data";
import { useReviewMutations } from "./hooks/use-review-mutations";
import { countPendingQueueItems, getDefaultReviewNote } from "./utils";

export function ReviewPageView() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const [selectedId, setSelectedId] = useState("");
  const [queueOpen, setQueueOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
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

  const { reviewMutation, publishMutation, unpublishMutation, errorMessage } =
    useReviewMutations({
      tenantId: activeTenantId,
      thesisId: resolvedSelectedId,
      reviewerMembershipId: currentMembership?.id || null,
      note,
    });

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Review queue"
        title="Adviser and librarian decision desk"
        description="Keep queue triage, decision writing, and lifecycle context in a single workspace so reviewers can move faster without losing important metadata."
      >
        <span className="pill-outline">{sessionName}</span>
        <Button variant="secondary" size="sm" onClick={() => setQueueOpen(true)}>
          Open queue
        </Button>
        {focused ? (
          <Button variant="ghost" size="sm" onClick={() => setContextOpen(true)}>
            View context
          </Button>
        ) : null}
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Reviewable records"
          value={String(queue.length)}
          detail="Records currently visible in the review workspace."
        />
        <StatCard
          label="Pending queue"
          value={String(pendingCount)}
          detail="Submissions still awaiting a final decision."
          tone="secondary"
        />
        <StatCard
          label="Reviewer"
          value={sessionName.split(" ")[0] || "Reviewer"}
          detail={sessionUser?.email || "No active session"}
          tone="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <div className="hidden xl:block">
          <ReviewQueueCard
            queue={queue}
            selectedId={resolvedSelectedId}
            errorMessage={thesesQuery.error?.message}
            onSelect={setSelectedId}
          />
        </div>

        {focused ? (
          <>
            <ReviewFocusCard
              activeRole={activeRole}
              thesis={focused}
              note={note}
              errorMessage={errorMessage}
              isReviewPending={reviewMutation.isPending}
              isPublishPending={publishMutation.isPending}
              isUnpublishPending={unpublishMutation.isPending}
              onNoteChange={(value) =>
                setNotesBySelection((current) => ({
                  ...current,
                  [noteKey]: value,
                }))
              }
              onApprove={() => reviewMutation.mutate("APPROVED")}
              onRequestChanges={() =>
                reviewMutation.mutate("CHANGES_REQUESTED")
              }
              onPublish={() => publishMutation.mutate()}
              onUnpublish={() => unpublishMutation.mutate()}
            />
            <div className="hidden xl:block">
              <ReviewContextCard thesis={focused} />
            </div>
          </>
        ) : (
          <EmptyState
            title="No submission selected"
            description="Choose a thesis from the queue to open the review desk and write a decision."
          />
        )}
      </section>

      <Drawer
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        eyebrow="Review queue"
        title="Pending submissions"
        description="Switch review focus without forcing the queue into the main decision surface."
      >
        <ReviewQueueCard
          embedded
          queue={queue}
          selectedId={resolvedSelectedId}
          errorMessage={thesesQuery.error?.message}
          onSelect={(thesisId) => {
            setSelectedId(thesisId);
            setQueueOpen(false);
          }}
        />
      </Drawer>

      <Drawer
        open={contextOpen && Boolean(focused)}
        onClose={() => setContextOpen(false)}
        eyebrow="Review context"
        title="Lifecycle and backend limitations"
        description="Keep supporting metadata nearby without crowding the primary decision area."
      >
        {focused ? <ReviewContextCard thesis={focused} embedded /> : null}
      </Drawer>
    </div>
  );
}
