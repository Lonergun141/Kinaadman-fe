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
import { formatDate, formatDateTime, formatFileSize, toTitleCase } from "@/lib/utils";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

function renderValue(value: string | null | undefined) {
  return value && value.trim() ? value : "Not recorded";
}

export default function ThesisDetailPage() {
  const params = useParams<{ thesisId: string }>();
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const tenantContext = useTenantStore((state) => state.tenantContext);

  const thesisQuery = useQuery({
    queryKey: queryKeys.repository.thesisDetail(activeTenantId, params.thesisId),
    queryFn: () => getThesis(activeTenantId, params.thesisId),
    enabled: Boolean(activeTenantId && params.thesisId),
  });

  const thesis = thesisQuery.data;
  const publicPath =
    thesis?.public_slug && tenantContext?.slug
      ? `/discover/${tenantContext.slug}/theses/${thesis.public_slug}`
      : null;
  const citationLine = useMemo(() => {
    if (!thesis) {
      return "";
    }

    const authorLine = thesis.authors.length
      ? thesis.authors.map((author) => author.display_name).join(", ")
      : "Unknown author";
    const programLine =
      thesis.program?.name || thesis.department?.name || "Institutional repository";

    return `${authorLine}. ${thesis.title}. ${programLine}, ${thesis.year}.`;
  }, [thesis]);

  if (thesisQuery.isPending) {
    return (
      <FullScreenMessage
        eyebrow="Loading"
        title="Loading thesis record"
        description="Opening the thesis record and gathering its repository details."
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
    <div className="page-shell space-y-6">
      <Breadcrumb
        items={[
          { label: "Repository", href: "/repository" },
          { label: "Thesis detail" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="paper-panel p-7 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl space-y-4">
                <p className="muted-label">Repository record</p>
                <h1 className="max-w-4xl text-[clamp(2.3rem,4vw,4rem)] leading-[0.96] tracking-[-0.04em] text-balance">
                  {thesis.title}
                </h1>
                <p className="text-muted max-w-3xl">{citationLine}</p>
              </div>
              <StatusBadge status={thesis.status} />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="pill-outline">{toTitleCase(thesis.thesis_type)}</span>
              <span className="pill-outline">{toTitleCase(thesis.visibility)}</span>
              <span className="pill-outline">{thesis.language}</span>
              <span className="pill-outline">{thesis.year}</span>
            </div>

            <div className="inline-note">
              <p className="text-primary-label">Abstract</p>
              <p className="mt-3 max-w-4xl font-serif text-[1.12rem] leading-8 text-[color:var(--color-primary)]">
                {thesis.abstract || "No abstract has been provided yet."}
              </p>
            </div>
          </div>
        </div>

        <SurfaceCard eyebrow="Publishing" title="Repository status">
          <dl className="space-y-4">
            {[
              { label: "Visibility", value: toTitleCase(thesis.visibility) },
              { label: "Type", value: toTitleCase(thesis.thesis_type) },
              { label: "Public slug", value: renderValue(thesis.public_slug) },
              { label: "Embargo", value: thesis.embargo_until ? formatDate(thesis.embargo_until) : "Not set" },
              { label: "Published", value: formatDateTime(thesis.published_at) },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-primary-label">{row.label}</dt>
                <dd className="text-muted mt-1">{row.value}</dd>
              </div>
            ))}
          </dl>
          {publicPath ? (
            <div className="mt-5 border-t border-[rgba(15,42,68,0.08)] pt-5">
              <p className="text-primary-label">Public URL</p>
              <a
                href={publicPath}
                className="mt-2 block break-all text-sm leading-7 text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
              >
                {publicPath}
              </a>
            </div>
          ) : null}
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
          <SurfaceCard eyebrow="Metadata" title="Academic classification">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { label: "Department", value: thesis.department?.name || "Not assigned" },
                { label: "Program", value: thesis.program?.name || "Not assigned" },
                { label: "College", value: renderValue(thesis.college_name) },
                { label: "Campus", value: renderValue(thesis.campus_name) },
                { label: "Research category", value: renderValue(thesis.research_category) },
                { label: "Methodology", value: renderValue(thesis.methodology) },
                { label: "Defense date", value: thesis.defense_date ? formatDate(thesis.defense_date) : "Not recorded" },
                { label: "Rights or license", value: renderValue(thesis.rights_license) },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-primary-label">{row.label}</dt>
                  <dd className="text-muted mt-1">{row.value}</dd>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Contributors" title="Authors, advisers, and keywords">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-primary-label">Authors</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  {thesis.authors.length ? (
                    thesis.authors.map((author) => (
                      <li key={author.id}>{author.display_name}</li>
                    ))
                  ) : (
                    <li>No authors recorded.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-primary-label">Advisers</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  {thesis.advisers.length ? (
                    thesis.advisers.map((adviser) => (
                      <li key={adviser.id}>{adviser.adviser_email || "Adviser email unavailable"}</li>
                    ))
                  ) : (
                    <li>No advisers recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-primary-label">Keywords</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {thesis.keywords.length ? (
                    thesis.keywords.map((keyword) => (
                      <span key={keyword.id} className="pill-outline">
                        {keyword.value}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-[color:var(--color-muted-foreground)]">
                      No keywords recorded.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-primary-label">Panel members</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  {thesis.panel_members.length ? (
                    thesis.panel_members.map((member) => <li key={member}>{member}</li>)
                  ) : (
                    <li>No panel members recorded.</li>
                  )}
                </ul>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Workflow" title="Status history">
            <div className="space-y-4">
              {thesis.status_history.length ? (
                thesis.status_history.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {toTitleCase(item.from_status || "Draft")} to {toTitleCase(item.to_status)}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      {item.note || "No note recorded."}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {formatDateTime(item.changed_at)}
                      {item.changed_by_email ? ` | ${item.changed_by_email}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  No workflow history has been recorded yet.
                </p>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <SurfaceCard eyebrow="Review" title="Review decisions">
            <div className="space-y-4">
              {thesis.reviews.length ? (
                thesis.reviews.map((review) => (
                  <div key={review.id} className="border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {toTitleCase(review.decision)}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      {review.comment || "No comment recorded."}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {review.reviewer_email || "Reviewer not recorded"} | {formatDateTime(review.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  No review decisions have been recorded yet.
                </p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Files" title="Current file set">
            <div className="space-y-4">
              {thesis.files.length ? (
                thesis.files.map((file) => (
                  <div key={file.id} className="border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {file.filename || file.label || file.kind}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      {toTitleCase(file.kind)} | {toTitleCase(file.access_level)} | Version {file.version_number}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {formatFileSize(file.size_bytes || 0)} | {formatDateTime(file.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  No repository files have been recorded yet.
                </p>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Versions" title="Metadata versions">
            <div className="space-y-4">
              {thesis.metadata_versions.length ? (
                thesis.metadata_versions.slice(0, 6).map((version) => (
                  <div key={version.id} className="border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      Version {version.version_number}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      {version.note || "Snapshot recorded"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                      {formatDateTime(version.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  No metadata versions recorded yet.
                </p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
