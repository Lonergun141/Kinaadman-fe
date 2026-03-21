"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { bootstrapTenant, logoutFromBackend } from "@/features/auth/api";
import { AppShellLoadingScreen } from "@/components/ui/loading-shells";
import { canAccessPath, getDefaultRouteForRole, isAppRole } from "@/lib/access";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useUiStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Sidebar } from "./sidebar";
import { TenantThemeSync } from "./tenant-theme-sync";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement>(null);
  const railId = "sidebar-rail";

  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantId = useAuthStore((state) => state.tenantId);
  const clearSession = useAuthStore((state) => state.clearSession);

  const tenantContext = useTenantStore((state) => state.tenantContext);
  const setTenantContext = useTenantStore((state) => state.setTenantContext);
  const clearTenantContext = useTenantStore((state) => state.clearTenantContext);

  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const setActiveRole = useWorkspaceStore((state) => state.setActiveRole);
  const setActiveTenantId = useWorkspaceStore((state) => state.setActiveTenantId);

  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const clearNavigationPending = useUiStore(
    (state) => state.clearNavigationPending,
  );
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  const currentRole = sessionUser && isAppRole(sessionUser.role) ? sessionUser.role : null;

  useEffect(() => {
    if (!hasAuthHydrated) {
      return;
    }

    if (!sessionUser || !tenantId || !currentRole) {
      router.replace("/login");
      return;
    }

    if (activeRole !== currentRole) {
      setActiveRole(currentRole);
      return;
    }

    if (activeTenantId !== tenantId) {
      setActiveTenantId(tenantId);
      return;
    }

    if (!canAccessPath(currentRole, pathname)) {
      router.replace(getDefaultRouteForRole(currentRole));
    }
  }, [
    activeRole,
    activeTenantId,
    currentRole,
    hasAuthHydrated,
    pathname,
    router,
    sessionUser,
    setActiveRole,
    setActiveTenantId,
    tenantId,
  ]);

  useEffect(() => {
    if (!hasAuthHydrated || !sessionUser || !tenantId) {
      return;
    }

    if (tenantContext?.id === tenantId) {
      return;
    }

    let cancelled = false;

    void bootstrapTenant(tenantId)
      .then((context) => {
        if (!cancelled) {
          setTenantContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearSession();
          clearTenantContext();
          router.replace("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    clearSession,
    clearTenantContext,
    hasAuthHydrated,
    router,
    sessionUser,
    setTenantContext,
    tenantContext?.id,
    tenantId,
  ]);

  useEffect(() => {
    setSidebarOpen(false);
    clearNavigationPending();
  }, [clearNavigationPending, pathname, setSidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const container = sidebarRef.current;
    const selector =
      "a[href],button:not([disabled]),select:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex='-1'])";
    const focusable = container
      ? Array.from(container.querySelectorAll<HTMLElement>(selector))
      : [];

    focusable[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        return;
      }

      if (event.key !== "Tab" || !focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSidebarOpen, sidebarOpen]);

  if (
    !hasAuthHydrated ||
    !sessionUser ||
    !tenantId ||
    !currentRole ||
    !tenantContext ||
    !canAccessPath(currentRole, pathname)
  ) {
    return <AppShellLoadingScreen />;
  }

  return (
    <div className="archive-grid relative h-screen overflow-hidden">
      <TenantThemeSync tenantContext={tenantContext} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[rgba(201,162,39,0.12)] blur-3xl animate-[ambient-float_18s_ease-in-out_infinite]" />
        <div className="absolute right-[-9rem] top-[9rem] h-[22rem] w-[22rem] rounded-full bg-[rgba(15,42,68,0.08)] blur-3xl animate-[ambient-float_22s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[-8rem] left-[18%] h-[18rem] w-[18rem] rounded-full bg-[rgba(15,42,68,0.06)] blur-3xl animate-[ambient-float_20s_ease-in-out_infinite]" />
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[color:var(--color-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="relative h-full lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
        <Sidebar
          ref={sidebarRef}
          pathname={pathname}
          railId={railId}
          sidebarOpen={sidebarOpen}
          tenantContext={tenantContext}
          activeRole={currentRole}
          onNavigate={() => setSidebarOpen(false)}
        />

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-y-auto bg-[color:var(--color-background)]/80">
          <TopBar
            railId={railId}
            sidebarOpen={sidebarOpen}
            tenantContext={tenantContext}
            activeRole={currentRole}
            sessionUser={sessionUser}
            onOpenNavigation={() => setSidebarOpen(!sidebarOpen)}
            onSignOut={() => {
              void logoutFromBackend().finally(() => {
                router.replace("/login");
              });
            }}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-h-0 flex-1 pb-12 pt-2 outline-none lg:pb-16"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
