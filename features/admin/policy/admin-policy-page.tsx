"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { updatePolicy } from "@/features/admin/api";
import { createDepartment, createProgram } from "@/features/repository/api";
import { useRepositoryCatalog } from "@/features/repository/hooks/use-repository-catalog";
import { invalidateTenantRepositoryQueries } from "@/lib/query/invalidation";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { TenantPolicy } from "@/types/domain";
import { AccessRulesCard } from "./components/access-rules-card";
import { DepartmentsCard } from "./components/departments-card";
import { ProgramsCard } from "./components/programs-card";
import { SecuritySettingsCard } from "./components/security-settings-card";
import { getPolicyStats, mergePolicy } from "./utils";

export function AdminPolicyPageView() {
  const queryClient = useQueryClient();
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const setTenantContext = useTenantStore((state) => state.setTenantContext);
  const { departmentsQuery, programsQuery } = useRepositoryCatalog(activeTenantId);

  const [policyDraft, setPolicyDraft] = useState<TenantPolicy | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [programName, setProgramName] = useState("");
  const [programDepartmentId, setProgramDepartmentId] = useState("");
  const initialPolicy = tenantContext?.policy;

  const policyMutation = useMutation({
    mutationFn: updatePolicy,
    onSuccess: (policy) => {
      if (!tenantContext) {
        return;
      }

      setTenantContext({
        ...tenantContext,
        policy,
      });
      setPolicyDraft(policy);
    },
  });

  const departmentMutation = useMutation({
    mutationFn: (name: string) => createDepartment(activeTenantId, name),
    onSuccess: async () => {
      setDepartmentName("");
      await invalidateTenantRepositoryQueries(queryClient, activeTenantId);
    },
  });

  const programMutation = useMutation({
    mutationFn: (payload: { name: string; departmentId: string }) =>
      createProgram({
        tenantId: activeTenantId,
        name: payload.name,
        departmentId: payload.departmentId,
      }),
    onSuccess: async () => {
      setProgramName("");
      await invalidateTenantRepositoryQueries(queryClient, activeTenantId);
    },
  });

  const combinedError =
    policyMutation.error?.message ||
    departmentMutation.error?.message ||
    programMutation.error?.message ||
    "";

  const departments = departmentsQuery.data ?? [];
  const programs = programsQuery.data ?? [];
  const stats = getPolicyStats(departments, programs);
  const effectivePolicy = policyDraft || initialPolicy;
  const effectiveProgramDepartmentId =
    programDepartmentId || departments[0]?.id || "";

  if (!tenantContext || !effectivePolicy) {
    return null;
  }

  const handlePolicyChange = (updates: Partial<TenantPolicy>) => {
    setPolicyDraft((current) => mergePolicy(current, updates, effectivePolicy));
  };

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Tenant administration"
        title="Tenant policy and academic structure"
        description="Adjust access posture, security rules, and the academic catalogue that authors use when classifying thesis records."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Departments"
          value={String(stats.departments)}
          detail="Academic units available for thesis classification."
        />
        <StatCard
          label="Programs"
          value={String(stats.programs)}
          detail="Programs assignable in thesis metadata."
          tone="secondary"
        />
        <StatCard
          label="Invite only"
          value={effectivePolicy.invite_only ? "Yes" : "No"}
          detail="Tenant onboarding posture."
        />
        <StatCard
          label="Campus only"
          value={effectivePolicy.campus_only ? "Yes" : "No"}
          detail={tenantContext.slug.toUpperCase()}
          tone="neutral"
        />
      </section>

      {combinedError ? (
        <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          {combinedError}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <AccessRulesCard
            policy={effectivePolicy}
            onPolicyChange={handlePolicyChange}
          />
          <SecuritySettingsCard
            policy={effectivePolicy}
            isPending={policyMutation.isPending}
            onPolicyChange={handlePolicyChange}
            onSave={() =>
              policyMutation.mutate({
                tenantId: activeTenantId,
                policy: effectivePolicy,
              })
            }
          />
        </div>

        <div className="space-y-5">
          <DepartmentsCard
            departments={departments}
            errorMessage={departmentsQuery.error?.message}
            departmentName={departmentName}
            isPending={departmentMutation.isPending}
            onDepartmentNameChange={setDepartmentName}
            onAddDepartment={() => departmentMutation.mutate(departmentName)}
          />
          <ProgramsCard
            programs={programs}
            departments={departments}
            errorMessage={programsQuery.error?.message}
            programName={programName}
            selectedDepartmentId={effectiveProgramDepartmentId}
            isPending={programMutation.isPending}
            onProgramNameChange={setProgramName}
            onDepartmentChange={setProgramDepartmentId}
            onAddProgram={() =>
              programMutation.mutate({
                name: programName,
                departmentId: effectiveProgramDepartmentId,
              })
            }
          />
        </div>
      </section>
    </div>
  );
}
