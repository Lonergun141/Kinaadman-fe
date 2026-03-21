import type { PublicationReadiness, ThesisListItem } from "@/types/domain";

export type ReadinessStatus = "READY" | "PENDING" | "MISSING" | "BLOCKED";
export type LibrarianDeskFilter =
  | "ALL"
  | "READY"
  | "NEEDS_ADVISER"
  | "NEEDS_PANEL"
  | "NEEDS_METADATA"
  | "PUBLISHED";

export function getReadinessStatusLabel(status: string) {
  switch (status) {
    case "READY":
      return "Ready";
    case "PENDING":
      return "Pending";
    case "BLOCKED":
      return "Blocked";
    default:
      return "Missing";
  }
}

export function getReadinessClasses(status: string) {
  switch (status) {
    case "READY":
      return "bg-[rgba(22,163,74,0.1)] text-[color:var(--color-success)] shadow-[inset_0_0_0_1px_rgba(22,163,74,0.15)]";
    case "PENDING":
      return "bg-[rgba(201,162,39,0.12)] text-[color:var(--color-secondary)] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.18)]";
    case "BLOCKED":
      return "bg-[rgba(220,38,38,0.09)] text-[color:var(--color-error)] shadow-[inset_0_0_0_1px_rgba(220,38,38,0.15)]";
    default:
      return "bg-[rgba(15,42,68,0.06)] text-[color:var(--color-muted-foreground)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]";
  }
}

export function getPrimaryReadinessMessage(readiness: PublicationReadiness) {
  if (readiness.can_publish_now) {
    return "All publishing checks are complete.";
  }

  const firstBlocker = readiness.checklist.find((check) => check.status !== "READY");
  return firstBlocker?.detail || "Publishing checks still need attention.";
}

export function getLibrarianDeskFilterLabel(filter: LibrarianDeskFilter) {
  switch (filter) {
    case "READY":
      return "Ready to publish";
    case "NEEDS_ADVISER":
      return "Needs adviser";
    case "NEEDS_PANEL":
      return "Needs panel";
    case "NEEDS_METADATA":
      return "Needs metadata";
    case "PUBLISHED":
      return "Published";
    default:
      return "All records";
  }
}

export function matchesLibrarianDeskFilter(
  thesis: ThesisListItem,
  filter: LibrarianDeskFilter,
) {
  const readiness = thesis.publication_readiness;
  const checklistById = Object.fromEntries(
    readiness.checklist.map((check) => [check.id, check]),
  );

  switch (filter) {
    case "READY":
      return readiness.can_publish_now;
    case "NEEDS_ADVISER":
      return checklistById.adviser_recommendation?.status !== "READY";
    case "NEEDS_PANEL":
      return (
        checklistById.panel_members?.status !== "READY" ||
        checklistById.panel_approval?.status !== "READY"
      );
    case "NEEDS_METADATA":
      return (
        checklistById.main_pdf?.status !== "READY" ||
        checklistById.defense_date?.status !== "READY" ||
        checklistById.rights_license?.status !== "READY"
      );
    case "PUBLISHED":
      return thesis.status === "PUBLISHED";
    default:
      return true;
  }
}

export function countLibrarianDeskItems(
  theses: ThesisListItem[],
  filter: LibrarianDeskFilter,
) {
  return theses.filter((thesis) => matchesLibrarianDeskFilter(thesis, filter)).length;
}

export function sortLibrarianDeskItems(theses: ThesisListItem[]) {
  return [...theses].sort((left, right) => {
    const leftPriority =
      left.status === "APPROVED" && left.publication_readiness.can_publish_now
        ? 0
        : left.status === "APPROVED"
          ? 1
          : left.status === "IN_REVIEW"
            ? 2
            : left.status === "SUBMITTED"
              ? 3
              : left.status === "PUBLISHED"
                ? 5
                : 4;
    const rightPriority =
      right.status === "APPROVED" && right.publication_readiness.can_publish_now
        ? 0
        : right.status === "APPROVED"
          ? 1
          : right.status === "IN_REVIEW"
            ? 2
            : right.status === "SUBMITTED"
              ? 3
              : right.status === "PUBLISHED"
                ? 5
                : 4;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return (
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    );
  });
}
