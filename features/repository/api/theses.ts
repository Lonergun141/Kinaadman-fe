"use client";

import { requestJson } from "@/lib/api/client";
import type { ThesisDetailDto, ThesisListItemDto } from "@/types/api";
import { mapThesisDetail, mapThesisListItem } from "./mappers";

export async function listTheses(payload: {
  tenantId: string;
  search?: string;
  status?: string;
  authorUserId?: string;
}) {
  const response = await requestJson<ThesisListItemDto[]>("/theses/", {
    tenantId: payload.tenantId,
    query: {
      search: payload.search,
      status: payload.status === "ALL" ? undefined : payload.status,
      author_user_id: payload.authorUserId,
    },
  });

  return response.map(mapThesisListItem);
}

export async function getThesis(tenantId: string, thesisId: string) {
  const response = await requestJson<ThesisDetailDto>(`/theses/${thesisId}`, {
    tenantId,
  });

  return mapThesisDetail(response);
}

export async function createThesis(payload: {
  tenantId: string;
  title: string;
  abstract: string;
  year: number;
  departmentId?: string;
  programId?: string;
  createdByMembershipId?: string | null;
}) {
  const response = await requestJson<ThesisDetailDto>("/theses/", {
    tenantId: payload.tenantId,
    method: "POST",
    body: {
      title: payload.title,
      abstract: payload.abstract,
      year: payload.year,
      department_id: payload.departmentId || null,
      program_id: payload.programId || null,
      created_by_membership_id: payload.createdByMembershipId || null,
    },
  });

  return mapThesisDetail(response);
}

export async function updateThesis(payload: {
  tenantId: string;
  thesisId: string;
  title: string;
  abstract: string;
  year: number;
  departmentId?: string;
  programId?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(`/theses/${payload.thesisId}`, {
    tenantId: payload.tenantId,
    method: "PUT",
    body: {
      title: payload.title,
      abstract: payload.abstract,
      year: payload.year,
      department_id: payload.departmentId || null,
      program_id: payload.programId || null,
    },
  });

  return mapThesisDetail(response);
}

export async function assignAuthor(payload: {
  tenantId: string;
  thesisId: string;
  displayName: string;
  userId?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/authors`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        display_name: payload.displayName,
        user_id: payload.userId || null,
        sort_order: 0,
      },
    },
  );

  return mapThesisDetail(response);
}

export async function assignAdviser(payload: {
  tenantId: string;
  thesisId: string;
  adviserMembershipId: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/advisers`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        adviser_membership_id: payload.adviserMembershipId,
      },
    },
  );

  return mapThesisDetail(response);
}

export async function submitThesis(payload: {
  tenantId: string;
  thesisId: string;
  submitterMembershipId: string | null;
  note?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/submit`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        submitter_membership_id: payload.submitterMembershipId,
        note: payload.note || "Submitted for review",
      },
    },
  );

  return mapThesisDetail(response);
}

export async function reviewThesis(payload: {
  tenantId: string;
  thesisId: string;
  reviewerMembershipId: string;
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  comment: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/review`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        reviewer_membership_id: payload.reviewerMembershipId,
        decision: payload.decision,
        comment: payload.comment,
      },
    },
  );

  return mapThesisDetail(response);
}

export async function publishThesis(tenantId: string, thesisId: string) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${thesisId}/publish`,
    {
      tenantId,
      method: "POST",
      body: {},
    },
  );

  return mapThesisDetail(response);
}

export async function unpublishThesis(tenantId: string, thesisId: string) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${thesisId}/unpublish`,
    {
      tenantId,
      method: "POST",
      body: {},
    },
  );

  return mapThesisDetail(response);
}
