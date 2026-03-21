"use client";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AppRole } from "@/stores/workspace-store";
import type { ThesisDetail } from "@/types/domain";

interface ReviewFocusCardProps {
  activeRole: AppRole;
  thesis: ThesisDetail;
  note: string;
  errorMessage?: string;
  embedded?: boolean;
  isStartReviewPending: boolean;
  isReviewPending: boolean;
  isPublishPending: boolean;
  isUnpublishPending: boolean;
  isArchivePending: boolean;
  onNoteChange: (value: string) => void;
  onStartReview: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
}

export function ReviewFocusCard({
  activeRole,
  thesis,
  note,
  errorMessage,
  embedded = false,
  isStartReviewPending,
  isReviewPending,
  isPublishPending: _isPublishPending,
  isUnpublishPending: _isUnpublishPending,
  isArchivePending: _isArchivePending,
  onNoteChange,
  onStartReview,
  onApprove,
  onRequestChanges,
  onPublish: _onPublish,
  onUnpublish: _onUnpublish,
  onArchive: _onArchive,
}: ReviewFocusCardProps) {
  const content = (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className="pill-outline">
          {thesis.authors.map((author) => author.display_name).join(", ")}
        </span>
        <span className="pill-outline">
          {thesis.program?.name || "No program"}
        </span>
        <span className="pill-outline">{thesis.year}</span>
        <span className="pill-outline">
          {thesis.visibility.toLowerCase().replaceAll("_", " ")}
        </span>
      </div>

      <div className="inline-note">
        <p className="text-primary-label">Abstract preview</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
          {thesis.abstract}
        </p>
      </div>

      <label className="flex flex-col gap-2.5">
        <span className="text-primary-label">Decision note</span>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          className="input-base min-h-36 resize-y"
          placeholder="Capture the reasoning that will help the next reviewer or editor understand this decision."
        />
      </label>
      {errorMessage ? (
        <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-primary-label">Decision actions</p>
          {thesis.status === "SUBMITTED" ? (
            <Button
              size="sm"
              onClick={onStartReview}
              disabled={isStartReviewPending}
            >
              {isStartReviewPending ? "Starting review..." : "Start review"}
            </Button>
          ) : null}
          {activeRole === "ADVISER" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isReviewPending || thesis.status === "SUBMITTED"}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onRequestChanges}
                disabled={isReviewPending || thesis.status === "SUBMITTED"}
              >
                Request changes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isReviewPending || thesis.status === "SUBMITTED"}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onRequestChanges}
                  disabled={isReviewPending || thesis.status === "SUBMITTED"}
                >
                  Request changes
                </Button>
              </div>
              <Button
                variant="ghost"
                disabled
              >
                Use publishing stage for access and publish controls
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <SurfaceCard eyebrow="Focused record" title={thesis.title}>
      {content}
    </SurfaceCard>
  );
}
