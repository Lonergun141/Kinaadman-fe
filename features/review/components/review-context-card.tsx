"use client";

import { SurfaceCard } from "@/components/ui/surface-card";
import { formatDateTime, toTitleCase } from "@/lib/utils";
import type { ThesisDetail } from "@/types/domain";

interface ReviewContextCardProps {
  thesis: ThesisDetail;
  embedded?: boolean;
}

function ReviewContextContent({ thesis }: ReviewContextCardProps) {
  return (
    <div className="space-y-5 text-sm text-[color:var(--color-muted-foreground)]">
      <div>
        <p className="text-primary-label">Current record</p>
        <dl className="mt-3 space-y-3">
          {[
            { label: "Status", value: toTitleCase(thesis.status) },
            { label: "Visibility", value: toTitleCase(thesis.visibility) },
            { label: "Updated", value: formatDateTime(thesis.updated_at) },
            { label: "Submitted", value: formatDateTime(thesis.submitted_at) },
            { label: "Published", value: formatDateTime(thesis.published_at) },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-primary-label">{row.label}</dt>
              <dd className="text-muted mt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <p className="text-primary-label">Recent workflow history</p>
        <div className="mt-3 space-y-3">
          {thesis.status_history.length ? (
            thesis.status_history.slice(0, 4).map((item) => (
              <div key={item.id} className="border-b border-[rgba(15,42,68,0.08)] pb-3 last:border-b-0 last:pb-0">
                <p className="font-medium text-[color:var(--color-primary)]">
                  {toTitleCase(item.to_status)}
                </p>
                <p className="mt-1 leading-6">{item.note || "No note recorded."}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                  {formatDateTime(item.changed_at)}
                </p>
              </div>
            ))
          ) : (
            <p>No status changes recorded yet.</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-primary-label">Recent review notes</p>
        <div className="mt-3 space-y-3">
          {thesis.reviews.length ? (
            thesis.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b border-[rgba(15,42,68,0.08)] pb-3 last:border-b-0 last:pb-0">
                <p className="font-medium text-[color:var(--color-primary)]">
                  {toTitleCase(review.decision)}
                </p>
                <p className="mt-1 leading-6">{review.comment || "No comment recorded."}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                  {review.reviewer_email || "Reviewer not recorded"}
                </p>
              </div>
            ))
          ) : (
            <p>No review notes recorded yet.</p>
          )}
        </div>
      </div>
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
      title="Lifecycle and record context"
      className="xl:sticky xl:top-28 xl:self-start"
    >
      <ReviewContextContent thesis={thesis} />
    </SurfaceCard>
  );
}
