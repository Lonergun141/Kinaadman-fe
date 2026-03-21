"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { formatDateTime, toTitleCase } from "@/lib/utils";
import type { ThesisDetail } from "@/types/domain";

interface WorkspaceTimelineCardProps {
  thesis: ThesisDetail | null;
  embedded?: boolean;
}

export function WorkspaceTimelineCard({
  thesis,
  embedded = false,
}: WorkspaceTimelineCardProps) {
  const content = thesis ? (
    <dl className="space-y-4">
      {[
        { label: "Last updated", value: formatDateTime(thesis.updated_at) },
        {
          label: "Assigned adviser",
          value: thesis.advisers[0]?.adviser_email || "Not assigned",
        },
        {
          label: "Current status",
          value: toTitleCase(thesis.status),
        },
      ].map((row) => (
        <div key={row.label}>
          <dt className="text-primary-label">{row.label}</dt>
          <dd className="text-muted mt-1">{row.value}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <EmptyState
      title="No activity yet"
      description="Status updates will appear here after a thesis record has been created and moved through the workflow."
    />
  );

  if (embedded) {
    return content;
  }

  return (
    <SurfaceCard eyebrow="Timeline" title="Latest activity">
      {content}
    </SurfaceCard>
  );
}
