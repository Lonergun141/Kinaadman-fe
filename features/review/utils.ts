import type { AppRole } from "@/stores/workspace-store";
import type { TenantMembership, ThesisListItem } from "@/types/domain";

export function getReviewQueue(theses: ThesisListItem[], activeRole: AppRole) {
  if (activeRole === "ADVISER") {
    return theses.filter((thesis) =>
      ["SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED"].includes(thesis.status),
    );
  }

  return theses.filter((thesis) => thesis.status !== "DRAFT");
}

export function countPendingQueueItems(theses: ThesisListItem[]) {
  return theses.filter((thesis) =>
    ["SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED"].includes(thesis.status),
  ).length;
}

export function getReviewerMembership(
  memberships: TenantMembership[],
  sessionEmail?: string | null,
) {
  if (!sessionEmail) {
    return null;
  }

  return (
    memberships.find(
      (membership) =>
        membership.user.email.toLowerCase() === sessionEmail.toLowerCase(),
    ) || null
  );
}

export function getDefaultReviewNote(activeRole: AppRole) {
  return activeRole === "ADVISER"
    ? "The draft is ready to progress through the review workflow."
    : "Metadata and repository checks have been completed.";
}
