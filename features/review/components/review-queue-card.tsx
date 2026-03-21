"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPrimaryReadinessMessage } from "@/lib/publication-readiness";
import { formatDate, toTitleCase } from "@/lib/utils";
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
    <div className="border-y border-[rgba(15,42,68,0.08)]">
      {queue.map((thesis, index) => (
        <button
          key={thesis.id}
          type="button"
          onClick={() => onSelect(thesis.id)}
          className={`w-full px-0 py-5 text-left transition-colors ${
            index > 0 ? "border-t border-[rgba(15,42,68,0.08)]" : ""
          } ${
            selectedId === thesis.id
              ? "bg-[rgba(15,42,68,0.04)]"
              : "hover:bg-[rgba(15,42,68,0.025)]"
          }`}
        >
          <div className="space-y-3 px-1">
            <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1.1fr)_auto] lg:items-start lg:gap-6">
              <div className="min-w-0 space-y-2">
                <p className="text-base font-semibold text-[color:var(--color-primary)]">
                  {thesis.title}
                </p>
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {thesis.authors.map((author) => author.display_name).join(", ") ||
                    "Author not recorded"}
                </p>
                <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                  {toTitleCase(thesis.thesis_type)} | {thesis.year} |{" "}
                  {thesis.program?.name || thesis.department?.name || "Program not assigned"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-primary-label">Publishing signal</p>
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {getPrimaryReadinessMessage(thesis.publication_readiness)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <StatusBadge status={thesis.status} />
                <ReadinessBadge
                  status={
                    thesis.publication_readiness.can_publish_now ? "READY" : "PENDING"
                  }
                >
                  {thesis.publication_readiness.can_publish_now
                    ? "Ready to publish"
                    : `${thesis.publication_readiness.blocker_count} blockers`}
                </ReadinessBadge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
              <span>Updated {formatDate(thesis.updated_at)}</span>
              <span>{thesis.publication_readiness.readiness_score}% ready</span>
              {thesis.publication_readiness.blockers.slice(0, 2).map((blocker) => (
                <span key={blocker}>{blocker}</span>
              ))}
              {!thesis.publication_readiness.blockers.length ? (
                <span>Checklist complete</span>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function ReviewQueueCard(props: ReviewQueueCardProps) {
  return <QueueContent {...props} />;
}
