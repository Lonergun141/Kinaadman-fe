"use client";

import { SurfaceCard } from "@/components/ui/surface-card";
import { formatDateTime } from "@/lib/utils";
import type { ThesisDetail } from "@/types/domain";

interface ReviewContextCardProps {
  thesis: ThesisDetail;
  embedded?: boolean;
}

function ReviewContextContent({ thesis }: ReviewContextCardProps) {
  return (
    <div className="space-y-3 text-sm text-[color:var(--color-muted-foreground)]">
      <p>
        The current thesis detail endpoint does not expose review comments or
        status history, so this screen only shows the live thesis metadata and
        lifecycle timestamps.
      </p>
      <dl className="space-y-3">
        {[
          { label: "Updated", value: formatDateTime(thesis.updated_at) },
          { label: "Submitted", value: formatDateTime(thesis.submitted_at) },
          { label: "Approved", value: formatDateTime(thesis.approved_at) },
          { label: "Published", value: formatDateTime(thesis.published_at) },
        ].map((row) => (
          <div key={row.label}>
            <dt className="text-primary-label">{row.label}</dt>
            <dd className="text-muted mt-0.5">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ReviewContextCard({
  thesis,
  embedded = false,
}: ReviewContextCardProps) {
  if (embedded) {
    return <ReviewContextContent thesis={thesis} />;
  }

  return (
    <SurfaceCard
      eyebrow="Review context"
      title="Lifecycle and backend limitations"
      className="xl:sticky xl:top-28 xl:self-start"
    >
      <ReviewContextContent thesis={thesis} />
    </SurfaceCard>
  );
}
