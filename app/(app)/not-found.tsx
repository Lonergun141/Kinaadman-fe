import { FullScreenMessage } from "@/components/ui/full-screen-message";

export default function AppNotFound() {
  return (
    <FullScreenMessage
      eyebrow="Not found"
      title="This archive record does not exist"
      description="The page or record you requested could not be found in this archive."
      actionHref="/repository"
      actionLabel="Return to repository"
    />
  );
}
