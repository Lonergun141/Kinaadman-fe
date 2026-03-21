"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { assignAdviser, updateThesis } from "@/features/repository/api";
import {
  invalidateTenantRepositoryQueries,
  invalidateThesisDetailQuery,
} from "@/lib/query/invalidation";
import type {
  DepartmentOption,
  ProgramOption,
  TenantMembership,
  ThesisDetail,
} from "@/types/domain";
import { getAvailablePrograms } from "../utils";

interface WorkspaceEditorProps {
  activeTenantId: string;
  currentMembershipId: string | null;
  selectedThesis: ThesisDetail | null;
  departments: DepartmentOption[];
  programs: ProgramOption[];
  adviserOptions: TenantMembership[];
  onSaved?: () => void;
  onReturnToCreate?: () => void;
}

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function WorkspaceEditor({
  activeTenantId,
  currentMembershipId,
  selectedThesis,
  departments,
  programs,
  adviserOptions,
  onSaved,
  onReturnToCreate,
}: WorkspaceEditorProps) {
  const queryClient = useQueryClient();
  const initialDepartmentId = selectedThesis?.department?.id || departments[0]?.id || "";
  const initialPrograms = getAvailablePrograms(programs, initialDepartmentId);
  const [departmentId, setDepartmentId] = useState(initialDepartmentId);
  const [programId, setProgramId] = useState(
    selectedThesis?.program?.id || initialPrograms[0]?.id || "",
  );
  const [abstract, setAbstract] = useState(selectedThesis?.abstract || "");
  const [researchCategory, setResearchCategory] = useState(
    selectedThesis?.research_category || "",
  );
  const [methodology, setMethodology] = useState(
    selectedThesis?.methodology || "",
  );
  const [collegeName, setCollegeName] = useState(
    selectedThesis?.college_name || "",
  );
  const [campusName, setCampusName] = useState(selectedThesis?.campus_name || "");
  const [rightsLicense, setRightsLicense] = useState(
    selectedThesis?.rights_license || "",
  );
  const [defenseDate, setDefenseDate] = useState(
    selectedThesis?.defense_date || "",
  );
  const [embargoUntil, setEmbargoUntil] = useState(
    selectedThesis?.embargo_until || "",
  );
  const [publicSlug, setPublicSlug] = useState(selectedThesis?.public_slug || "");
  const [keywordsText, setKeywordsText] = useState(
    selectedThesis?.keywords.map((keyword) => keyword.value).join(", ") || "",
  );
  const [panelMembersText, setPanelMembersText] = useState(
    selectedThesis?.panel_members.join(", ") || "",
  );
  const [adviserMembershipId, setAdviserMembershipId] = useState(
    adviserOptions.find(
      (membership) =>
        membership.user.email === selectedThesis?.advisers[0]?.adviser_email,
    )?.id || "",
  );
  const availablePrograms = useMemo(
    () => getAvailablePrograms(programs, departmentId),
    [departmentId, programs],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThesis) {
        throw new Error("Create the thesis record first.");
      }

      const updated = await updateThesis({
        tenantId: activeTenantId,
        thesisId: selectedThesis.id,
        title: selectedThesis.title,
        abstract,
        year: selectedThesis.year,
        departmentId: departmentId || undefined,
        programId: programId || undefined,
        actorMembershipId: currentMembershipId,
        researchCategory,
        methodology,
        collegeName,
        campusName,
        rightsLicense,
        panelMembers: splitCommaValues(panelMembersText),
        keywords: splitCommaValues(keywordsText),
        defenseDate: defenseDate || null,
        embargoUntil: embargoUntil || null,
        publicSlug: publicSlug || undefined,
      });

      if (!updated.advisers.length && adviserMembershipId) {
        await assignAdviser({
          tenantId: activeTenantId,
          thesisId: selectedThesis.id,
          adviserMembershipId,
        });
      }

      return updated;
    },
    onSuccess: async () => {
      if (!selectedThesis) {
        return;
      }

      await Promise.all([
        invalidateTenantRepositoryQueries(queryClient, activeTenantId),
        invalidateThesisDetailQuery(
          queryClient,
          activeTenantId,
          selectedThesis.id,
        ),
      ]);
      onSaved?.();
    },
  });

  if (!selectedThesis) {
    return (
      <EmptyState
        title="Create the record first"
        description="Finish the first stage to unlock the academic details form."
        action={
          onReturnToCreate ? (
            <Button variant="secondary" size="sm" onClick={onReturnToCreate}>
              Go to create record
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="workspace-form-section space-y-6">
          <div className="space-y-2">
            <p className="muted-label">Stage 2</p>
            <h2 className="text-[1.85rem] leading-tight">Complete the academic details</h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Add the metadata that will drive review, browsing, citation, and
              publication.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Department"
              value={departmentId}
              className="workspace-field"
              onChange={(event) => {
                const nextDepartmentId = event.target.value;
                const nextPrograms = getAvailablePrograms(programs, nextDepartmentId);

                setDepartmentId(nextDepartmentId);

                if (!nextPrograms.some((option) => option.id === programId)) {
                  setProgramId(nextPrograms[0]?.id || "");
                }
              }}
            >
              {departments.length ? null : <option value="">No departments yet</option>}
              {departments.map((departmentOption) => (
                <option key={departmentOption.id} value={departmentOption.id}>
                  {departmentOption.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Program"
              value={programId}
              className="workspace-field"
              onChange={(event) => setProgramId(event.target.value)}
              disabled={!availablePrograms.length}
              hint={
                !availablePrograms.length
                  ? "Programs will appear here once your school has set them up."
                  : undefined
              }
            >
              {availablePrograms.length ? null : <option value="">No programs yet</option>}
              {availablePrograms.map((programOption) => (
                <option key={programOption.id} value={programOption.id}>
                  {programOption.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="Research category"
              hint="Example: Artificial Intelligence, Civil Structures, or Education Technology."
              value={researchCategory}
              className="workspace-field"
              onChange={(event) => setResearchCategory(event.target.value)}
            />
            <TextInput
              label="Methodology"
              hint="Example: Qualitative, Mixed Methods, Experimental, or Design Science."
              value={methodology}
              className="workspace-field"
              onChange={(event) => setMethodology(event.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="College"
              value={collegeName}
              className="workspace-field"
              onChange={(event) => setCollegeName(event.target.value)}
            />
            <TextInput
              label="Campus"
              value={campusName}
              className="workspace-field"
              onChange={(event) => setCampusName(event.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="Defense date"
              type="date"
              value={defenseDate}
              className="workspace-field"
              onChange={(event) => setDefenseDate(event.target.value)}
            />
            <TextInput
              label="Embargo until"
              type="date"
              value={embargoUntil}
              className="workspace-field"
              hint="Use this if the record should stay restricted for a limited period after approval."
              onChange={(event) => setEmbargoUntil(event.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="Public page slug"
              hint="Optional. Leave blank to let the repository generate one."
              value={publicSlug}
              className="workspace-field"
              onChange={(event) => setPublicSlug(event.target.value)}
            />
            <TextInput
              label="Rights or license"
              hint="Example: All rights reserved or CC BY-NC 4.0."
              value={rightsLicense}
              className="workspace-field"
              onChange={(event) => setRightsLicense(event.target.value)}
            />
          </div>

          <SelectField
            label="Assigned adviser"
            value={adviserMembershipId}
            className="workspace-field"
            hint={
              selectedThesis.advisers.length
                ? "An adviser is already attached to this record."
                : "Choose the adviser who should receive the thesis in review."
            }
            disabled={Boolean(selectedThesis.advisers.length)}
            onChange={(event) => setAdviserMembershipId(event.target.value)}
          >
            <option value="">No adviser assigned</option>
            {adviserOptions.map((membership) => (
              <option key={membership.id} value={membership.id}>
                {membership.user.email}
              </option>
            ))}
          </SelectField>

          <label className="flex flex-col gap-2.5">
            <span className="text-primary-label">Keywords</span>
            <input
              value={keywordsText}
              onChange={(event) => setKeywordsText(event.target.value)}
              className="workspace-field"
              placeholder="Comma-separated keywords"
            />
            <span className="text-xs leading-6 text-[color:var(--color-muted)]">
              Add terms that will help readers and librarians find this work.
            </span>
          </label>

          <label className="flex flex-col gap-2.5">
            <span className="text-primary-label">Panel members</span>
            <input
              value={panelMembersText}
              onChange={(event) => setPanelMembersText(event.target.value)}
              className="workspace-field"
              placeholder="Comma-separated panel member names"
            />
          </label>

          <label className="flex flex-col gap-2.5">
            <span className="text-primary-label">Abstract</span>
            <textarea
              value={abstract}
              onChange={(event) => setAbstract(event.target.value)}
              className="workspace-field min-h-[15rem] resize-y"
              placeholder="Summarize the purpose, method, and contribution of the research."
            />
            <span className="text-xs leading-6 text-[color:var(--color-muted)]">
              Keep the abstract clear and readable so reviewers and repository
              readers can understand the work quickly.
            </span>
          </label>
        </section>
      </div>

      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Current record</p>
          <p className="font-serif text-[1.7rem] leading-tight text-[color:var(--color-primary)]">
            {selectedThesis.title}
          </p>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Save the metadata here, then continue to the file preparation stage.
          </p>
        </section>

        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Actions</p>
          <div className="flex flex-wrap gap-3">
            {onReturnToCreate ? (
              <Button variant="ghost" onClick={onReturnToCreate}>
                Back to basics
              </Button>
            ) : null}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save and continue"}
            </Button>
          </div>
        </section>
      </div>

      {saveMutation.error?.message ? (
        <div className="xl:col-span-2 rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {saveMutation.error.message}
        </div>
      ) : null}
    </div>
  );
}
