import type { AppRole } from "@/stores/workspace-store";

export type NavItem = {
  href: string;
  label: string;
  section: string;
  description: string;
  roles: AppRole[];
};

export const navigation: NavItem[] = [
  {
    href: "/repository",
    label: "Repository",
    section: "Library",
    description: "Browse and search the institutional archive.",
    roles: ["STUDENT", "ADVISER", "LIBRARIAN", "TENANT_ADMIN"],
  },
  {
    href: "/profile",
    label: "Profile",
    section: "Common",
    description: "See your account details and archive access settings.",
    roles: ["STUDENT", "ADVISER", "LIBRARIAN", "TENANT_ADMIN"],
  },
  {
    href: "/workspace",
    label: "Workspace",
    section: "Student",
    description: "Draft, edit, and submit thesis records.",
    roles: ["STUDENT"],
  },
  {
    href: "/review",
    label: "Review Queue",
    section: "Review",
    description: "Evaluate submissions and move them through workflow.",
    roles: ["ADVISER", "LIBRARIAN"],
  },
  {
    href: "/audit",
    label: "Audit Log",
    section: "Review",
    description: "Trace repository decisions, publishing actions, and archive changes.",
    roles: ["LIBRARIAN", "TENANT_ADMIN"],
  },
  {
    href: "/admin/users",
    label: "Users",
    section: "Administration",
    description: "Manage people, roles, and invitations for the archive.",
    roles: ["TENANT_ADMIN"],
  },
  {
    href: "/admin/branding",
    label: "Branding",
    section: "Administration",
    description: "Shape the tenant archive identity and masthead.",
    roles: ["TENANT_ADMIN"],
  },
  {
    href: "/admin/policy",
    label: "Policy",
    section: "Administration",
    description: "Set archive access, departments, programs, and review rules.",
    roles: ["TENANT_ADMIN"],
  },
];

export const navigationSections = Array.from(
  new Set(navigation.map((item) => item.section)),
);
