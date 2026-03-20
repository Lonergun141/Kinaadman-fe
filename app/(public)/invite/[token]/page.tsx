"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
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
    <main className="archive-grid flex min-h-screen items-center justify-center px-4 py-16">
      <div className="paper-panel w-full max-w-3xl space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="muted-label">Invitation onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Accept a campus invitation
          </h1>
          <p className="text-muted max-w-xl">
            This route now posts directly to the backend invite acceptance
            endpoint. The raw token must come from an existing invitation link.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
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
              <div className="rounded-lg bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                {acceptMutation.error.message}
              </div>
            ) : null}
            {acceptMutation.isSuccess ? (
              <div className="rounded-lg bg-[rgba(22,163,74,0.08)] px-4 py-3 text-sm text-[color:var(--color-success)]">
                Invitation accepted. Redirecting to login.
              </div>
            ) : null}
            <Button fullWidth size="lg" type="submit" disabled={acceptMutation.isPending}>
              {acceptMutation.isPending ? "Accepting invitation..." : "Accept invitation"}
            </Button>
          </form>
          <div className="card-item flex flex-col justify-between bg-slate-50/60 p-5">
            <div>
              <p className="muted-label">Invite summary</p>
              <p className="mt-3 text-lg font-bold text-[color:var(--color-primary)]">
                Backend-backed onboarding
              </p>
              <p className="text-muted mt-2">
                The frontend cannot inspect pending invitations because the
                backend does not expose an invite listing endpoint. This screen
                only handles token acceptance.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-5 inline-block text-sm font-semibold text-[color:var(--color-primary)] underline underline-offset-4"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
