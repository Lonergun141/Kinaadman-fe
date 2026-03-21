"use client";

import { create } from "zustand";

interface UiStoreState {
  sidebarOpen: boolean;
  navigationPendingHref: string | null;
  setSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
  startNavigation: (href: string) => void;
  clearNavigationPending: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  sidebarOpen: false,
  navigationPendingHref: null,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  startNavigation: (href) => set({ navigationPendingHref: href }),
  clearNavigationPending: () => set({ navigationPendingHref: null }),
}));
