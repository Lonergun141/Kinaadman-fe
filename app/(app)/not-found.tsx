import { FullScreenMessage } from "@/components/ui/full-screen-message";

export default function AppNotFound() {
  return (
    <FullScreenMessage
      eyebrow="Not found"
      title="This archive record does not exist"
      description="The requested thesis or workspace route could not be found in the current prototype dataset."
      actionHref="/repository"
      actionLabel="Return to repository"
    />
  );
}
