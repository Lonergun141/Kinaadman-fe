"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
      });

      await assignAuthor({
        tenantId: activeTenantId,
        thesisId: created.id,
        displayName: sessionName,
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

  if (!selectedThesis) {
    return (
      <EmptyState
        title="No selected draft"
        description="Choose a draft from the queue or create a new one."
        action={
          <Button
            size="sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create first draft"}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-lowest)] px-4 py-3 text-sm text-[color:var(--color-muted-foreground)]">
        The current backend does not expose thesis ownership in list responses,
        so this workspace shows tenant-visible authoring records rather than a
        strict &quot;my theses&quot; feed.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <SelectField
          label="Department"
          value={departmentId}
          onChange={(event) => {
            const nextDepartmentId = event.target.value;
            const nextPrograms = getAvailablePrograms(programs, nextDepartmentId);

            setDepartmentId(nextDepartmentId);

            if (!nextPrograms.some((program) => program.id === programId)) {
              setProgramId(nextPrograms[0]?.id || "");
            }
          }}
        >
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Program"
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
          disabled={!availablePrograms.length}
        >
          {availablePrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </SelectField>
        <TextInput
          label="Year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
        <SelectField
          label="Assigned adviser"
          value={adviserMembershipId}
          hint={
            selectedThesis.advisers.length
              ? "The current backend only adds advisers; replacing them is not supported."
              : "Optional at draft stage."
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
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-primary-label">Abstract</span>
        <textarea
          value={abstract}
          onChange={(event) => setAbstract(event.target.value)}
          className="input-base min-h-40 resize-y"
        />
      </label>
      {errorMessage ? (
        <div className="rounded-lg bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
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
          {createMutation.isPending ? "Creating..." : "Create new draft"}
        </Button>
      </div>
    </div>
  );
}
