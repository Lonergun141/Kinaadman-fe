"use client";

import { useMemo, useState } from "react";
import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TabPanels, type TabPanelItem } from "@/components/ui/tab-panels";
import { TextInput } from "@/components/ui/text-input";
import {
  countLibrarianDeskItems,
  getLibrarianDeskFilterLabel,
  getPrimaryReadinessMessage,
  matchesLibrarianDeskFilter,
  sortLibrarianDeskItems,
  type LibrarianDeskFilter,
} from "@/lib/publication-readiness";
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

function LabeledRecordLink({ thesisId }: { thesisId: string }) {
  return (
    <a
      href={`/theses/${thesisId}`}
      className="inline-flex text-sm font-semibold text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
    >
      Open full record
    </a>
  );
}

export function ReviewPageView() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const [selectedId, setSelectedId] = useState("");
  const [deskFilter, setDeskFilter] = useState<LibrarianDeskFilter>("ALL");
  const [deskSearch, setDeskSearch] = useState("");
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
  } = useReviewMutations({
    tenantId: activeTenantId,
    thesisId: resolvedSelectedId,
    reviewerMembershipId: currentMembership?.id || null,
    note,
  });

  const sortedQueue = useMemo(() => sortLibrarianDeskItems(queue), [queue]);
  const librarianQueue = useMemo(() => {
    const normalizedSearch = deskSearch.trim().toLowerCase();

    return sortedQueue.filter((thesis) => {
      if (!matchesLibrarianDeskFilter(thesis, deskFilter)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        thesis.title,
        thesis.department?.name,
        thesis.program?.name,
        thesis.authors.map((author) => author.display_name).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [deskFilter, deskSearch, sortedQueue]);

  const librarianFilterItems: LibrarianDeskFilter[] = [
    "ALL",
    "READY",
    "NEEDS_ADVISER",
    "NEEDS_PANEL",
    "NEEDS_METADATA",
    "PUBLISHED",
  ];

  const handleNoteChange = (value: string) =>
    setNotesBySelection((current) => ({
      ...current,
      [noteKey]: value,
    }));

  if (activeRole === "LIBRARIAN") {
    const librarianTabs: TabPanelItem[] = [
      {
        id: "queue",
        label: `Queue (${librarianQueue.length})`,
        content: (
          <section className="space-y-4">
            <div className="space-y-2">
              <p className="muted-label">Queue</p>
              <h2 className="text-[1.7rem] leading-tight">Publishing queue</h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Select one thesis at a time. The queue stays in a single list so
                you can scan title, readiness, and blockers without jumping
                across cards.
              </p>
            </div>
            <ReviewQueueCard
              embedded
              queue={librarianQueue}
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
      {
        id: "decision",
        label: "Decision",
        content: focused ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="muted-label">Decision</p>
              <h2 className="text-[1.7rem] leading-tight">Review decision</h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Record the librarian decision and note without leaving the active
                thesis.
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
              onNoteChange={handleNoteChange}
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
            title="No thesis selected"
            description="Choose a thesis from the queue first, then write the librarian decision here."
            action={
              <Button variant="secondary" size="sm" onClick={() => setActiveStage("queue")}>
                Open queue
              </Button>
            }
          />
        ),
      },
      {
        id: "publishing",
        label: "Publishing",
        content: focused ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="muted-label">Publishing</p>
              <h2 className="text-[1.7rem] leading-tight">Checklist and repository controls</h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Complete the clearance checklist, then publish only when the
                blockers reach zero.
              </p>
            </div>
            <ReviewPublishingCard
              activeTenantId={activeTenantId}
              currentMembershipId={currentMembership?.id || null}
              thesis={focused}
              note={note}
              onNoteChange={handleNoteChange}
              isPublishPending={publishMutation.isPending}
              isUnpublishPending={unpublishMutation.isPending}
              isArchivePending={archiveMutation.isPending}
              onPublish={() => publishMutation.mutate()}
              onUnpublish={() => unpublishMutation.mutate()}
              onArchive={() => archiveMutation.mutate()}
            />
          </section>
        ) : (
          <EmptyState
            title="No thesis selected"
            description="Choose a thesis from the queue first, then manage publishing readiness here."
            action={
              <Button variant="secondary" size="sm" onClick={() => setActiveStage("queue")}>
                Open queue
              </Button>
            }
          />
        ),
      },
      {
        id: "context",
        label: "History",
        content: focused ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="muted-label">History</p>
              <h2 className="text-[1.7rem] leading-tight">Workflow context</h2>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Review the status trail, recent notes, and publishing blockers in
                one place.
              </p>
            </div>

            <div className="border-t border-[rgba(15,42,68,0.08)] pt-5">
              <p className="text-primary-label">Current blockers</p>
              {focused.publication_readiness.blockers.length ? (
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {focused.publication_readiness.blockers.join(" | ")}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  This record has no remaining publishing blockers.
                </p>
              )}
            </div>

            <div className="border-t border-[rgba(15,42,68,0.08)] pt-5">
              <ReviewContextCard thesis={focused} embedded />
            </div>
          </section>
        ) : (
          <EmptyState
            title="No thesis selected"
            description="Choose a thesis from the queue first, then inspect its workflow history here."
            action={
              <Button variant="secondary" size="sm" onClick={() => setActiveStage("queue")}>
                Open queue
              </Button>
            }
          />
        ),
      },
    ];

    return (
      <div className="page-shell space-y-6">
        <PageHeader
          eyebrow="Librarian desk"
          description="Review, clear, and publish theses through one simpler long-form workspace."
        >
          <span className="pill-outline">{sessionName}</span>
        </PageHeader>

        <section className="border-y border-[rgba(15,42,68,0.08)] py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            <span className="font-semibold text-[color:var(--color-primary)]">
              Queue summary
            </span>
            <span>{countLibrarianDeskItems(queue, "READY")} ready</span>
            <span>{countLibrarianDeskItems(queue, "NEEDS_ADVISER")} need adviser</span>
            <span>{countLibrarianDeskItems(queue, "NEEDS_PANEL")} need panel</span>
            <span>{countLibrarianDeskItems(queue, "NEEDS_METADATA")} need metadata</span>
          </div>
        </section>

        <section className="space-y-4 border-b border-[rgba(15,42,68,0.08)] pb-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <TextInput
              label="Search librarian queue"
              value={deskSearch}
              placeholder="Search title, author, department, or program"
              onChange={(event) => setDeskSearch(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {librarianFilterItems.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDeskFilter(filter)}
                  className={
                    deskFilter === filter
                      ? "rounded-full bg-[rgba(201,162,39,0.18)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]"
                      : "rounded-full bg-[rgba(15,42,68,0.05)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
                  }
                >
                  {getLibrarianDeskFilterLabel(filter)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {focused ? (
          <section className="space-y-3 border-b border-[rgba(15,42,68,0.08)] pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <p className="muted-label">Selected record</p>
                <h2 className="text-[2rem] leading-[1.02] tracking-[-0.04em] text-[color:var(--color-primary)]">
                  {focused.title}
                </h2>
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {focused.authors.map((author) => author.display_name).join(", ") ||
                    "Author not recorded"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="pill-outline">
                    {focused.program?.name ||
                      focused.department?.name ||
                      "Program not assigned"}
                  </span>
                  <span className="pill-outline">{focused.year}</span>
                  <span className="pill-outline">{focused.thesis_type}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={focused.status} />
                <ReadinessBadge
                  status={
                    focused.publication_readiness.can_publish_now ? "READY" : "PENDING"
                  }
                >
                  {focused.publication_readiness.can_publish_now
                    ? "Ready to publish"
                    : `${focused.publication_readiness.blocker_count} blockers`}
                </ReadinessBadge>
              </div>
            </div>
            <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              {getPrimaryReadinessMessage(focused.publication_readiness)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
              {focused.publication_readiness.blockers.length ? (
                <span>{focused.publication_readiness.blockers.join(" | ")}</span>
              ) : (
                <span>No active publishing blockers</span>
              )}
            </div>
            <LabeledRecordLink thesisId={focused.id} />
          </section>
        ) : null}

        <TabPanels
          tabs={librarianTabs}
          activeTabId={activeStage}
          onTabChange={(tabId) => setActiveStage(tabId as ReviewStage)}
          variant="underline"
          panelClassName="pt-3"
        />
      </div>
    );
  }

  const tabs = useMemo<TabPanelItem[]>(() => {
    const items: TabPanelItem[] = [
      {
        id: "queue",
        label: "Select record",
        description:
          "Open the review queue and choose the submission you want to work on.",
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
        "Record the review outcome and next step for this submission.",
      content: focused ? (
        <section className="workspace-form-section space-y-5">
          <div className="space-y-2">
            <p className="muted-label">Decision</p>
            <h2 className="text-[1.7rem] leading-tight">Decision workspace</h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Review the record and capture the next action for this submission.
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
            onNoteChange={handleNoteChange}
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveStage("queue")}
            >
              Open queue
            </Button>
          }
        />
      ),
    });

    items.push({
      id: "context",
      label: "Review context",
      description:
        "Keep workflow history and prior review notes close while you evaluate the record.",
      content: focused ? (
        <section className="workspace-form-section space-y-4">
          <div className="space-y-2">
            <p className="muted-label">Context</p>
            <h2 className="text-[1.7rem] leading-tight">
              Workflow and review history
            </h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Check the status trail and previous review notes before you finalize
              the next step.
            </p>
          </div>
          <ReviewContextCard thesis={focused} embedded />
        </section>
      ) : (
        <EmptyState
          title="No record in context"
          description="Choose a record from the queue to view its workflow and review history."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveStage("queue")}
            >
              Open queue
            </Button>
          }
        />
      ),
    });

    return items;
  }, [
    activeRole,
    archiveMutation.isPending,
    errorMessage,
    focused,
    note,
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
        description="Move through the queue, write the decision, and check the review context one panel at a time."
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
            Queue, decide, review context
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
            tabsClassName="grid gap-0 border-b border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.3)] md:grid-cols-3 xl:grid-cols-3"
            panelClassName="workspace-stage-canvas"
          />
        </div>
      </section>
    </div>
  );
}
