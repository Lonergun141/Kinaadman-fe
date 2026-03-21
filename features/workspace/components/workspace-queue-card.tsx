"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TransitionLink } from "@/components/ui/transition-link";
import { toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

interface WorkspaceQueueCardProps {
  theses: ThesisListItem[];
  selectedId: string;
  errorMessage?: string;
  onSelect: (thesisId: string) => void;
  embedded?: boolean;
}

function QueueContent({
  theses,
  selectedId,
  errorMessage,
  onSelect,
}: WorkspaceQueueCardProps) {
  if (errorMessage) {
    return <EmptyState title="Workspace unavailable" description={errorMessage} />;
  }

  if (!theses.length) {
    return (
      <EmptyState
        title="No thesis drafts yet"
        description="Use the draft details stage to create your first record, then continue through files and submission."
      />
    );
  }

  return (
    <div className="space-y-3">
      {theses.map((thesis) => (
        <div
          key={thesis.id}
          className={`card-item w-full text-left ${
            selectedId === thesis.id
              ? "bg-[color:var(--color-surface-high)] shadow-[0_20px_34px_rgba(0,21,42,0.1)]"
              : ""
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(thesis.id)}
            className="w-full text-left"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="muted-label">Record</p>
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                  {thesis.title}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {thesis.department?.name || "No department"} |{" "}
                  {thesis.program?.name || "No program"}
                </p>
              </div>
              <span className="badge-base bg-slate-100 text-[color:var(--color-primary)]">
                {toTitleCase(thesis.status)}
              </span>
            </div>
          </button>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <TransitionLink
              href={`/theses/${thesis.id}`}
              className="font-semibold text-[color:var(--color-primary)] underline underline-offset-4"
              pendingClassName="opacity-80"
            >
              Open detail
            </TransitionLink>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceQueueCard(props: WorkspaceQueueCardProps) {
  if (props.embedded) {
    return <QueueContent {...props} />;
  }

  return (
    <SurfaceCard
      eyebrow="Workspace queue"
      title="Draft desk"
      className="xl:sticky xl:top-28 xl:self-start"
    >
      <QueueContent {...props} />
    </SurfaceCard>
  );
}
