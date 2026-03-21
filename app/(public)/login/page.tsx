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
    <main className="flex min-h-screen">
      {/* Left Column (Brand/Info) */}
      <section className="dark-rail hidden w-full flex-col justify-between p-10 text-white lg:flex lg:w-1/2 xl:w-[55%]">
        <div className="relative z-20 flex items-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/56">
            The Living Archive
          </p>
        </div>
        
        <div className="relative z-20 mt-auto">
          <h1 className="font-serif text-[clamp(2.5rem,4vw,4.5rem)] italic leading-[1] tracking-[-0.05em] text-white max-w-xl">
            Enter your campus archive with confidence.
          </h1>
        </div>
      </section>

      {/* Right Column (Form) */}
      <section className="archive-grid relative flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2 xl:w-[45%]">
        <div className="absolute left-6 top-6 flex items-center lg:hidden">
           <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
             The Living Archive
           </p>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-col justify-center space-y-8">
          <div className="flex flex-col text-center">
            <h2 className="text-[2.2rem] leading-[0.98] tracking-[-0.03em] text-primary">
              Access your archive
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Use your campus email, password, and archive ID to open the right repository. Super admins can switch clients after sign-in.
            </p>
          </div>

          <div className="paper-panel px-6 py-8 sm:px-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  label="Archive ID"
                  value={tenantId}
                  hint="Enter the archive code shared by your school or library."
                  onChange={(event) => setTenantId(event.target.value)}
                />
              </div>

              {loginMutation.error ? (
                <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                  {loginMutation.error.message}
                </div>
              ) : null}

              <Button size="lg" fullWidth type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Checking access..." : "Enter workspace"}
              </Button>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-balance text-muted-foreground">
            Your access depends on the archive settings for your school and the role assigned to your account.
          </p>
        </div>
      </section>
    </main>
  );
}
