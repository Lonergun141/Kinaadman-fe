"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import type { DepartmentOption, ProgramOption } from "@/types/domain";

interface ProgramsCardProps {
  programs: ProgramOption[];
  departments: DepartmentOption[];
  errorMessage?: string;
  programName: string;
  selectedDepartmentId: string;
  isPending: boolean;
  onProgramNameChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onAddProgram: () => void;
}

export function ProgramsCard({
  programs,
  departments,
  errorMessage,
  programName,
  selectedDepartmentId,
  isPending,
  onProgramNameChange,
  onDepartmentChange,
  onAddProgram,
}: ProgramsCardProps) {
  return (
    <SurfaceCard eyebrow="Programs" title="Program catalogue">
      {errorMessage ? (
        <EmptyState
          title="Program catalogue unavailable"
          description={errorMessage}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {programs.map((program) => {
              const department = departments.find(
                (option) => option.id === program.department_id,
              );

              return (
                <div key={program.id} className="card-item">
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {program.name}
                  </p>
                  <p className="text-muted mt-0.5 text-xs">
                    {department?.name || "Unknown department"}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-3">
            <TextInput
              label="New program"
              value={programName}
              onChange={(event) => onProgramNameChange(event.target.value)}
            />
            <SelectField
              label="Department"
              value={selectedDepartmentId}
              onChange={(event) => onDepartmentChange(event.target.value)}
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </SelectField>
            <Button
              onClick={onAddProgram}
              disabled={isPending || !programName.trim() || !selectedDepartmentId}
            >
              Add program
            </Button>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}
