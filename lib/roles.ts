import type { AppRole } from "@/stores/workspace-store";

export const roleLabels: Record<AppRole, string> = {
  STUDENT: "Student",
  ADVISER: "Adviser",
  LIBRARIAN: "Librarian",
  TENANT_ADMIN: "Tenant Admin",
};
