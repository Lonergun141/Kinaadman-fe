"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDefaultRouteForRole, isAppRole } from "@/lib/access";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!sessionUser || !isAppRole(sessionUser.role)) {
      router.replace("/login");
      return;
    }

    router.replace(getDefaultRouteForRole(sessionUser.role));
  }, [hasHydrated, router, sessionUser]);

  return <div className="min-h-screen bg-[color:var(--color-background)]" />;
}
