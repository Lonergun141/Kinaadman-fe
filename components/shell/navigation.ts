import type { AppRole } from "@/stores/workspace-store";

export type NavItem = {
  href: string;
  label: string;
  section: string;
  roles: AppRole[];
};

export const navigation: NavItem[] = [
  {
    href: "/repository",
    label: "Repository",
    section: "Library",
    roles: ["STUDENT", "ADVISER", "LIBRARIAN", "TENANT_ADMIN"],
  },
  {
    href: "/profile",
    label: "Profile",
    section: "Common",
    roles: ["STUDENT", "ADVISER", "LIBRARIAN", "TENANT_ADMIN"],
  },
  {
    href: "/workspace",
    label: "Workspace",
    section: "Student",
    roles: ["STUDENT"],
  },
  {
    href: "/review",
    label: "Review Queue",
    section: "Review",
    roles: ["ADVISER", "LIBRARIAN"],
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    section: "Administration",
    roles: ["TENANT_ADMIN"],
  },
  {
    href: "/admin/branding",
    label: "Branding",
    section: "Administration",
    roles: ["TENANT_ADMIN"],
  },
  {
    href: "/admin/policy",
    label: "Policies",
    section: "Administration",
    roles: ["TENANT_ADMIN"],
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    section: "Administration",
    roles: ["TENANT_ADMIN"],
  },
];

export const navigationSections = Array.from(
  new Set(navigation.map((item) => item.section)),
);
