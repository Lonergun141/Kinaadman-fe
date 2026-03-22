import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { toTitleCase } from "@/lib/utils";
import type { DepartmentOption, ProgramOption } from "@/types/domain";
import { STATUS_SELECT_OPTIONS } from "../../lib/utils/repository-page-utils";
import { RepositorySearchField } from "./repository-search-field";

export interface RepositoryFilterControlsProps {
  search: string;
  status: string;
  department: string;
  program: string;
  departments: DepartmentOption[];
  programs: ProgramOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onClearFilters: () => void;
  onApply?: () => void;
  searchPlaceholder?: string;
}

export function RepositoryFilterControls({
  search,
  status,
  department,
  program,
  departments,
  programs,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  onProgramChange,
  onClearFilters,
  onApply,
  searchPlaceholder = "Title, abstract, or topic",
}: RepositoryFilterControlsProps) {
  return (
    <div className="space-y-4">
      <RepositorySearchField
        id="repository-filter-search"
        label="Search records"
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <SelectField
        label="Status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        {STATUS_SELECT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "ALL" ? "All statuses" : toTitleCase(option)}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Department"
        value={department}
        onChange={(event) => onDepartmentChange(event.target.value)}
      >
        <option value="ALL">All departments</option>
        {departments.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Program"
        value={program}
        onChange={(event) => onProgramChange(event.target.value)}
      >
        <option value="ALL">All programs</option>
        {programs.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-wrap gap-3">
        {onApply ? (
          <Button size="sm" onClick={onApply}>
            Apply filters
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
