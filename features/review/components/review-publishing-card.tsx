"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { updateThesis } from "@/features/repository/api";
import {
  invalidateTenantRepositoryQueries,
  invalidateThesisDetailQuery,
} from "@/lib/query/invalidation";
import { toTitleCase } from "@/lib/utils";
import type { ThesisDetail } from "@/types/domain";

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private" },
  { value: "CAMPUS_ONLY", label: "Campus only" },
  { value: "PUBLIC", label: "Public" },
  { value: "EMBARGOED", label: "Embargoed" },
] as const;

interface ReviewPublishingCardProps {
  activeTenantId: string;
  currentMembershipId: string | null;
  thesis: ThesisDetail | null;
  note: string;
  onNoteChange: (value: string) => void;
  isPublishPending: boolean;
  isUnpublishPending: boolean;
  isArchivePending: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
}

function getPublishLabel(visibility: string) {
  switch (visibility) {
    case "PRIVATE":
      return "Publish privately";
    case "CAMPUS_ONLY":
      return "Publish for campus";
    case "EMBARGOED":
      return "Publish with embargo";
    default:
      return "Publish publicly";
  }
}

export function ReviewPublishingCard({
  activeTenantId,
  currentMembershipId,
  thesis,
  note,
  onNoteChange,
  isPublishPending,
  isUnpublishPending,
  isArchivePending,
  onPublish,
  onUnpublish,
  onArchive,
}: ReviewPublishingCardProps) {
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState(thesis?.visibility || "PRIVATE");
  const [embargoUntil, setEmbargoUntil] = useState(thesis?.embargo_until || "");
  const [rightsLicense, setRightsLicense] = useState(thesis?.rights_license || "");
  const [publicSlug, setPublicSlug] = useState(thesis?.public_slug || "");

  useEffect(() => {
    setVisibility(thesis?.visibility || "PRIVATE");
    setEmbargoUntil(thesis?.embargo_until || "");
    setRightsLicense(thesis?.rights_license || "");
    setPublicSlug(thesis?.public_slug || "");
  }, [thesis?.embargo_until, thesis?.id, thesis?.public_slug, thesis?.rights_license, thesis?.visibility]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!thesis) {
        throw new Error("Choose a record first.");
      }

      return updateThesis({
        tenantId: activeTenantId,
        thesisId: thesis.id,
        title: thesis.title,
        abstract: thesis.abstract,
        year: thesis.year,
        departmentId: thesis.department?.id,
        programId: thesis.program?.id,
        actorMembershipId: currentMembershipId,
        visibility,
        rightsLicense,
        publicSlug,
        embargoUntil: visibility === "EMBARGOED" ? embargoUntil || null : null,
      });
    },
    onSuccess: async () => {
      if (!thesis) {
        return;
      }

      await Promise.all([
        invalidateTenantRepositoryQueries(queryClient, activeTenantId),
        invalidateThesisDetailQuery(queryClient, activeTenantId, thesis.id),
      ]);
    },
  });

  const canPublish = useMemo(() => {
    if (!thesis) {
      return false;
    }

    if (thesis.status !== "APPROVED") {
      return false;
    }

    if (visibility === "EMBARGOED" && !embargoUntil) {
      return false;
    }

    return true;
  }, [embargoUntil, thesis, visibility]);

  if (!thesis) {
    return (
      <EmptyState
        title="No record selected"
        description="Choose a record from the queue first, then configure its publishing and access settings here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="workspace-form-section space-y-5">
        <div className="space-y-2">
          <p className="muted-label">Publishing</p>
          <h2 className="text-[1.7rem] leading-tight">Access and publishing controls</h2>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Set how this record should be exposed in the repository before you publish or archive it.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Visibility"
            value={visibility}
            className="workspace-field"
            onChange={(event) => setVisibility(event.target.value)}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <TextInput
            label="Embargo until"
            type="date"
            value={embargoUntil}
            className="workspace-field"
            disabled={visibility !== "EMBARGOED"}
            hint={
              visibility === "EMBARGOED"
                ? "Required before an embargoed record can be published."
                : "Only needed for embargoed records."
            }
            onChange={(event) => setEmbargoUntil(event.target.value)}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Rights or license"
            value={rightsLicense}
            className="workspace-field"
            hint="Example: All rights reserved or CC BY-NC 4.0."
            onChange={(event) => setRightsLicense(event.target.value)}
          />
          <TextInput
            label="Public slug"
            value={publicSlug}
            className="workspace-field"
            hint="Leave blank to keep the generated repository slug."
            onChange={(event) => setPublicSlug(event.target.value)}
          />
        </div>

        <label className="flex flex-col gap-2.5">
          <span className="text-primary-label">Publishing note</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            className="input-base min-h-28 resize-y"
            placeholder="Capture the reason for this publishing or archive decision."
          />
        </label>

        {saveMutation.error?.message ? (
          <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
            {saveMutation.error.message}
          </div>
        ) : null}
      </section>

      <section className="workspace-form-section space-y-4">
        <p className="text-primary-label">Current repository state</p>
        <p className="font-serif text-[1.65rem] leading-tight text-[color:var(--color-primary)]">
          {toTitleCase(thesis.status)}
        </p>
        <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
          {thesis.status === "APPROVED"
            ? "This record is ready for publishing."
            : thesis.status === "PUBLISHED"
              ? "This record is already published and can be reverted or archived."
              : "Review and approval must be completed before publishing."}
        </p>

        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-primary-label">Visibility</dt>
            <dd className="text-muted mt-1">{toTitleCase(visibility)}</dd>
          </div>
          <div>
            <dt className="text-primary-label">Embargo</dt>
            <dd className="text-muted mt-1">
              {visibility === "EMBARGOED" && embargoUntil ? embargoUntil : "Not set"}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save access settings"}
          </Button>

          {thesis.status === "PUBLISHED" ? (
            <Button
              size="sm"
              onClick={onUnpublish}
              disabled={isUnpublishPending}
            >
              {isUnpublishPending ? "Reverting..." : "Unpublish"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={!canPublish || isPublishPending}
            >
              {isPublishPending ? "Publishing..." : getPublishLabel(visibility)}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onArchive}
            disabled={isArchivePending || thesis.status === "ARCHIVED"}
          >
            {isArchivePending ? "Archiving..." : "Archive record"}
          </Button>
        </div>
      </section>
    </div>
  );
}
