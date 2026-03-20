"use client";

import { useMemo, useState } from "react";
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
    <div className="page-shell space-y-6">
      <PageHeader
        eyebrow="Review queue"
        title="Adviser and librarian decision workspace"
        description="Review actions now call the live thesis workflow endpoints. Queue visibility is tenant-wide because the backend does not currently expose reviewer-specific queue filters."
      />

      <section className="grid gap-3 sm:grid-cols-3">
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ReviewQueueCard
          queue={queue}
          selectedId={resolvedSelectedId}
          errorMessage={thesesQuery.error?.message}
          onSelect={setSelectedId}
        />

        <div className="space-y-5">
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
              <ReviewContextCard thesis={focused} />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
