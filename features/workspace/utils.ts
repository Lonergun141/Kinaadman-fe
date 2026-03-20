import type {
  DepartmentOption,
  ProgramOption,
  TenantMembership,
  ThesisDetail,
  ThesisListItem,
} from "@/types/domain";

export interface WorkspaceEditorDefaults {
  title: string;
  departmentId: string;
  programId: string;
  year: string;
  abstract: string;
  adviserMembershipId: string;
}

export function getWorkspaceTheses(theses: ThesisListItem[]) {
  return theses.filter((thesis) => thesis.status !== "PUBLISHED");
}

export function getAdviserOptions(memberships: TenantMembership[]) {
  return memberships.filter(
    (membership) =>
      membership.role === "ADVISER" && membership.status === "ACTIVE",
  );
}

export function getCurrentMembership(
  memberships: TenantMembership[],
  email?: string | null,
) {
  if (!email) {
    return null;
  }

  return (
    memberships.find(
      (membership) => membership.user.email.toLowerCase() === email.toLowerCase(),
    ) || null
  );
}

export function getWorkspaceStats(theses: ThesisListItem[]) {
  return {
    draftCount: theses.filter((thesis) => thesis.status === "DRAFT").length,
    submittedCount: theses.filter((thesis) =>
      ["SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED"].includes(
        thesis.status,
      ),
    ).length,
  };
}

export function getAvailablePrograms(
  programs: ProgramOption[],
  departmentId: string,
) {
  return programs.filter(
    (program) => !departmentId || program.department_id === departmentId,
  );
}

export function buildWorkspaceEditorDefaults(payload: {
  selectedThesis: ThesisDetail | null;
  departments: DepartmentOption[];
  programs: ProgramOption[];
  adviserOptions: TenantMembership[];
}): WorkspaceEditorDefaults {
  const fallbackDepartmentId = payload.departments[0]?.id || "";
  const departmentId =
    payload.selectedThesis?.department?.id || fallbackDepartmentId;
  const initialPrograms = getAvailablePrograms(payload.programs, departmentId);
  const programId =
    payload.selectedThesis?.program?.id ||
    initialPrograms[0]?.id ||
    payload.programs[0]?.id ||
    "";
  const adviserMembershipId =
    payload.adviserOptions.find(
      (membership) =>
        membership.user.email === payload.selectedThesis?.advisers[0]?.adviser_email,
    )?.id || "";

  return {
    title: payload.selectedThesis?.title || "Untitled thesis draft",
    departmentId,
    programId,
    year: String(payload.selectedThesis?.year || new Date().getFullYear()),
    abstract:
      payload.selectedThesis?.abstract ||
      "Start describing the research abstract and archive framing here.",
    adviserMembershipId,
  };
}
