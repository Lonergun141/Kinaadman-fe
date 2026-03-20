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
  isReviewPending: boolean;
  isPublishPending: boolean;
  isUnpublishPending: boolean;
  onNoteChange: (value: string) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ReviewFocusCard({
  activeRole,
  thesis,
  note,
  errorMessage,
  isReviewPending,
  isPublishPending,
  isUnpublishPending,
  onNoteChange,
  onApprove,
  onRequestChanges,
  onPublish,
  onUnpublish,
}: ReviewFocusCardProps) {
  return (
    <SurfaceCard eyebrow="Focused record" title={thesis.title}>
      <div className="space-y-4">
        <p className="text-muted text-xs">
          {thesis.authors.map((author) => author.display_name).join(", ")} |{" "}
          {thesis.program?.name || "No program"}
        </p>
        <p className="text-muted">{thesis.abstract}</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-primary-label">Decision note</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            className="input-base min-h-32 resize-y"
          />
        </label>
        {errorMessage ? (
          <div className="rounded-lg bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
            {errorMessage}
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-3">
          {activeRole === "ADVISER" ? (
            <>
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isReviewPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onRequestChanges}
                disabled={isReviewPending}
              >
                Request changes
              </Button>
            </>
          ) : (
            <>
              {thesis.status === "APPROVED" ? (
                <Button
                  size="sm"
                  onClick={onPublish}
                  disabled={isPublishPending}
                >
                  Publish
                </Button>
              ) : thesis.status === "PUBLISHED" ? (
                <Button
                  size="sm"
                  onClick={onUnpublish}
                  disabled={isUnpublishPending}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isReviewPending}
                >
                  Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={onRequestChanges}
                disabled={isReviewPending}
              >
                Request changes
              </Button>
            </>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
