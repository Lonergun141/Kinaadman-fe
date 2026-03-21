"use client";

import { ReadinessBadge } from "@/components/ui/readiness-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getPrimaryReadinessMessage } from "@/lib/publication-readiness";
import { formatDateTime } from "@/lib/utils";
import type { PublicationReadiness } from "@/types/domain";

interface PublicationReadinessCardProps {
  readiness: PublicationReadiness;
  title?: string;
  eyebrow?: string;
  embedded?: boolean;
  layout?: "default" | "sidebar";
  className?: string;
}

function CardPublicationReadinessContent({
  readiness,
}: Pick<PublicationReadinessCardProps, "readiness">) {
  return (
    <div className="space-y-5">
      <div className="rounded-[0.95rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(247,249,251,0.8)] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-primary-label">Publishing readiness</p>
            <p className="font-serif text-[1.9rem] leading-none text-[color:var(--color-primary)]">
              {readiness.readiness_score}%
            </p>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {getPrimaryReadinessMessage(readiness)}
            </p>
          </div>
          <ReadinessBadge status={readiness.can_publish_now ? "READY" : "PENDING"}>
            {readiness.can_publish_now ? "Ready to publish" : `${readiness.blocker_count} blockers`}
          </ReadinessBadge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white px-4 py-4">
          <p className="text-primary-label">Adviser recommendation</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReadinessBadge status={readiness.adviser_recommendation_status} />
            {readiness.adviser_review_decision ? (
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                {readiness.adviser_review_decision.replaceAll("_", " ")}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.adviser_recommendation_note || "No adviser note recorded yet."}
          </p>
          {readiness.adviser_recommendation_by ? (
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
              {readiness.adviser_recommendation_by}
              {readiness.adviser_recommendation_at
                ? ` | ${formatDateTime(readiness.adviser_recommendation_at)}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white px-4 py-4">
          <p className="text-primary-label">Panel approval</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReadinessBadge
              status={
                readiness.panel_approval_status === "APPROVED"
                  ? "READY"
                  : readiness.panel_approval_status === "REJECTED"
                    ? "BLOCKED"
                    : "PENDING"
              }
            >
              {readiness.panel_approval_status.replaceAll("_", " ")}
            </ReadinessBadge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.panel_approval_note || "No panel approval note recorded yet."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {readiness.checklist.map((check) => (
          <div
            key={check.id}
            className="rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                  {check.label}
                </p>
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {check.detail}
                </p>
              </div>
              <ReadinessBadge status={check.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmbeddedPublicationReadinessContent({
  readiness,
}: Pick<PublicationReadinessCardProps, "readiness">) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(15,42,68,0.08)] pb-4">
        <div className="space-y-2">
          <p className="text-primary-label">Publishing readiness</p>
          <p className="font-serif text-[1.9rem] leading-none text-[color:var(--color-primary)]">
            {readiness.readiness_score}%
          </p>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {getPrimaryReadinessMessage(readiness)}
          </p>
        </div>
        <ReadinessBadge status={readiness.can_publish_now ? "READY" : "PENDING"}>
          {readiness.can_publish_now
            ? "Ready to publish"
            : `${readiness.blocker_count} blockers`}
        </ReadinessBadge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-primary-label">Adviser recommendation</p>
          <div className="flex flex-wrap items-center gap-2">
            <ReadinessBadge status={readiness.adviser_recommendation_status} />
            {readiness.adviser_review_decision ? (
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                {readiness.adviser_review_decision.replaceAll("_", " ")}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.adviser_recommendation_note || "No adviser note recorded yet."}
          </p>
          {readiness.adviser_recommendation_by ? (
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
              {readiness.adviser_recommendation_by}
              {readiness.adviser_recommendation_at
                ? ` | ${formatDateTime(readiness.adviser_recommendation_at)}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-primary-label">Panel approval</p>
          <div className="flex flex-wrap items-center gap-2">
            <ReadinessBadge
              status={
                readiness.panel_approval_status === "APPROVED"
                  ? "READY"
                  : readiness.panel_approval_status === "REJECTED"
                    ? "BLOCKED"
                    : "PENDING"
              }
            >
              {readiness.panel_approval_status.replaceAll("_", " ")}
            </ReadinessBadge>
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.panel_approval_note || "No panel approval note recorded yet."}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-[rgba(15,42,68,0.08)] pt-4">
        {readiness.checklist.map((check) => (
          <div
            key={check.id}
            className="flex flex-col gap-2 border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                {check.label}
              </p>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                {check.detail}
              </p>
            </div>
            <ReadinessBadge status={check.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarPublicationReadinessContent({
  readiness,
}: Pick<PublicationReadinessCardProps, "readiness">) {
  return (
    <div className="min-h-0 flex flex-1 flex-col space-y-5">
      <div className="rounded-[0.95rem] border border-[rgba(15,42,68,0.08)] bg-[linear-gradient(180deg,rgba(247,249,251,0.96),rgba(255,255,255,0.96))] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-primary-label">Readiness score</p>
            <div className="flex items-end gap-3">
              <p className="font-serif text-[2.2rem] leading-none text-[color:var(--color-primary)]">
                {readiness.readiness_score}%
              </p>
              <p className="pb-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                {readiness.blocker_count === 0
                  ? "Checklist complete"
                  : `${readiness.blocker_count} blockers`}
              </p>
            </div>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {getPrimaryReadinessMessage(readiness)}
            </p>
          </div>
          <ReadinessBadge status={readiness.can_publish_now ? "READY" : "PENDING"}>
            {readiness.can_publish_now ? "Ready to publish" : "Not ready"}
          </ReadinessBadge>
        </div>
      </div>

      <div className="space-y-4 border-t border-[rgba(15,42,68,0.08)] pt-4">
        <div className="flex flex-col gap-2 border-b border-[rgba(15,42,68,0.08)] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-primary-label">Adviser recommendation</p>
            <div className="flex flex-wrap items-center gap-2">
              <ReadinessBadge status={readiness.adviser_recommendation_status} />
              {readiness.adviser_review_decision ? (
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                  {readiness.adviser_review_decision.replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.adviser_recommendation_note || "No adviser note recorded yet."}
          </p>
          {readiness.adviser_recommendation_by ? (
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
              {readiness.adviser_recommendation_by}
              {readiness.adviser_recommendation_at
                ? ` | ${formatDateTime(readiness.adviser_recommendation_at)}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-primary-label">Panel approval</p>
            <ReadinessBadge
              status={
                readiness.panel_approval_status === "APPROVED"
                  ? "READY"
                  : readiness.panel_approval_status === "REJECTED"
                    ? "BLOCKED"
                    : "PENDING"
              }
            >
              {readiness.panel_approval_status.replaceAll("_", " ")}
            </ReadinessBadge>
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {readiness.panel_approval_note || "No panel approval note recorded yet."}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 border-t border-[rgba(15,42,68,0.08)] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-primary-label">Checklist details</p>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Review every publishing check in one scrollable list.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
            Scroll for full checklist
          </p>
        </div>

        <div className="mt-4 min-h-0 overflow-y-auto pr-1 xl:max-h-[24rem]">
          <div className="space-y-4">
            {readiness.checklist.map((check) => (
              <div
                key={check.id}
                className="flex flex-col gap-2 border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {check.label}
                  </p>
                  <ReadinessBadge status={check.status} />
                </div>
                <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                  {check.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicationReadinessCard({
  readiness,
  title = "Publication readiness",
  eyebrow = "Checklist",
  embedded = false,
  layout = "default",
  className = "",
}: PublicationReadinessCardProps) {
  if (embedded) {
    return <EmbeddedPublicationReadinessContent readiness={readiness} />;
  }

  if (layout === "sidebar") {
    return (
      <SurfaceCard
        eyebrow={eyebrow}
        title={title}
        className={`flex flex-col xl:max-h-[calc(100vh-9rem)] ${className}`.trim()}
      >
        <SidebarPublicationReadinessContent readiness={readiness} />
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard eyebrow={eyebrow} title={title} className={className}>
      <CardPublicationReadinessContent readiness={readiness} />
    </SurfaceCard>
  );
}
