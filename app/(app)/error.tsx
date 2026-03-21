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
      description="Something went wrong while opening this view. Try reloading the page and continue from there."
      secondaryAction={<Button onClick={reset}>Reload this view</Button>}
    />
  );
}
