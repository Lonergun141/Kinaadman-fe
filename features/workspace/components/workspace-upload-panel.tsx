"use client";

import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatFileSize } from "@/lib/utils";
import {
  useWorkspaceUploadStore,
  type WorkspacePreparedFile,
} from "@/stores/workspace-upload-store";
import type { ThesisDetail } from "@/types/domain";

const EMPTY_PREPARED_FILES: WorkspacePreparedFile[] = [];

interface WorkspaceUploadPanelProps {
  activeTenantId: string;
  thesis: ThesisDetail | null;
  isLoading?: boolean;
  onContinue?: () => void;
  onReturnToEdit?: () => void;
}

function PreparedFileRow({
  file,
  kindLabel,
  canEdit,
  onRemove,
}: {
  file: WorkspacePreparedFile;
  kindLabel: string;
  canEdit: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[0.85rem] bg-[rgba(255,255,255,0.78)] p-4 shadow-[inset_0_0_0_1px_rgba(15,42,68,0.06),0_16px_28px_rgba(0,21,42,0.04)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">
            {file.name}
          </p>
          <p className="text-xs leading-6 text-[color:var(--color-muted-foreground)]">
            {kindLabel} | {formatFileSize(file.sizeBytes)} | Prepared{" "}
            {formatDateTime(file.preparedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill-outline">Prepared</span>
          {canEdit ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceUploadPanel({
  activeTenantId,
  thesis,
  isLoading = false,
  onContinue,
  onReturnToEdit,
}: WorkspaceUploadPanelProps) {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);
  const uploadKey = thesis ? `${activeTenantId}:${thesis.id}` : null;
  const preparedFiles = useWorkspaceUploadStore((state) =>
    uploadKey
      ? state.preparedFiles[uploadKey] ?? EMPTY_PREPARED_FILES
      : EMPTY_PREPARED_FILES,
  );
  const stageFiles = useWorkspaceUploadStore((state) => state.stageFiles);
  const removePreparedFile = useWorkspaceUploadStore(
    (state) => state.removePreparedFile,
  );

  const mainPdf = useMemo(
    () => preparedFiles.find((file) => file.kind === "MAIN_PDF") || null,
    [preparedFiles],
  );
  const attachments = useMemo(
    () => preparedFiles.filter((file) => file.kind === "ATTACHMENT"),
    [preparedFiles],
  );

  if (isLoading) {
    return (
      <EmptyState
        title="Loading upload step"
        description="Opening your selected record so you can prepare the required files."
      />
    );
  }

  if (!thesis) {
    return (
      <EmptyState
        title="Create or open a draft first"
        description="The upload step becomes available after you open one of your records or create a new thesis draft."
        action={
          onReturnToEdit ? (
            <Button variant="secondary" size="sm" onClick={onReturnToEdit}>
              Go to draft details
            </Button>
          ) : null
        }
      />
    );
  }

  const draftIsLocked = thesis.status !== "DRAFT";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.75fr)]">
      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <div className="space-y-2">
            <p className="muted-label">Upload step</p>
            <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              Add the main PDF and any attachments.
            </p>
          </div>
        </section>

        <section className="workspace-form-section space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-primary-label">Main thesis PDF</p>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Required before submission.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={draftIsLocked}
              onClick={() => pdfInputRef.current?.click()}
            >
              {mainPdf ? "Replace PDF" : "Add PDF"}
            </Button>
          </div>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              if (!thesis) {
                return;
              }

              const nextFile = event.target.files?.[0];

              if (!nextFile) {
                return;
              }

              stageFiles({
                tenantId: activeTenantId,
                thesisId: thesis.id,
                kind: "MAIN_PDF",
                files: [
                  {
                    name: nextFile.name,
                    contentType: nextFile.type || "application/pdf",
                    sizeBytes: nextFile.size,
                  },
                ],
              });
              event.target.value = "";
            }}
          />

          {mainPdf ? (
            <PreparedFileRow
              file={mainPdf}
              kindLabel="Main PDF"
              canEdit={!draftIsLocked}
              onRemove={() =>
                removePreparedFile({
                  tenantId: activeTenantId,
                  thesisId: thesis.id,
                  fileId: mainPdf.id,
                })
              }
            />
          ) : (
            <div className="rounded-[0.85rem] bg-[rgba(255,255,255,0.72)] px-5 py-5 text-sm leading-7 text-[color:var(--color-muted-foreground)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.06)]">
              No PDF has been prepared yet. Add the main file here before moving to
              the final submission step.
            </div>
          )}
        </section>

        <section className="workspace-form-section space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-primary-label">Supporting attachments</p>
              <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                Optional files.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={draftIsLocked}
              onClick={() => attachmentsInputRef.current?.click()}
            >
              Add attachments
            </Button>
          </div>

          <input
            ref={attachmentsInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (!thesis) {
                return;
              }

              const nextFiles = Array.from(event.target.files || []);

              if (!nextFiles.length) {
                return;
              }

              stageFiles({
                tenantId: activeTenantId,
                thesisId: thesis.id,
                kind: "ATTACHMENT",
                files: nextFiles.map((file) => ({
                  name: file.name,
                  contentType: file.type || "application/octet-stream",
                  sizeBytes: file.size,
                })),
              });
              event.target.value = "";
            }}
          />

          {attachments.length ? (
            <div className="space-y-3">
              {attachments.map((file) => (
                <PreparedFileRow
                  key={file.id}
                  file={file}
                  kindLabel="Attachment"
                  canEdit={!draftIsLocked}
                  onRemove={() =>
                    removePreparedFile({
                      tenantId: activeTenantId,
                      thesisId: thesis.id,
                      fileId: file.id,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[0.85rem] bg-[rgba(255,255,255,0.72)] px-5 py-5 text-sm leading-7 text-[color:var(--color-muted-foreground)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.06)]">
              No supporting files yet. Attachments are optional, but add them here if
              they belong with the final thesis record.
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Upload summary</p>
          <p className="font-serif text-[1.65rem] leading-tight text-[color:var(--color-primary)]">
            {mainPdf ? "Files prepared for submission" : "Main document still needed"}
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="text-primary-label">Current record</dt>
              <dd className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                {thesis.title}
              </dd>
            </div>
            <div>
              <dt className="text-primary-label">Main PDF</dt>
              <dd className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                {mainPdf ? "Prepared" : "Not prepared"}
              </dd>
            </div>
            <div>
              <dt className="text-primary-label">Attachments</dt>
              <dd className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="workspace-form-section space-y-4">
          <p className="text-primary-label">Next step</p>
          <p className="text-sm leading-6 text-[color:var(--color-muted-foreground)]">
            Continue when the PDF is ready.
          </p>
          <div className="flex flex-wrap gap-3">
            {onReturnToEdit ? (
              <Button variant="ghost" size="sm" onClick={onReturnToEdit}>
                Back to draft details
              </Button>
            ) : null}
            {onContinue ? (
              <Button size="sm" onClick={onContinue}>
                Continue to submit
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
