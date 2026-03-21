export const queryKeys = {
  tenant: {
    bootstrap: (tenantId: string) => ["tenant", "bootstrap", tenantId] as const,
  },
  repository: {
    theses: (
      tenantId: string,
      search: string,
      status: string,
      authorUserId?: string,
      visibility?: string,
      thesisType?: string,
      departmentId?: string,
      programId?: string,
      year?: number,
      keyword?: string,
    ) =>
      [
        "repository",
        "theses",
        tenantId,
        search,
        status,
        authorUserId || "all",
        visibility || "all",
        thesisType || "all",
        departmentId || "all",
        programId || "all",
        year || "all",
        keyword || "all",
      ] as const,
    thesisDetail: (tenantId: string, thesisId: string) =>
      ["repository", "thesis-detail", tenantId, thesisId] as const,
    departments: (tenantId: string) =>
      ["repository", "departments", tenantId] as const,
    programs: (tenantId: string) =>
      ["repository", "programs", tenantId] as const,
    publicTheses: (
      tenantSlug: string,
      search: string,
      thesisType?: string,
      department?: string,
      program?: string,
      year?: number,
      keyword?: string,
    ) =>
      [
        "repository",
        "public-theses",
        tenantSlug,
        search,
        thesisType || "all",
        department || "all",
        program || "all",
        year || "all",
        keyword || "all",
      ] as const,
    publicThesisDetail: (tenantSlug: string, publicSlug: string) =>
      ["repository", "public-thesis-detail", tenantSlug, publicSlug] as const,
    publicCollections: (tenantSlug: string) =>
      ["repository", "public-collections", tenantSlug] as const,
    publicCitations: (tenantSlug: string, publicSlug: string) =>
      ["repository", "public-citations", tenantSlug, publicSlug] as const,
  },
  users: {
    memberships: (tenantId: string) => ["users", "memberships", tenantId] as const,
  },
  admin: {
    audit: (tenantId: string) => ["admin", "audit", tenantId] as const,
  },
};
