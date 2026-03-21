"use client";

import { requestJson } from "@/lib/api/client";
import type {
  CitationExportDto,
  PublicCollectionSummaryDto,
  PublicThesisDetailDto,
  PublicThesisListItemDto,
  ThesisDetailDto,
  ThesisListItemDto,
} from "@/types/api";
import {
  mapCitationExport,
  mapPublicCollectionSummary,
  mapPublicThesisDetail,
  mapPublicThesisListItem,
  mapThesisDetail,
  mapThesisListItem,
} from "./mappers";

export async function listTheses(payload: {
  tenantId: string;
  search?: string;
  status?: string;
  visibility?: string;
  thesisType?: string;
  departmentId?: string;
  programId?: string;
  year?: number;
  keyword?: string;
  authorUserId?: string;
}) {
  const response = await requestJson<ThesisListItemDto[]>("/theses/", {
    tenantId: payload.tenantId,
    query: {
      search: payload.search,
      status: payload.status === "ALL" ? undefined : payload.status,
      visibility:
        !payload.visibility || payload.visibility === "ALL"
          ? undefined
          : payload.visibility,
      thesis_type:
        !payload.thesisType || payload.thesisType === "ALL"
          ? undefined
          : payload.thesisType,
      department_id:
        !payload.departmentId || payload.departmentId === "ALL"
          ? undefined
          : payload.departmentId,
      program_id:
        !payload.programId || payload.programId === "ALL"
          ? undefined
          : payload.programId,
      year: payload.year,
      keyword: payload.keyword,
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
  actorMembershipId?: string | null;
  visibility?: string;
  thesisType?: string;
  language?: string;
  researchCategory?: string;
  methodology?: string;
  collegeName?: string;
  campusName?: string;
  rightsLicense?: string;
  panelMembers?: string[];
  panelApprovalStatus?: string;
  panelApprovalNote?: string;
  keywords?: string[];
  defenseDate?: string | null;
  embargoUntil?: string | null;
  publicSlug?: string;
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
      actor_membership_id: payload.actorMembershipId || null,
      visibility: payload.visibility || null,
      thesis_type: payload.thesisType || null,
      language: payload.language || null,
      research_category: payload.researchCategory || null,
      methodology: payload.methodology || null,
      college_name: payload.collegeName || null,
      campus_name: payload.campusName || null,
      rights_license: payload.rightsLicense || null,
      panel_members: payload.panelMembers || [],
      panel_approval_status: payload.panelApprovalStatus || null,
      panel_approval_note: payload.panelApprovalNote || null,
      keywords: payload.keywords || [],
      defense_date: payload.defenseDate || null,
      embargo_until: payload.embargoUntil || null,
      public_slug: payload.publicSlug || null,
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
  actorMembershipId?: string | null;
  visibility?: string;
  thesisType?: string;
  language?: string;
  researchCategory?: string;
  methodology?: string;
  collegeName?: string;
  campusName?: string;
  rightsLicense?: string;
  panelMembers?: string[];
  panelApprovalStatus?: string;
  panelApprovalNote?: string;
  keywords?: string[];
  defenseDate?: string | null;
  embargoUntil?: string | null;
  publicSlug?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(`/theses/${payload.thesisId}`, {
    tenantId: payload.tenantId,
    method: "PUT",
    body: {
      title: payload.title,
      abstract: payload.abstract,
      year: payload.year,
      department_id:
        payload.departmentId === undefined ? undefined : payload.departmentId || null,
      program_id:
        payload.programId === undefined ? undefined : payload.programId || null,
      actor_membership_id:
        payload.actorMembershipId === undefined
          ? undefined
          : payload.actorMembershipId || null,
      visibility: payload.visibility === undefined ? undefined : payload.visibility,
      thesis_type: payload.thesisType === undefined ? undefined : payload.thesisType,
      language: payload.language === undefined ? undefined : payload.language,
      research_category:
        payload.researchCategory === undefined ? undefined : payload.researchCategory,
      methodology: payload.methodology === undefined ? undefined : payload.methodology,
      college_name: payload.collegeName === undefined ? undefined : payload.collegeName,
      campus_name: payload.campusName === undefined ? undefined : payload.campusName,
      rights_license:
        payload.rightsLicense === undefined ? undefined : payload.rightsLicense,
      panel_members:
        payload.panelMembers === undefined ? undefined : payload.panelMembers,
      panel_approval_status:
        payload.panelApprovalStatus === undefined
          ? undefined
          : payload.panelApprovalStatus,
      panel_approval_note:
        payload.panelApprovalNote === undefined ? undefined : payload.panelApprovalNote,
      keywords: payload.keywords === undefined ? undefined : payload.keywords,
      defense_date:
        payload.defenseDate === undefined ? undefined : payload.defenseDate || null,
      embargo_until:
        payload.embargoUntil === undefined ? undefined : payload.embargoUntil || null,
      public_slug: payload.publicSlug === undefined ? undefined : payload.publicSlug || null,
    },
  });

  return mapThesisDetail(response);
}

export async function assignAuthor(payload: {
  tenantId: string;
  thesisId: string;
  displayName: string;
  userId?: string;
  sortOrder?: number;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/authors`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        display_name: payload.displayName,
        user_id: payload.userId || null,
        sort_order: payload.sortOrder ?? 0,
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

export async function startReview(payload: {
  tenantId: string;
  thesisId: string;
  reviewerMembershipId: string;
  note?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/start-review`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        reviewer_membership_id: payload.reviewerMembershipId,
        note: payload.note || "Review started",
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

export async function publishThesis(payload: {
  tenantId: string;
  thesisId: string;
  actorMembershipId: string | null;
  note?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/publish`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        actor_membership_id: payload.actorMembershipId,
        note: payload.note || "Published to the repository",
      },
    },
  );

  return mapThesisDetail(response);
}

export async function unpublishThesis(payload: {
  tenantId: string;
  thesisId: string;
  actorMembershipId: string | null;
  note?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/unpublish`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        actor_membership_id: payload.actorMembershipId,
        note: payload.note || "Returned to approved state",
      },
    },
  );

  return mapThesisDetail(response);
}

export async function archiveThesis(payload: {
  tenantId: string;
  thesisId: string;
  actorMembershipId: string | null;
  note?: string;
}) {
  const response = await requestJson<ThesisDetailDto>(
    `/theses/${payload.thesisId}/archive`,
    {
      tenantId: payload.tenantId,
      method: "POST",
      body: {
        actor_membership_id: payload.actorMembershipId,
        note: payload.note || "Archived from the active repository",
      },
    },
  );

  return mapThesisDetail(response);
}

export async function listPublicTheses(payload: {
  tenantSlug: string;
  search?: string;
  thesisType?: string;
  department?: string;
  program?: string;
  year?: number;
  keyword?: string;
}) {
  const response = await requestJson<PublicThesisListItemDto[]>(
    `/public/tenants/${payload.tenantSlug}/theses/`,
    {
      auth: false,
      query: {
        search: payload.search,
        thesis_type:
          !payload.thesisType || payload.thesisType === "ALL"
            ? undefined
            : payload.thesisType,
        department:
          !payload.department || payload.department === "ALL"
            ? undefined
            : payload.department,
        program:
          !payload.program || payload.program === "ALL"
            ? undefined
            : payload.program,
        year: payload.year,
        keyword: payload.keyword,
      },
    },
  );

  return response.map(mapPublicThesisListItem);
}

export async function getPublicThesis(tenantSlug: string, publicSlug: string) {
  const response = await requestJson<PublicThesisDetailDto>(
    `/public/tenants/${tenantSlug}/theses/${publicSlug}/`,
    {
      auth: false,
    },
  );

  return mapPublicThesisDetail(response);
}

export async function listPublicCollections(tenantSlug: string) {
  const response = await requestJson<PublicCollectionSummaryDto>(
    `/public/tenants/${tenantSlug}/collections/`,
    {
      auth: false,
    },
  );

  return mapPublicCollectionSummary(response);
}

export async function getPublicCitations(tenantSlug: string, publicSlug: string) {
  const response = await requestJson<CitationExportDto[]>(
    `/public/tenants/${tenantSlug}/theses/${publicSlug}/citation/`,
    {
      auth: false,
    },
  );

  return response.map(mapCitationExport);
}
