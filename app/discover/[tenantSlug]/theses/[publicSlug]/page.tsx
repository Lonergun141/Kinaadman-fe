"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TransitionLink } from "@/components/ui/transition-link";
import { getPublicCitations, getPublicThesis } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";
import { formatDate, formatFileSize, toTitleCase } from "@/lib/utils";
import type { CitationExport, Keyword, ThesisAuthor, ThesisFile } from "@/types/domain";

export default function PublicThesisDetailPage() {
  const params = useParams<{ tenantSlug: string; publicSlug: string }>();
  const tenantSlug = params.tenantSlug;
  const publicSlug = params.publicSlug;
  const [copiedFormat, setCopiedFormat] = useState("");

  const thesisQuery = useQuery({
    queryKey: queryKeys.repository.publicThesisDetail(tenantSlug, publicSlug),
    queryFn: () => getPublicThesis(tenantSlug, publicSlug),
    enabled: Boolean(tenantSlug && publicSlug),
  });

  const citationsQuery = useQuery({
    queryKey: queryKeys.repository.publicCitations(tenantSlug, publicSlug),
    queryFn: () => getPublicCitations(tenantSlug, publicSlug),
    enabled: Boolean(tenantSlug && publicSlug),
  });

  const thesis = thesisQuery.data;

  async function copyCitation(format: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    window.setTimeout(() => setCopiedFormat(""), 1800);
  }

  function downloadCitation(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  if (thesisQuery.isPending) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-[1040px] border border-[rgba(15,42,68,0.08)] bg-white px-6 py-8 text-sm text-[color:var(--color-muted-foreground)]">
          Loading public record...
        </div>
      </main>
    );
  }

  if (thesisQuery.error || !thesis) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-[1040px] border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.05)] px-6 py-8 text-sm text-[color:var(--color-error)]">
          {thesisQuery.error?.message || "This public record could not be loaded."}
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell space-y-6">
      <section className="mx-auto max-w-[1040px] border border-[rgba(15,42,68,0.08)] bg-white">
        <div className="border-b border-[rgba(15,42,68,0.08)] px-6 py-4">
          <TransitionLink
            href={`/discover/${tenantSlug}`}
            className="text-sm text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
            pendingClassName="opacity-80"
          >
            Back to public repository
          </TransitionLink>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-4">
            <p className="muted-label">Public repository record</p>
            <h1 className="max-w-4xl font-serif text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.96] text-[color:var(--color-primary)]">
              {thesis.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="pill-outline">{toTitleCase(thesis.thesis_type)}</span>
              <span className="pill-outline">{toTitleCase(thesis.visibility)}</span>
              <span className="pill-outline">{thesis.language}</span>
              <span className="pill-outline">{thesis.year}</span>
            </div>
            <p className="max-w-4xl text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              {thesis.authors.length
                ? thesis.authors.map((author: ThesisAuthor) => author.display_name).join(", ")
                : "Unknown author"}
            </p>
          </div>

          <div className="inline-note">
            <p className="text-primary-label">Abstract</p>
            <p className="mt-3 font-serif text-[1.08rem] leading-8 text-[color:var(--color-primary)]">
              {thesis.abstract}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section className="border border-[rgba(15,42,68,0.08)] bg-[rgba(247,244,237,0.42)] px-5 py-5">
                <p className="text-primary-label">Repository metadata</p>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Department", value: thesis.department?.name || "Not recorded" },
                    { label: "Program", value: thesis.program?.name || "Not recorded" },
                    { label: "Research category", value: thesis.research_category || "Not recorded" },
                    { label: "Methodology", value: thesis.methodology || "Not recorded" },
                    { label: "College", value: thesis.college_name || "Not recorded" },
                    { label: "Campus", value: thesis.campus_name || "Not recorded" },
                    { label: "Defense date", value: thesis.defense_date ? formatDate(thesis.defense_date) : "Not recorded" },
                    { label: "Rights or license", value: thesis.rights_license || "Not recorded" },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-primary-label">{row.label}</dt>
                      <dd className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5">
                <p className="text-primary-label">Keywords</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {thesis.keywords.length ? (
                    thesis.keywords.map((keyword: Keyword) => (
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
              </section>

              <section className="border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5">
                <p className="text-primary-label">Public file access</p>
                <div className="mt-4 space-y-3">
                  {thesis.files.length ? (
                    thesis.files.map((file: ThesisFile) => (
                      <div key={file.id} className="border-b border-[rgba(15,42,68,0.08)] pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                          {file.filename || file.label || file.kind}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                          {toTitleCase(file.kind)} | {formatFileSize(file.size_bytes || 0)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                      File listings are not available yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5">
                <p className="text-primary-label">Access</p>
                <p className="mt-3 font-serif text-[1.5rem] text-[color:var(--color-primary)]">
                  {thesis.can_download_public_files ? "Public download available" : "Metadata is public, files are restricted"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  {thesis.can_download_public_files
                    ? "This record is available for public reading and download."
                    : thesis.is_embargo_active
                      ? `The record is under embargo until ${formatDate(thesis.embargo_until)}.`
                      : "This record is currently restricted."}
                </p>
              </section>

              <section className="border border-[rgba(15,42,68,0.08)] bg-white px-5 py-5">
                <p className="text-primary-label">Citations</p>
                <div className="mt-4 space-y-4">
                  {(citationsQuery.data ?? []).map((citation: CitationExport) => (
                    <div key={citation.format} className="border-b border-[rgba(15,42,68,0.08)] pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                          {citation.format}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copyCitation(citation.format, citation.content)}
                            className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                          >
                            {copiedFormat === citation.format ? "Copied" : "Copy"}
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadCitation(citation.filename, citation.content)}
                            className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                        {citation.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
