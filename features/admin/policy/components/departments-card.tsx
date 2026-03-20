"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import type { DepartmentOption } from "@/types/domain";

interface DepartmentsCardProps {
  departments: DepartmentOption[];
  errorMessage?: string;
  departmentName: string;
  isPending: boolean;
  onDepartmentNameChange: (value: string) => void;
  onAddDepartment: () => void;
}

export function DepartmentsCard({
  departments,
  errorMessage,
  departmentName,
  isPending,
  onDepartmentNameChange,
  onAddDepartment,
}: DepartmentsCardProps) {
  return (
    <SurfaceCard eyebrow="Departments" title="Academic units">
      {errorMessage ? (
        <EmptyState
          title="Department catalogue unavailable"
          description={errorMessage}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {departments.map((department) => (
              <div key={department.id} className="card-item">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                  {department.name}
                </p>
                <p className="text-muted mt-0.5 text-xs">{department.id}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <TextInput
              label="New department"
              value={departmentName}
              onChange={(event) => onDepartmentNameChange(event.target.value)}
            />
            <Button
              className="self-end"
              onClick={onAddDepartment}
              disabled={isPending || !departmentName.trim()}
            >
              Add
            </Button>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}
