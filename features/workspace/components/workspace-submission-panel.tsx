"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { submitThesis } from "@/features/repository/api";
import {
  invalidateTenantRepositoryQueries,
  invalidateThesisDetailQuery,
} from "@/lib/query/invalidation";
import { toTitleCase } from "@/lib/utils";
import {
  useWorkspaceUploadStore,
  type WorkspacePreparedFile,
} from "@/stores/workspace-upload-store";
import type { ThesisDetail } from "@/types/domain";
import {
  SubmissionChecklistCard,
  type SubmissionChecklistItem,
} from "./submission-checklist-card";
import { WorkspaceTimelineCard } from "./workspace-timeline-card";

const EMPTY_PREPARED_FILES: WorkspacePreparedFile[] = [];

interface WorkspaceSubmissionPanelProps {
  activeTenantId: string;
  currentMembershipId: string | null;
  thesis: ThesisDetail | null;
  isLoading?: boolean;
  onBackToFiles?: () => void;
}

export function WorkspaceSubmissionPanel({
  activeTenantId,
  currentMembershipId,
  thesis,
  isLoading = false,
  onBackToFiles,
}: WorkspaceSubmissionPanelProps) {
  const queryClient = useQueryClient();
  const uploadKey = thesis ? `${activeTenantId}:${thesis.id}` : null;
  const preparedFiles = useWorkspaceUploadStore((state) =>
    uploadKey
      ? state.preparedFiles[uploadKey] ?? EMPTY_PREPARED_FILES
      : EMPTY_PREPARED_FILES,
  );

  const mainPdf = preparedFiles.find((file) => file.kind === "MAIN_PDF") || null;
  const metadataReady = Boolean(
    thesis?.title.trim() &&
      thesis.abstract.trim() &&
      thesis.department?.id &&
      thesis.program?.id &&
      thesis.year &&
      thesis.language.trim() &&
      thesis.keywords.length,
  );
  const adviserReady = Boolean(thesis?.advisers.length);
  const publicationReady = Boolean(
    thesis?.thesis_type &&
      thesis.visibility &&
      (thesis.visibility !== "EMBARGOED" || thesis.embargo_until),
  );
  const draftReady = thesis?.status === "DRAFT";
  const checklistItems = useMemo<SubmissionChecklistItem[]>(
    () => [
      {
        label: "The thesis record exists and is still in draft status.",
        complete: Boolean(draftReady),
      },
      {
        label: "Title, abstract, department, program, language, and keywords are already saved.",
        complete: metadataReady,
      },
      {
        label: "Record type and access visibility are ready for publication.",
        complete: publicationReady,
      },
      {
        label: "An adviser is assigned for the review route.",
        complete: adviserReady,
      },
      {
        label: "The main thesis PDF has been prepared in the upload step.",
        complete: Boolean(mainPdf),
      },
    ],
    [adviserReady, draftReady, mainPdf, metadataReady, publicationReady],
  );
  const blockingItems = checklistItems.filter((item) => item.complete === false);
  const canSubmit =
    Boolean(thesis) && blockingItems.length === 0 && Boolean(currentMembershipId);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!thesis) {
        throw new Error("Open a thesis draft first.");
      }

      if (!canSubmit) {
        throw new Error("Complete the submission checklist before continuing.");
      }

      return submitThesis({
        tenantId: activeTenantId,
        thesisId: thesis.id,
        submitterMembershipId: currentMembershipId,
      });
    },
    onSuccess: async () => {
      if (!thesis) {
        return;
      }

      await Promise.all([
        invalidateTenantRepositoryQueries(queryClient, activeTenantId),
        invalidateThesisDetailQuery(queryClient, activeTenantId, thesis.id),
      ]);
    },
  });

  if (isLoading) {
    return (
      <EmptyState
        title="Loading submission step"
        description="Opening your selected record so you can review the checklist and submit it."
      />
    );
  }

  if (!thesis) {
    return (
      <EmptyState
        title="No draft selected"
        description="Choose one of your records first, then review the checklist and submit it from this stage."
        action={
          onBackToFiles ? (
            <Button variant="secondary" size="sm" onClick={onBackToFiles}>
              Go to files
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)]">
      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <div className="space-y-2">
            <p className="muted-label">Submission review</p>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Review the checklist and submit.
            </p>
          </div>
          <SubmissionChecklistCard embedded items={checklistItems} />
        </section>

        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Latest activity</p>
          <WorkspaceTimelineCard thesis={thesis} embedded />
        </section>
      </div>

      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Submission status</p>
          <p className="font-serif text-[1.7rem] leading-tight text-[color:var(--color-primary)]">
            {draftReady ? "Ready for student submission" : toTitleCase(thesis.status)}
          </p>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Submit when all required items are complete.
          </p>

          {blockingItems.length ? (
            <div className="rounded-[0.85rem] bg-[rgba(15,42,68,0.05)] px-4 py-4 text-sm leading-7 text-[color:var(--color-muted-foreground)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.05)]">
              <p className="text-primary-label">Still needed</p>
              <ul className="mt-2 space-y-2">
                {blockingItems.map((item) => (
                  <li key={item.label}>{item.label}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {submitMutation.isSuccess ? (
            <div className="rounded-[0.85rem] bg-[rgba(21,128,61,0.1)] px-4 py-4 text-sm leading-7 text-[color:#166534] shadow-[inset_0_0_0_1px_rgba(21,128,61,0.12)]">
              The thesis has been submitted into the review workflow.
            </div>
          ) : null}

          {submitMutation.error?.message ? (
            <div className="rounded-[0.85rem] bg-[rgba(220,38,38,0.08)] px-4 py-4 text-sm leading-7 text-[color:var(--color-error)]">
              {submitMutation.error.message}
            </div>
          ) : null}
        </section>

        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Actions</p>
          <div className="flex flex-wrap gap-3">
            {onBackToFiles ? (
              <Button variant="ghost" size="sm" onClick={onBackToFiles}>
                Back to files
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit || submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit thesis"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
