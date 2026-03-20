"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";

export function RouteTransitionIndicator() {
  const pathname = usePathname();
  const navigationPendingHref = useUiStore(
    (state) => state.navigationPendingHref,
  );
  const clearNavigationPending = useUiStore(
    (state) => state.clearNavigationPending,
  );

  useEffect(() => {
    clearNavigationPending();
  }, [clearNavigationPending, pathname]);

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[140] transition-opacity duration-200 ${
        navigationPendingHref ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-1 bg-[rgba(15,42,68,0.08)]">
        <div className="route-progress-bar h-full" />
      </div>
      <span className="sr-only">
        {navigationPendingHref ? "Opening the next page." : ""}
      </span>
    </div>
  );
}
