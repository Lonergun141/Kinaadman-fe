"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { browserStorage } from "./helpers/persistence";

export type WorkspacePreparedFileKind = "MAIN_PDF" | "ATTACHMENT";

export interface WorkspacePreparedFile {
  id: string;
  tenantId: string;
  thesisId: string;
  kind: WorkspacePreparedFileKind;
  name: string;
  contentType: string;
  sizeBytes: number;
  preparedAt: string;
}

interface StageWorkspaceFilesPayload {
  tenantId: string;
  thesisId: string;
  kind: WorkspacePreparedFileKind;
  files: Array<{
    name: string;
    contentType: string;
    sizeBytes: number;
  }>;
}

interface RemoveWorkspacePreparedFilePayload {
  tenantId: string;
  thesisId: string;
  fileId: string;
}

interface WorkspaceUploadStoreState {
  preparedFiles: Record<string, WorkspacePreparedFile[]>;
  stageFiles: (payload: StageWorkspaceFilesPayload) => void;
  removePreparedFile: (payload: RemoveWorkspacePreparedFilePayload) => void;
  clearPreparedFiles: (tenantId: string, thesisId: string) => void;
}

function getDraftUploadKey(tenantId: string, thesisId: string) {
  return `${tenantId}:${thesisId}`;
}

function createPreparedFileId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `prepared-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export const useWorkspaceUploadStore = create<WorkspaceUploadStoreState>()(
  persist(
    (set) => ({
      preparedFiles: {},
      stageFiles: ({ tenantId, thesisId, kind, files }) =>
        set((state) => {
          const uploadKey = getDraftUploadKey(tenantId, thesisId);
          const currentFiles = state.preparedFiles[uploadKey] || [];
          const preservedFiles =
            kind === "MAIN_PDF"
              ? currentFiles.filter((file) => file.kind !== "MAIN_PDF")
              : currentFiles;
          const nextFiles = files.map((file) => ({
            id: createPreparedFileId(),
            tenantId,
            thesisId,
            kind,
            name: file.name,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
            preparedAt: new Date().toISOString(),
          }));

          return {
            preparedFiles: {
              ...state.preparedFiles,
              [uploadKey]:
                kind === "MAIN_PDF"
                  ? [...preservedFiles, ...nextFiles.slice(0, 1)]
                  : [...preservedFiles, ...nextFiles],
            },
          };
        }),
      removePreparedFile: ({ tenantId, thesisId, fileId }) =>
        set((state) => {
          const uploadKey = getDraftUploadKey(tenantId, thesisId);
          const currentFiles = state.preparedFiles[uploadKey] || [];
          const nextFiles = currentFiles.filter((file) => file.id !== fileId);

          return {
            preparedFiles: {
              ...state.preparedFiles,
              [uploadKey]: nextFiles,
            },
          };
        }),
      clearPreparedFiles: (tenantId, thesisId) =>
        set((state) => ({
          preparedFiles: {
            ...state.preparedFiles,
            [getDraftUploadKey(tenantId, thesisId)]: [],
          },
        })),
    }),
    {
      name: "kinaadman-workspace-prepared-files",
      storage: browserStorage,
      partialize: (state) => ({
        preparedFiles: state.preparedFiles,
      }),
    },
  ),
);
