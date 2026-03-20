"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { loginWithBackend } from "@/features/auth/api";
import { getDefaultRouteForRole, isAppRole } from "@/lib/access";
import { frontendEnv } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState(frontendEnv.defaultTenantId);

  useEffect(() => {
    if (!hasHydrated || !sessionUser || !isAppRole(sessionUser.role)) {
      return;
    }

    router.replace(getDefaultRouteForRole(sessionUser.role));
  }, [hasHydrated, router, sessionUser]);

  const loginMutation = useMutation({
    mutationFn: loginWithBackend,
    onSuccess: ({ sessionUser: nextUser }) => {
      if (isAppRole(nextUser.role)) {
        window.location.replace(getDefaultRouteForRole(nextUser.role));
      }
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate({
      email: email.trim(),
      password,
      tenantId: tenantId.trim(),
    });
  }

  return (
    <main className="archive-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative grid w-full max-w-[1380px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="flex flex-col justify-center space-y-8 lg:pr-6">
          <div className="space-y-4">
            <p className="muted-label">Campus access</p>
            <h1 className="max-w-4xl text-[clamp(3rem,6vw,6rem)] leading-[0.9] font-medium tracking-[-0.05em] text-[color:var(--color-primary)]">
              Connect the frontend to the live archive tenant.
            </h1>
            <p className="text-muted max-w-xl text-[15px]">
              This sign-in now uses the Django backend directly. Enter a valid
              campus email, password, and tenant ID so the client can bootstrap
              the active archive context.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Backend auth",
                desc: "Credentials are posted to /v1/auth/login and the session is refreshed through the live token endpoint.",
              },
              {
                title: "Tenant bootstrap",
                desc: "After login the app resolves branding and policy from /v1/tenants/bootstrap for the selected tenant.",
              },
              {
                title: "Membership role",
                desc: "The UI role is inferred from /v1/users/memberships instead of the placeholder login role.",
              },
            ].map((feature) => (
              <article key={feature.title} className="paper-panel min-h-full px-5 py-5">
                <p className="muted-label">{feature.title}</p>
                <p className="mt-3 font-serif text-[1.15rem] leading-snug text-[color:var(--color-primary)]">
                  {feature.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="paper-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <form className="relative space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 pt-6">
              <p className="muted-label">Live sign-in</p>
              <h2 className="text-[2rem] leading-tight font-medium text-[color:var(--color-primary)]">
                Enter the repository
              </h2>
              <p className="text-muted max-w-md">
                The tenant ID is required because the current backend resolves
                archive context from the `X-Tenant-ID` header.
              </p>
            </div>

            <div className="space-y-4">
              <TextInput
                label="Campus email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <TextInput
                label="Tenant ID"
                value={tenantId}
                hint="Use the UUID of the tenant you want to browse."
                onChange={(event) => setTenantId(event.target.value)}
              />
            </div>

            {loginMutation.error ? (
              <div className="rounded-lg bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                {loginMutation.error.message}
              </div>
            ) : null}

            <div className="space-y-3 pt-2">
              <Button
                fullWidth
                size="lg"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Checking access..." : "Enter workspace"}
              </Button>
              <p className="text-xs leading-6 text-[color:var(--color-muted)]">
                The local backend database already contains tenants, memberships,
                and thesis records, so no extra seed step is required before login.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
