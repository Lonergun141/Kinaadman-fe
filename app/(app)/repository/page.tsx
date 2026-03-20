"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select-field";
import { StatCard } from "@/components/ui/stat-card";
import { ThesisCards } from "@/components/repository/thesis-cards";
import { ThesisTable } from "@/components/repository/thesis-table";
import { listDepartments, listPrograms, listTheses } from "@/features/repository/api";
import { queryKeys } from "@/lib/query-keys";
import { roleLabels } from "@/lib/roles";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function RepositoryPage() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantContext = useTenantStore((state) => state.tenantContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [program, setProgram] = useState("ALL");
  const deferredSearch = useDeferredValue(search.trim());

  const thesesQuery = useQuery({
    queryKey: queryKeys.repository.theses(activeTenantId, deferredSearch, status),
    queryFn: () =>
      listTheses({
        tenantId: activeTenantId,
        search: deferredSearch,
        status,
      }),
    enabled: Boolean(activeTenantId),
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.repository.departments(activeTenantId),
    queryFn: () => listDepartments(activeTenantId),
    enabled: Boolean(activeTenantId),
  });

  const programsQuery = useQuery({
    queryKey: queryKeys.repository.programs(activeTenantId),
    queryFn: () => listPrograms(activeTenantId),
    enabled: Boolean(activeTenantId),
  });

  const visibleTheses = useMemo(() => thesesQuery.data ?? [], [thesesQuery.data]);
  const departments = useMemo(
    () =>
      (departmentsQuery.data ?? []).filter((option) =>
        visibleTheses.some((thesis) => thesis.department?.id === option.id),
      ),
    [departmentsQuery.data, visibleTheses],
  );
  const programs = useMemo(
    () =>
      (programsQuery.data ?? []).filter((option) => {
        if (department !== "ALL" && option.department_id !== department) {
          return false;
        }

        return visibleTheses.some((thesis) => thesis.program?.id === option.id);
      }),
    [department, programsQuery.data, visibleTheses],
  );

  const filteredTheses = useMemo(
    () =>
      visibleTheses.filter((thesis) => {
        const matchesDepartment =
          department === "ALL" || thesis.department?.id === department;
        const matchesProgram = program === "ALL" || thesis.program?.id === program;

        return matchesDepartment && matchesProgram;
      }),
    [department, program, visibleTheses],
  );

  const publishedCount = visibleTheses.filter(
    (thesis) => thesis.status === "PUBLISHED",
  ).length;
  const reviewCount = visibleTheses.filter((thesis) =>
    ["SUBMITTED", "IN_REVIEW", "APPROVED"].includes(thesis.status),
  ).length;
  const tenantDisplayName =
    tenantContext?.branding?.display_name || tenantContext?.name || "Tenant archive";
  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : "Campus member";

  return (
    <div className="page-shell space-y-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <div className="paper-panel p-7 sm:p-8 lg:p-10">
          <p className="muted-label">Repository</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="pill-outline">{roleLabels[activeRole]}</span>
            <span className="pill-outline">{sessionName}</span>
            <span className="pill-outline">{tenantDisplayName}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,4vw,4rem)] leading-[0.98] tracking-[-0.03em]">
            {tenantDisplayName} collection
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-[15px]">
            Browse the live tenant archive through the current backend data.
            Search and status filtering are server-backed; department and program
            filters refine the returned catalogue locally.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="muted-label">Visible records</p>
              <p className="mt-3 font-serif text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-primary)]">
                {visibleTheses.length}
              </p>
              <p className="text-muted mt-2 text-[13px]">
                Tenant-scoped catalogue entries returned by the backend.
              </p>
            </div>
            <div>
              <p className="muted-label">Published research</p>
              <p className="mt-3 font-serif text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-primary)]">
                {publishedCount}
              </p>
              <p className="text-muted mt-2 text-[13px]">
                Finalized records visible inside the current archive.
              </p>
            </div>
            <div>
              <p className="muted-label">Academic coverage</p>
              <p className="mt-3 font-serif text-[2.2rem] leading-none tracking-[-0.04em] text-[color:var(--color-primary)]">
                {departments.length}
              </p>
              <p className="text-muted mt-2 text-[13px]">
                Departments represented in the active catalogue.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatCard
            label="Under review"
            value={String(reviewCount)}
            detail="Records currently moving through submission and review states."
            tone="secondary"
          />
          <StatCard
            label="Programs"
            value={String(programsQuery.data?.length || 0)}
            detail="Programs registered under this tenant."
            tone="neutral"
          />
          <div className="paper-panel p-6">
            <p className="muted-label">Current reading lens</p>
            <h2 className="mt-3 text-[1.7rem] leading-tight tracking-[-0.02em]">
              {roleLabels[activeRole]}
            </h2>
            <p className="text-muted mt-3">
              The backend does not currently tailor repository results by role, so
              this view reflects the tenant-wide archive returned by `/v1/theses/`.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="muted-label">Curated Research</p>
            <h2 className="text-[clamp(2rem,3vw,3rem)] leading-none tracking-[-0.03em]">
              Archive catalogue
            </h2>
            <p className="text-muted max-w-2xl">
              Search is sent to PostgreSQL full text search. Department and program
              filters refine the returned dataset locally.
            </p>
          </div>
          <p className="text-sm text-[color:var(--color-muted)]">
            Showing {filteredTheses.length} of {visibleTheses.length} record
            {visibleTheses.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="paper-panel p-5 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_170px_220px_220px]">
            <label className="flex flex-col gap-1.5">
              <span className="text-primary-label">Search records</span>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the archive..."
                  className="input-base pl-9"
                />
              </div>
            </label>

            <SelectField
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In review</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="CHANGES_REQUESTED">Changes requested</option>
            </SelectField>

            <SelectField
              label="Department"
              value={department}
              onChange={(event) => {
                const nextDepartment = event.target.value;
                setDepartment(nextDepartment);

                if (
                  nextDepartment !== "ALL" &&
                  !programs.some((option) => option.id === program)
                ) {
                  setProgram("ALL");
                }
              }}
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
              onChange={(event) => setProgram(event.target.value)}
            >
              <option value="ALL">All programs</option>
              {programs.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        {thesesQuery.error ? (
          <EmptyState
            title="Repository unavailable"
            description={thesesQuery.error.message}
          />
        ) : thesesQuery.isPending ? (
          <EmptyState
            title="Loading archive"
            description="The frontend is fetching live repository records from the backend."
          />
        ) : filteredTheses.length > 0 ? (
          <div className="space-y-4">
            <ThesisTable items={filteredTheses} />
            <ThesisCards items={filteredTheses} />
          </div>
        ) : (
          <EmptyState
            title="No matching records"
            description="Try a broader keyword or clear one of the metadata filters to reopen the archive."
          />
        )}
      </section>
    </div>
  );
}
