"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { browserStorage } from "./helpers/persistence";

export type AppRole =
  | "STUDENT"
  | "ADVISER"
  | "LIBRARIAN"
  | "TENANT_ADMIN"
  | "SUPER_ADMIN";

interface WorkspaceStoreState {
  activeRole: AppRole;
  activeTenantId: string;
  setActiveRole: (role: AppRole) => void;
  setActiveTenantId: (tenantId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set) => ({
      activeRole: "STUDENT",
      activeTenantId: "",
      setActiveRole: (role) => set({ activeRole: role }),
      setActiveTenantId: (activeTenantId) => set({ activeTenantId }),
    }),
    {
      name: "kinaadman-workspace-live",
      storage: browserStorage,
      partialize: (state) => ({
        activeRole: state.activeRole,
        activeTenantId: state.activeTenantId,
      }),
    },
  ),
);
