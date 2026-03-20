"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

interface ReviewQueueCardProps {
  queue: ThesisListItem[];
  selectedId: string;
  errorMessage?: string;
  onSelect: (thesisId: string) => void;
  embedded?: boolean;
}

function QueueContent({
  queue,
  selectedId,
  errorMessage,
  onSelect,
}: ReviewQueueCardProps) {
  if (errorMessage) {
    return <EmptyState title="Queue unavailable" description={errorMessage} />;
  }

  if (!queue.length) {
    return (
      <EmptyState
        title="Queue is clear"
        description="There are no reviewable theses for the current tenant and role."
      />
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((thesis) => (
        <button
          key={thesis.id}
          type="button"
          onClick={() => onSelect(thesis.id)}
          className={`card-item w-full text-left ${
            selectedId === thesis.id
              ? "bg-[color:var(--color-surface-high)] shadow-[0_20px_34px_rgba(0,21,42,0.1)]"
              : ""
          }`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="muted-label">Review item</p>
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                {thesis.title}
              </p>
              <p className="text-muted mt-0.5 text-xs">
                {thesis.department?.name || "No department"} |{" "}
                {thesis.program?.name || "No program"}
              </p>
            </div>
            <span className="badge-base bg-[rgba(201,162,39,0.12)] text-[color:var(--color-primary)]">
              {toTitleCase(thesis.status)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function ReviewQueueCard(props: ReviewQueueCardProps) {
  if (props.embedded) {
    return <QueueContent {...props} />;
  }

  return (
    <SurfaceCard
      eyebrow="Queue"
      title="Pending submissions"
      className="xl:sticky xl:top-28 xl:self-start"
    >
      <QueueContent {...props} />
    </SurfaceCard>
  );
}
