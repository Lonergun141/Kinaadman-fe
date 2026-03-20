"use client";

import { requestJson } from "@/lib/api/client";
import type { DepartmentDto, ProgramDto } from "@/types/api";
import { mapDepartment, mapProgram } from "./mappers";

export async function listDepartments(tenantId: string) {
  const payload = await requestJson<DepartmentDto[]>("/departments/", {
    tenantId,
  });

  return payload.map(mapDepartment);
}

export async function createDepartment(tenantId: string, name: string) {
  const payload = await requestJson<DepartmentDto>("/departments/", {
    tenantId,
    method: "POST",
    body: { name },
  });

  return mapDepartment(payload);
}

export async function listPrograms(tenantId: string) {
  const payload = await requestJson<ProgramDto[]>("/programs/", {
    tenantId,
  });

  return payload.map(mapProgram);
}

export async function createProgram(payload: {
  tenantId: string;
  name: string;
  departmentId: string;
}) {
  const response = await requestJson<ProgramDto>("/programs/", {
    tenantId: payload.tenantId,
    method: "POST",
    body: {
      name: payload.name,
      department_id: payload.departmentId,
    },
  });

  return mapProgram(response);
}
