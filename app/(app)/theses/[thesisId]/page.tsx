"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FullScreenMessage } from "@/components/ui/full-screen-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getThesis } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";
import { formatDateTime } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

const lifecycleSteps = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
] as const;

function getLifecycleIndex(status: string) {
  const index = lifecycleSteps.indexOf(status as (typeof lifecycleSteps)[number]);
  return index === -1 ? 0 : index;
}

export default function ThesisDetailPage() {
  const params = useParams<{ thesisId: string }>();
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);

  const thesisQuery = useQuery({
    queryKey: queryKeys.repository.thesisDetail(activeTenantId, params.thesisId),
    queryFn: () => getThesis(activeTenantId, params.thesisId),
    enabled: Boolean(activeTenantId && params.thesisId),
  });

  const thesis = thesisQuery.data;
  const lifecycleIndex = useMemo(
    () => getLifecycleIndex(thesis?.status || "DRAFT"),
    [thesis?.status],
  );

  if (thesisQuery.isPending) {
    return (
      <FullScreenMessage
        eyebrow="Loading"
        title="Loading thesis record"
        description="The frontend is fetching the thesis detail directly from the backend."
        actionHref="/repository"
        actionLabel="Back to repository"
      />
    );
  }

  if (thesisQuery.error || !thesis) {
    return (
      <FullScreenMessage
        eyebrow="Not found"
        title="Thesis record not available"
        description={
          thesisQuery.error?.message ||
          "The requested thesis could not be loaded from the current tenant."
        }
        actionHref="/repository"
        actionLabel="Back to repository"
      />
    );
  }

  return (
    <div className="page-shell space-y-8">
      <Breadcrumb
        items={[
          { label: "Repository", href: "/repository" },
          { label: "Thesis Detail" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="paper-panel p-7 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl space-y-4">
                <p className="muted-label">Thesis record</p>
                <h1 className="max-w-4xl text-[clamp(2.5rem,4vw,4.2rem)] leading-[0.94] tracking-[-0.04em] text-balance">
                  {thesis.title}
                </h1>
                <p className="text-muted max-w-2xl">
                  This view keeps citation, contributors, lifecycle, and archive
                  classification visible together so readers can assess the record
                  before moving into the full detail.
                </p>
              </div>
              <StatusBadge status={thesis.status} />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="pill-outline">
                {thesis.department?.name || "Unassigned department"}
              </span>
              <span className="pill-outline">
                {thesis.program?.name || "Unassigned program"}
              </span>
              <span className="pill-outline">{thesis.year}</span>
            </div>

            <div className="inline-note">
              <p className="text-primary-label">Research citation</p>
              <p className="mt-3 max-w-3xl font-serif text-[1.18rem] leading-8 text-[color:var(--color-primary)]">
                {thesis.authors.map((author) => author.display_name).join(", ")}.{" "}
                <em>{thesis.title}</em>. {thesis.program?.name || "Program not set"},{" "}
                {thesis.year}.
              </p>
            </div>
          </div>
        </div>

        <SurfaceCard eyebrow="Archive profile" title="Metadata at a glance">
          <dl className="space-y-4">
            {[
              {
                label: "Department",
                value: thesis.department?.name || "Unassigned",
              },
              { label: "Program", value: thesis.program?.name || "Unassigned" },
              { label: "Year", value: String(thesis.year) },
              { label: "Status", value: thesis.status.replaceAll("_", " ") },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-primary-label">{row.label}</dt>
                <dd className="text-muted mt-1">{row.value}</dd>
              </div>
            ))}
          </dl>
        </SurfaceCard>
      </section>

      <section className="paper-panel p-7 sm:p-8 lg:p-10">
        <p className="muted-label">Lifecycle</p>
        <div className="mt-8 relative">
          <div className="absolute left-0 right-0 top-4 h-[2px] bg-[rgba(15,42,68,0.08)]" />
          <div
            className="absolute left-0 top-4 h-[2px] bg-[color:var(--color-secondary)]"
            style={{
              width: `${(lifecycleIndex / (lifecycleSteps.length - 1)) * 100}%`,
            }}
          />
          <div className="relative grid gap-6 sm:grid-cols-5">
            {lifecycleSteps.map((step, index) => {
              const complete = index <= lifecycleIndex;

              return (
                <div
                  key={step}
                  className="flex min-w-0 flex-col items-center gap-3 text-center"
                >
                  <span
                    className={
                      complete
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-secondary)] text-[11px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_12px_20px_rgba(201,162,39,0.24)]"
                        : "flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-surface-high)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]"
                    }
                  >
                    {index + 1}
                  </span>
                  <span
                    className={
                      complete
                        ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)]"
                        : "text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]"
                    }
                  >
                    {step.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="space-y-5">
          <SurfaceCard eyebrow="Abstract" title="Research summary">
            <p className="font-serif text-[1.16rem] leading-8 text-[color:var(--color-muted-foreground)]">
              {thesis.abstract}
            </p>
          </SurfaceCard>

          <SurfaceCard eyebrow="Contributors" title="Authors and advisers">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--color-primary)]">
                  Authors
                </h3>
                <ul className="mt-3 space-y-3">
                  {thesis.authors.map((author) => (
                    <li
                      key={author.id}
                      className="card-item text-sm text-[color:var(--color-muted-foreground)]"
                    >
                      {author.display_name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[color:var(--color-primary)]">
                  Advisers
                </h3>
                <ul className="mt-3 space-y-3">
                  {thesis.advisers.map((adviser) => (
                    <li
                      key={adviser.id}
                      className="card-item text-sm text-[color:var(--color-muted-foreground)]"
                    >
                      {adviser.adviser_email || "Adviser email unavailable"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <SurfaceCard eyebrow="Timeline" title="Lifecycle dates">
            <dl className="space-y-4">
              {[
                { label: "Updated", value: formatDateTime(thesis.updated_at) },
                { label: "Submitted", value: formatDateTime(thesis.submitted_at) },
                { label: "Approved", value: formatDateTime(thesis.approved_at) },
                { label: "Published", value: formatDateTime(thesis.published_at) },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-primary-label">{row.label}</dt>
                  <dd className="text-muted mt-1">{row.value}</dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
