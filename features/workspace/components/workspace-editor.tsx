"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { assignAdviser, assignAuthor, createThesis, submitThesis, updateThesis } from "@/features/repository/api";
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
import {
  buildWorkspaceEditorDefaults,
  getAvailablePrograms,
} from "../utils";

interface WorkspaceEditorProps {
  activeTenantId: string;
  currentMembershipId: string | null;
  currentUserId: string | null;
  sessionName: string;
  selectedThesis: ThesisDetail | null;
  departments: DepartmentOption[];
  programs: ProgramOption[];
  adviserOptions: TenantMembership[];
  onCreated: (thesisId: string) => void;
}

export function WorkspaceEditor({
  activeTenantId,
  currentMembershipId,
  currentUserId,
  sessionName,
  selectedThesis,
  departments,
  programs,
  adviserOptions,
  onCreated,
}: WorkspaceEditorProps) {
  const queryClient = useQueryClient();
  const defaults = buildWorkspaceEditorDefaults({
    selectedThesis,
    departments,
    programs,
    adviserOptions,
  });

  const [title, setTitle] = useState(defaults.title);
  const [departmentId, setDepartmentId] = useState(defaults.departmentId);
  const [programId, setProgramId] = useState(defaults.programId);
  const [year, setYear] = useState(defaults.year);
  const [abstract, setAbstract] = useState(defaults.abstract);
  const [adviserMembershipId, setAdviserMembershipId] = useState(
    defaults.adviserMembershipId,
  );

  const availablePrograms = useMemo(
    () => getAvailablePrograms(programs, departmentId),
    [departmentId, programs],
  );
  const isEditing = Boolean(selectedThesis);

  async function persistDraft(thesisId: string) {
    const updated = await updateThesis({
      tenantId: activeTenantId,
      thesisId,
      title,
      abstract,
      year: Number(year) || new Date().getFullYear(),
      departmentId: departmentId || undefined,
      programId: programId || undefined,
    });

    if (!updated.advisers.length && adviserMembershipId) {
      await assignAdviser({
        tenantId: activeTenantId,
        thesisId,
        adviserMembershipId,
      });
    }

    return updated;
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createThesis({
        tenantId: activeTenantId,
        title,
        abstract,
        year: Number(year) || new Date().getFullYear(),
        departmentId: departmentId || undefined,
        programId: programId || undefined,
        createdByMembershipId: currentMembershipId,
      });

      await assignAuthor({
        tenantId: activeTenantId,
        thesisId: created.id,
        displayName: sessionName,
        userId: currentUserId || undefined,
      });

      if (adviserMembershipId) {
        await assignAdviser({
          tenantId: activeTenantId,
          thesisId: created.id,
          adviserMembershipId,
        });
      }

      return created;
    },
    onSuccess: async (created) => {
      await invalidateTenantRepositoryQueries(queryClient, activeTenantId);
      onCreated(created.id);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThesis) {
        throw new Error("Select a thesis draft first.");
      }

      return persistDraft(selectedThesis.id);
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
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThesis) {
        throw new Error("Select a thesis draft first.");
      }

      await persistDraft(selectedThesis.id);

      return submitThesis({
        tenantId: activeTenantId,
        thesisId: selectedThesis.id,
        submitterMembershipId: currentMembershipId,
      });
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
    },
  });

  const errorMessage =
    createMutation.error?.message ||
    saveMutation.error?.message ||
    submitMutation.error?.message ||
    "";

  return (
    <div className="space-y-8">
      <div className="inline-note">
        <p className="muted-label">
          {isEditing ? "Editing selected draft" : "Start a new thesis record"}
        </p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
          {isEditing
            ? "This desk is limited to thesis and capstone records where you are listed as an author."
            : "Create your thesis record first, then continue refining it before sending it into review."}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <TextInput
          label="Research title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextInput
          label="Publication year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Department"
          value={departmentId}
          onChange={(event) => {
            const nextDepartmentId = event.target.value;
            const nextPrograms = getAvailablePrograms(programs, nextDepartmentId);

            setDepartmentId(nextDepartmentId);

            if (!nextPrograms.some((programOption) => programOption.id === programId)) {
              setProgramId(nextPrograms[0]?.id || "");
            }
          }}
        >
          {departments.length ? null : (
            <option value="">No departments yet</option>
          )}
          {departments.map((departmentOption) => (
            <option key={departmentOption.id} value={departmentOption.id}>
              {departmentOption.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Program"
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          disabled={!availablePrograms.length}
          hint={!availablePrograms.length ? "Create a program first in tenant policy." : undefined}
        >
          {availablePrograms.length ? null : (
            <option value="">No programs yet</option>
          )}
          {availablePrograms.map((programOption) => (
            <option key={programOption.id} value={programOption.id}>
              {programOption.name}
            </option>
          ))}
        </SelectField>
      </div>

      <SelectField
        label="Assigned adviser"
        value={adviserMembershipId}
        hint={
          selectedThesis?.advisers.length
            ? "The current backend only adds advisers; replacing them is not supported."
            : "Optional at draft stage."
        }
        disabled={Boolean(selectedThesis?.advisers.length)}
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
        <span className="text-primary-label">Abstract</span>
        <textarea
          value={abstract}
          onChange={(event) => setAbstract(event.target.value)}
          className="input-base min-h-48 resize-y"
          placeholder="Summarize the purpose, method, and contribution of the research."
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <p className="text-primary-label">Workflow actions</p>
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || submitMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save draft"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => submitMutation.mutate()}
                  disabled={saveMutation.isPending || submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit thesis"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create another record"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create first draft"}
              </Button>
            )}
          </div>
        </div>

        <div className="inline-note">
          <p className="text-primary-label">Current state</p>
          <p className="mt-2 font-serif text-[1.45rem] leading-tight text-[color:var(--color-primary)]">
            {isEditing ? "Draft open for editing" : "Composer ready"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {isEditing
              ? "Save changes before submitting to keep metadata, adviser routing, and academic structure aligned."
              : "Create the record first, then continue refining it from the queue."}
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
