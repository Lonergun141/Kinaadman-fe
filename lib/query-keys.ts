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
    ) =>
      ["repository", "theses", tenantId, search, status, authorUserId || "all"] as const,
    thesisDetail: (tenantId: string, thesisId: string) =>
      ["repository", "thesis-detail", tenantId, thesisId] as const,
    departments: (tenantId: string) =>
      ["repository", "departments", tenantId] as const,
    programs: (tenantId: string) =>
      ["repository", "programs", tenantId] as const,
  },
  users: {
    memberships: (tenantId: string) => ["users", "memberships", tenantId] as const,
  },
  admin: {
    audit: (tenantId: string) => ["admin", "audit", tenantId] as const,
  },
};
