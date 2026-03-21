"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { TextInput } from "@/components/ui/text-input";
import { assignAuthor, createThesis, updateThesis } from "@/features/repository/api";
import {
  invalidateTenantRepositoryQueries,
  invalidateThesisDetailQuery,
} from "@/lib/query/invalidation";
import type { ThesisDetail } from "@/types/domain";

const THESIS_TYPE_OPTIONS = [
  { value: "THESIS", label: "Thesis" },
  { value: "CAPSTONE", label: "Capstone" },
  { value: "DISSERTATION", label: "Dissertation" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private draft" },
  { value: "CAMPUS_ONLY", label: "Campus only" },
  { value: "PUBLIC", label: "Public after approval" },
  { value: "EMBARGOED", label: "Embargoed after approval" },
] as const;

interface WorkspaceRecordSetupPanelProps {
  activeTenantId: string;
  currentMembershipId: string | null;
  currentUserId: string | null;
  sessionName: string;
  selectedThesis: ThesisDetail | null;
  onCreated: (thesisId: string) => void;
  onContinue?: () => void;
  onStartNew?: () => void;
}

export function WorkspaceRecordSetupPanel({
  activeTenantId,
  currentMembershipId,
  currentUserId,
  sessionName,
  selectedThesis,
  onCreated,
  onContinue,
  onStartNew,
}: WorkspaceRecordSetupPanelProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(selectedThesis);
  const [title, setTitle] = useState(selectedThesis?.title || "");
  const [year, setYear] = useState(
    String(selectedThesis?.year || new Date().getFullYear()),
  );
  const [thesisType, setThesisType] = useState(
    selectedThesis?.thesis_type || "THESIS",
  );
  const [visibility, setVisibility] = useState(
    selectedThesis?.visibility || "PRIVATE",
  );
  const [language, setLanguage] = useState(selectedThesis?.language || "English");

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await createThesis({
        tenantId: activeTenantId,
        title,
        abstract: selectedThesis?.abstract || "",
        year: Number(year) || new Date().getFullYear(),
        createdByMembershipId: currentMembershipId,
        actorMembershipId: currentMembershipId,
        thesisType,
        visibility,
        language,
      });

      await assignAuthor({
        tenantId: activeTenantId,
        thesisId: created.id,
        displayName: sessionName,
        userId: currentUserId || undefined,
      });

      return created;
    },
    onSuccess: async (created) => {
      await invalidateTenantRepositoryQueries(queryClient, activeTenantId);
      onCreated(created.id);
      onContinue?.();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThesis) {
        throw new Error("Create the thesis record first.");
      }

      return updateThesis({
        tenantId: activeTenantId,
        thesisId: selectedThesis.id,
        title,
        abstract: selectedThesis.abstract,
        year: Number(year) || new Date().getFullYear(),
        actorMembershipId: currentMembershipId,
        thesisType,
        visibility,
        language,
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
      onContinue?.();
    },
  });

  const errorMessage =
    createMutation.error?.message || saveMutation.error?.message || "";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="workspace-form-section space-y-6">
          <div className="space-y-2">
            <p className="muted-label">Stage 1</p>
            <h2 className="text-[1.85rem] leading-tight">
              {isEditing ? "Record basics" : "Create your research record"}
            </h2>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Start with the title, type, visibility, and language before you move
              into the academic details.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <TextInput
              label="Research title"
              hint="Use the formal title that should appear in the repository."
              value={title}
              className="workspace-field"
              onChange={(event) => setTitle(event.target.value)}
            />
            <TextInput
              label="Archive year"
              hint="This is the academic year shown in search and citation views."
              value={year}
              className="workspace-field"
              onChange={(event) => setYear(event.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <SelectField
              label="Record type"
              value={thesisType}
              className="workspace-field"
              onChange={(event) => setThesisType(event.target.value)}
            >
              {THESIS_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Visibility after approval"
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
              label="Language"
              hint="Example: English or Filipino."
              value={language}
              className="workspace-field"
              onChange={(event) => setLanguage(event.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Current stage</p>
          <p className="font-serif text-[1.7rem] leading-tight text-[color:var(--color-primary)]">
            {isEditing ? "Ready for academic details" : "Waiting for record creation"}
          </p>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            {isEditing
              ? "Save the basics if anything changed, then continue to the academic details."
              : "Create the record to unlock academic details, files, and submission."}
          </p>
        </section>

        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Actions</p>
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save and continue"}
                </Button>
                {onStartNew ? (
                  <Button variant="ghost" onClick={onStartNew}>
                    New record
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create record"}
              </Button>
            )}
          </div>
        </section>
      </div>

      {errorMessage ? (
        <div className="xl:col-span-2 rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
