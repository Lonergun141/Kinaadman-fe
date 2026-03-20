const backendApiBase =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE?.replace(/\/$/, "") ||
  "/api/backend/v1";
const defaultTenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? "";

export const frontendEnv = {
  backendProxyBase: "/api/backend",
  backendApiBase,
  defaultTenantId,
};
