"use client";

import { Button } from "@/components/ui/button";
import { FullScreenMessage } from "@/components/ui/full-screen-message";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <FullScreenMessage
      eyebrow="Workspace error"
      title="The archive view failed to render"
      description="The interface hit an unexpected client-side error. Reset the current route and try again."
      secondaryAction={<Button onClick={reset}>Reload this view</Button>}
    />
  );
}
