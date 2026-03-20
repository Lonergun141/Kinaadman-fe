import type { AppRole } from "@/stores/workspace-store";

const allRoles: AppRole[] = ["STUDENT", "ADVISER", "LIBRARIAN", "TENANT_ADMIN"];

export const routeAccess = [
  { href: "/repository", roles: allRoles },
  { href: "/theses", roles: allRoles },
  { href: "/profile", roles: allRoles },
  { href: "/workspace", roles: ["STUDENT"] },
  { href: "/review", roles: ["ADVISER", "LIBRARIAN"] },
  { href: "/admin/users", roles: ["TENANT_ADMIN"] },
  { href: "/admin/branding", roles: ["TENANT_ADMIN"] },
  { href: "/admin/policy", roles: ["TENANT_ADMIN"] },
  { href: "/admin/audit", roles: ["TENANT_ADMIN"] },
  { href: "/login", roles: allRoles },
  { href: "/invite", roles: allRoles },
];

export function getDefaultRouteForRole(role: AppRole) {
  switch (role) {
    case "STUDENT":
      return "/workspace";
    case "ADVISER":
    case "LIBRARIAN":
      return "/review";
    case "TENANT_ADMIN":
      return "/admin/users";
    default:
      return "/login";
  }
}

export function canAccessPath(role: AppRole, pathname: string) {
  const match = routeAccess.find((route) =>
    pathname === route.href || pathname.startsWith(`${route.href}/`),
  );

  if (!match) {
    return false;
  }

  return match.roles.includes(role);
}

export function isAppRole(value: string): value is AppRole {
  return allRoles.includes(value as AppRole);
}
