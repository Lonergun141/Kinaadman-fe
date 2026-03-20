"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

interface WorkspaceQueueCardProps {
  theses: ThesisListItem[];
  selectedId: string;
  errorMessage?: string;
  onSelect: (thesisId: string) => void;
}

export function WorkspaceQueueCard({
  theses,
  selectedId,
  errorMessage,
  onSelect,
}: WorkspaceQueueCardProps) {
  return (
    <SurfaceCard eyebrow="Workspace queue" title="Available thesis records">
      {errorMessage ? (
        <EmptyState title="Workspace unavailable" description={errorMessage} />
      ) : theses.length ? (
        <div className="space-y-2.5">
          {theses.map((thesis) => (
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
                <span className="badge-base bg-slate-100 text-[color:var(--color-primary)]">
                  {toTitleCase(thesis.status)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/theses/${thesis.id}`}
                  className="font-semibold text-[color:var(--color-primary)] underline underline-offset-4"
                >
                  Open detail
                </Link>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No thesis drafts yet"
          description="Create the first thesis draft to start the submission workflow."
        />
      )}
    </SurfaceCard>
  );
}
