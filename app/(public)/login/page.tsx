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
    <main className="archive-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1480px] gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="dark-rail flex flex-col justify-between rounded-[0.5rem] px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/56">
                The Living Archive
              </p>
              <h1 className="font-serif text-[clamp(3rem,6vw,5.8rem)] italic leading-[0.88] tracking-[-0.05em] text-white">
                Enter the archive with a clear tenant context.
              </h1>
              <p className="max-w-xl text-base leading-8 text-white/74">
                Sign in with a campus identity, connect to the correct tenant, and
                continue directly into the part of the archive that matches your
                role and responsibilities.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Institution first",
                  desc: "The repository prioritizes research readability and academic metadata over dashboard noise.",
                },
                {
                  title: "Tenant resolved",
                  desc: "The current backend requires a tenant ID so the app can load the correct branding and policy context.",
                },
                {
                  title: "Role aware",
                  desc: "After sign-in the product routes you to repository, workspace, review, or administration automatically.",
                },
              ].map((feature) => (
                <article key={feature.title} className="rail-panel px-4 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                    {feature.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/78">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rail-panel mt-8 px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Sign-in posture
            </p>
            <p className="mt-3 text-sm leading-7 text-white/78">
              The connected backend already contains tenants, memberships, and thesis
              records, so users can authenticate and begin exploring without a seed
              step or demo mode.
            </p>
          </div>
        </section>

        <section className="flex items-center">
          <div className="paper-panel w-full px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <p className="muted-label">Live sign-in</p>
                <h2 className="text-[2.2rem] leading-[0.98] tracking-[-0.03em] text-balance">
                  Access your archive workspace
                </h2>
                <p className="text-muted max-w-xl">
                  Use a valid campus email, your password, and the target tenant ID.
                  The application resolves branding, access policy, and membership
                  immediately after authentication.
                </p>
              </div>

              <div className="grid gap-4">
                <TextInput
                  label="Campus email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@university.edu"
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
                  hint="Use the UUID for the tenant you want to open."
                  onChange={(event) => setTenantId(event.target.value)}
                />
              </div>

              {loginMutation.error ? (
                <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                  {loginMutation.error.message}
                </div>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-sm text-xs leading-6 text-[color:var(--color-muted)]">
                  Access is scoped by tenant policy, membership role, and the active
                  backend session. The app does not fall back to placeholder data.
                </div>
                <Button size="lg" type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Checking access..." : "Enter workspace"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
