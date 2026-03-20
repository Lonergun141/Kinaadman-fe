"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { TransitionLink } from "@/components/ui/transition-link";
import { acceptInvitation } from "@/features/auth/api";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
  });

  useEffect(() => {
    if (!acceptMutation.isSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/login");
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [acceptMutation.isSuccess, router]);

  function handleAccept(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    acceptMutation.mutate({
      token: params.token,
      password,
    });
  }

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword
      ? "The passwords do not match."
      : "";

  return (
    <main className="archive-grid min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1320px] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="dark-rail flex flex-col justify-between rounded-[0.5rem] px-6 py-8 text-white sm:px-8 lg:px-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/56">
                Invitation onboarding
              </p>
              <h1 className="font-serif text-[clamp(2.8rem,5vw,4.8rem)] italic leading-[0.9] tracking-[-0.05em] text-white">
                Join the archive with a trusted campus invitation.
              </h1>
              <p className="max-w-xl text-base leading-8 text-white/74">
                Finish onboarding by setting a password for the membership that was
                issued to you. After acceptance, the application redirects you back
                to sign-in so you can enter the repository normally.
              </p>
            </div>

            <div className="rail-panel px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                What this page does
              </p>
              <p className="mt-3 text-sm leading-7 text-white/78">
                The current frontend can accept an invitation token directly, but the
                backend does not expose a list of pending invitations or preview
                information before acceptance.
              </p>
            </div>
          </div>

          <TransitionLink
            href="/login"
            className="mt-8 inline-flex w-fit items-center text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary-fixed)]"
            pendingClassName="opacity-80"
          >
            Return to sign-in
          </TransitionLink>
        </section>

        <section className="flex items-center">
          <div className="paper-panel w-full px-6 py-8 sm:px-8 lg:px-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="muted-label">Accept invitation</p>
                <h2 className="text-[2rem] leading-[0.98] tracking-[-0.03em] text-balance">
                  Set your archive password
                </h2>
                <p className="text-muted">
                  The invitation token is already embedded in this route. Create a
                  password and confirm it to finish the onboarding step.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleAccept}>
                <TextInput label="Invitation token" value={params.token} readOnly />
                <TextInput
                  label="Create password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <TextInput
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  error={passwordMismatch}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />

                {acceptMutation.error ? (
                  <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                    {acceptMutation.error.message}
                  </div>
                ) : null}

                {acceptMutation.isSuccess ? (
                  <div className="rounded-[0.5rem] bg-[rgba(22,163,74,0.08)] px-4 py-3 text-sm text-[color:var(--color-success)]">
                    Invitation accepted. Redirecting to sign-in.
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-sm text-xs leading-6 text-[color:var(--color-muted)]">
                    Password confirmation happens in the browser first, then the raw
                    invitation token is posted to the backend acceptance endpoint.
                  </p>
                  <Button size="lg" type="submit" disabled={acceptMutation.isPending}>
                    {acceptMutation.isPending
                      ? "Accepting invitation..."
                      : "Accept invitation"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
