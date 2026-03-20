const defaultTenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? "";

export const frontendEnv = {
  backendProxyBase: "/api/backend",
  backendApiBase: "/api/backend/v1",
  defaultTenantId,
};
