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
}

export function ReviewQueueCard({
  queue,
  selectedId,
  errorMessage,
  onSelect,
}: ReviewQueueCardProps) {
  return (
    <SurfaceCard eyebrow="Queue" title="Pending submissions">
      {errorMessage ? (
        <EmptyState title="Queue unavailable" description={errorMessage} />
      ) : queue.length ? (
        <div className="space-y-2.5">
          {queue.map((thesis) => (
            <button
              key={thesis.id}
              type="button"
              onClick={() => onSelect(thesis.id)}
              className={`card-item w-full text-left ${selectedId === thesis.id ? "border-[color:var(--color-primary)]" : ""}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
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
      ) : (
        <EmptyState
          title="Queue is clear"
          description="There are no reviewable theses for the current tenant and role."
        />
      )}
    </SurfaceCard>
  );
}
