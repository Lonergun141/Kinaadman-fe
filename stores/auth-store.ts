"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens, SessionUser } from "@/types/domain";
import { browserStorage, markStoreHydrated } from "./helpers/persistence";

interface AuthStoreState {
  tokens: AuthTokens | null;
  sessionUser: SessionUser | null;
  tenantId: string;
  hasHydrated: boolean;
  setSession: (payload: {
    tokens: AuthTokens;
    sessionUser: SessionUser;
    tenantId: string;
  }) => void;
  updateTokens: (tokens: AuthTokens) => void;
  updateSessionUser: (sessionUser: SessionUser) => void;
  setTenantId: (tenantId: string) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      tokens: null,
      sessionUser: null,
      tenantId: "",
      hasHydrated: false,
      setSession: ({ tokens, sessionUser, tenantId }) =>
        set({ tokens, sessionUser, tenantId }),
      updateTokens: (tokens) => set({ tokens }),
      updateSessionUser: (sessionUser) => set({ sessionUser }),
      setTenantId: (tenantId) => set({ tenantId }),
      clearSession: () =>
        set({
          tokens: null,
          sessionUser: null,
          tenantId: "",
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "kinaadman-auth-live",
      storage: browserStorage,
      partialize: (state) => ({
        tokens: state.tokens,
        sessionUser: state.sessionUser,
        tenantId: state.tenantId,
      }),
      onRehydrateStorage: markStoreHydrated<AuthStoreState>(),
    },
  ),
);
