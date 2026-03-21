"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicationReadinessCard } from "@/components/repository/publication-readiness-card";
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

const PANEL_APPROVAL_OPTIONS = [
  { value: "PENDING", label: "Pending evidence" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
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

function normalizePanelMembers(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
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
  const [defenseDate, setDefenseDate] = useState(thesis?.defense_date || "");
  const [panelMembers, setPanelMembers] = useState(
    thesis?.panel_members.join("\n") || "",
  );
  const [panelApprovalStatus, setPanelApprovalStatus] = useState(
    thesis?.panel_approval_status || "PENDING",
  );
  const [panelApprovalNote, setPanelApprovalNote] = useState(
    thesis?.panel_approval_note || "",
  );

  useEffect(() => {
    setVisibility(thesis?.visibility || "PRIVATE");
    setEmbargoUntil(thesis?.embargo_until || "");
    setRightsLicense(thesis?.rights_license || "");
    setPublicSlug(thesis?.public_slug || "");
    setDefenseDate(thesis?.defense_date || "");
    setPanelMembers(thesis?.panel_members.join("\n") || "");
    setPanelApprovalStatus(thesis?.panel_approval_status || "PENDING");
    setPanelApprovalNote(thesis?.panel_approval_note || "");
  }, [
    thesis?.defense_date,
    thesis?.embargo_until,
    thesis?.id,
    thesis?.panel_approval_note,
    thesis?.panel_approval_status,
    thesis?.panel_members,
    thesis?.public_slug,
    thesis?.rights_license,
    thesis?.visibility,
  ]);

  const hasUnsavedChecklistChanges = useMemo(() => {
    if (!thesis) {
      return false;
    }

    return (
      visibility !== thesis.visibility ||
      embargoUntil !== (thesis.embargo_until || "") ||
      rightsLicense !== thesis.rights_license ||
      publicSlug !== thesis.public_slug ||
      defenseDate !== (thesis.defense_date || "") ||
      panelMembers !== thesis.panel_members.join("\n") ||
      panelApprovalStatus !== thesis.panel_approval_status ||
      panelApprovalNote !== thesis.panel_approval_note
    );
  }, [
    defenseDate,
    embargoUntil,
    panelApprovalNote,
    panelApprovalStatus,
    panelMembers,
    publicSlug,
    rightsLicense,
    thesis,
    visibility,
  ]);

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
        defenseDate: defenseDate || null,
        panelMembers: normalizePanelMembers(panelMembers),
        panelApprovalStatus,
        panelApprovalNote,
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
      <PublicationReadinessCard readiness={thesis.publication_readiness} embedded />

      <section className="space-y-5 border-t border-[rgba(15,42,68,0.08)] pt-6">
        <div className="space-y-2">
          <p className="muted-label">Clearance records</p>
          <h2 className="text-[1.7rem] leading-tight">Publishing checklist editor</h2>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Record the institutional evidence librarians need before a thesis or
            capstone moves into publication.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Panel approval"
            value={panelApprovalStatus}
            className="workspace-field"
            onChange={(event) => setPanelApprovalStatus(event.target.value)}
          >
            {PANEL_APPROVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <TextInput
            label="Defense date"
            type="date"
            value={defenseDate}
            className="workspace-field"
            hint="Record the defense date used for repository clearance."
            onChange={(event) => setDefenseDate(event.target.value)}
          />
        </div>

        <label className="flex flex-col gap-2.5">
          <span className="text-primary-label">Panel members</span>
          <textarea
            value={panelMembers}
            onChange={(event) => setPanelMembers(event.target.value)}
            className="input-base min-h-32 resize-y"
            placeholder="Enter one panel member per line."
          />
          <span className="text-xs leading-6 text-[color:var(--color-muted)]">
            One member per line is easiest to review later.
          </span>
        </label>

        <label className="flex flex-col gap-2.5">
          <span className="text-primary-label">Panel approval note</span>
          <textarea
            value={panelApprovalNote}
            onChange={(event) => setPanelApprovalNote(event.target.value)}
            className="input-base min-h-28 resize-y"
            placeholder="Capture the panel decision, conditions, or reference number for the librarian record."
          />
        </label>
      </section>

      <section className="space-y-5 border-t border-[rgba(15,42,68,0.08)] pt-6">
        <div className="space-y-2">
          <p className="muted-label">Repository access</p>
          <h2 className="text-[1.7rem] leading-tight">Publication settings</h2>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Finalize the repository-facing fields that control how the published
            record will be exposed.
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

      <section className="space-y-4 border-t border-[rgba(15,42,68,0.08)] pt-6">
        <p className="text-primary-label">Current repository state</p>
        <p className="font-serif text-[1.65rem] leading-tight text-[color:var(--color-primary)]">
          {toTitleCase(thesis.status)}
        </p>
        <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
          {thesis.status === "APPROVED"
            ? "Approval is complete. Save any checklist edits, then publish when the blockers reach zero."
            : thesis.status === "PUBLISHED"
              ? "This record is already published and can be reverted or archived."
              : "Review and approval still need to complete before publishing is allowed."}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasUnsavedChecklistChanges}
          >
            {saveMutation.isPending ? "Saving..." : "Save checklist updates"}
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
              disabled={
                isPublishPending ||
                hasUnsavedChecklistChanges ||
                !thesis.publication_readiness.can_publish_now
              }
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

        {hasUnsavedChecklistChanges ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
            Save checklist updates before publishing.
          </p>
        ) : null}
      </section>
    </div>
  );
}
