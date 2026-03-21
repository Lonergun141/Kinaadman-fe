"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TenantContext } from "@/types/domain";
import { browserStorage, markStoreHydrated } from "./helpers/persistence";

interface TenantStoreState {
  tenantContext: TenantContext | null;
  hasHydrated: boolean;
  setTenantContext: (tenantContext: TenantContext) => void;
  clearTenantContext: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useTenantStore = create<TenantStoreState>()(
  persist(
    (set) => ({
      tenantContext: null,
      hasHydrated: false,
      setTenantContext: (tenantContext) => set({ tenantContext }),
      clearTenantContext: () => set({ tenantContext: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "kinaadman-tenant-live",
      storage: browserStorage,
      partialize: (state) => ({ tenantContext: state.tenantContext }),
      onRehydrateStorage: markStoreHydrated<TenantStoreState>(),
    },
  ),
);
