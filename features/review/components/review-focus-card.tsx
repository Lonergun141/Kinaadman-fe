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
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <span className="pill-outline">
            {thesis.authors.map((author) => author.display_name).join(", ")}
          </span>
          <span className="pill-outline">
            {thesis.program?.name || "No program"}
          </span>
          <span className="pill-outline">{thesis.year}</span>
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

        <div className="space-y-3">
          <p className="text-primary-label">Decision actions</p>
          {activeRole === "ADVISER" ? (
            <div className="grid gap-2 sm:grid-cols-2">
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
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
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
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
