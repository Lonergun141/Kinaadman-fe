"use client";

import { createJSONStorage } from "zustand/middleware";

interface HydrationStoreState {
  setHasHydrated: (value: boolean) => void;
}

export const browserStorage = createJSONStorage(() => localStorage);

export function markStoreHydrated<T extends HydrationStoreState>() {
  return () => (state?: T) => {
    state?.setHasHydrated(true);
  };
}
