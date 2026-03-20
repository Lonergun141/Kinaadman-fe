import type {
  DepartmentOption,
  ProgramOption,
  TenantPolicy,
} from "@/types/domain";

export function booleanValue(value: boolean) {
  return value ? "true" : "false";
}

export function mergePolicy(
  current: TenantPolicy | null,
  next: Partial<TenantPolicy>,
  fallback: TenantPolicy,
) {
  return {
    ...(current || fallback),
    ...next,
  };
}

export function getPolicyStats(
  departments: DepartmentOption[],
  programs: ProgramOption[],
) {
  return {
    departments: departments.length,
    programs: programs.length,
  };
}
