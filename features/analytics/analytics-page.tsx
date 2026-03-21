"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SelectField } from "@/components/ui/select-field";
import { StatCard } from "@/components/ui/stat-card";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  getRepositoryAnalyticsOverview,
  listDepartments,
} from "@/features/repository/api";
import { getDisplayNameFromEmail } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { type AppRole, useWorkspaceStore } from "@/stores/workspace-store";

type AnalyticsRole = Extract<AppRole, "TENANT_ADMIN" | "LIBRARIAN">;

const CHART_COLORS = [
  "#0f2a44",
  "#c9a227",
  "#55728e",
  "#8ca1b7",
  "#d6b861",
  "#dbe4ec",
];
const TOOLTIP_STYLE = {
  backgroundColor: "rgba(255,255,255,0.96)",
  border: "1px solid rgba(15,42,68,0.08)",
  borderRadius: "12px",
  boxShadow: "0 20px 34px rgba(0,21,42,0.08)",
  color: "#0f2a44",
};
const WINDOW_OPTIONS = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
  { value: "24", label: "Last 24 months" },
];

function isAnalyticsRole(role: AppRole): role is AnalyticsRole {
  return role === "TENANT_ADMIN" || role === "LIBRARIAN";
}

function AnalyticsChartCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <SurfaceCard eyebrow={eyebrow} title={title} className="px-6 py-6 sm:px-7 sm:py-7">
      <p className="text-muted mb-5">{description}</p>
      <div className="h-[300px]">{children}</div>
    </SurfaceCard>
  );
}

export function AnalyticsPageView() {
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const [windowMonths, setWindowMonths] = useState("6");
  const [departmentId, setDepartmentId] = useState("ALL");

  const selectedMonthWindow = Number(windowMonths) || 6;

  const analyticsQuery = useQuery({
    queryKey: [
      "analytics",
      "repository-overview",
      activeTenantId,
      selectedMonthWindow,
      departmentId,
    ],
    queryFn: () =>
      getRepositoryAnalyticsOverview({
        tenantId: activeTenantId,
        months: selectedMonthWindow,
        departmentId,
      }),
    enabled: Boolean(activeTenantId) && isAnalyticsRole(activeRole),
  });
  const departmentsQuery = useQuery({
    queryKey: ["analytics", "departments", activeTenantId],
    queryFn: () => listDepartments(activeTenantId),
    enabled: Boolean(activeTenantId) && isAnalyticsRole(activeRole),
  });
  const departmentOptions = departmentsQuery.data ?? [];
  const selectedDepartmentLabel =
    departmentId === "ALL"
      ? "All departments"
      : departmentOptions.find((department) => department.id === departmentId)?.name ||
        "Selected department";

  if (!isAnalyticsRole(activeRole)) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Analytics unavailable"
          description="This analytics route is currently intended for librarian and tenant admin accounts."
        />
      </div>
    );
  }

  if (analyticsQuery.isPending) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Loading analytics"
          description="Preparing the archive data needed for charts and trend views."
        />
      </div>
    );
  }

  if (analyticsQuery.error) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Analytics unavailable"
          description={analyticsQuery.error.message}
        />
      </div>
    );
  }

  const analytics = analyticsQuery.data;

  if (!analytics || analytics.summary.total_records === 0) {
    return (
      <div className="page-shell">
        <EmptyState
          title="No analytics data yet"
          description="Charts will appear once the current tenant has thesis or capstone records."
        />
      </div>
    );
  }

  const totalRecords = analytics.summary.total_records;
  const publishedCount = analytics.summary.published_count;
  const activeWorkflowCount = analytics.summary.active_workflow_count;
  const readyCount = analytics.summary.ready_count;
  const blockedCount = analytics.summary.blocked_count;
  const sessionName = sessionUser
    ? getDisplayNameFromEmail(sessionUser.email)
    : activeRole === "TENANT_ADMIN"
      ? "Tenant admin"
      : "Librarian";
  const tenantName =
    tenantContext?.branding?.display_name || tenantContext?.name || "Tenant archive";
  const scopeDescription =
    departmentId === "ALL"
      ? "across the full tenant archive"
      : `for ${selectedDepartmentLabel}`;
  const roleDescription =
    activeRole === "TENANT_ADMIN"
      ? `Track repository growth, coverage, and archive-wide distribution ${scopeDescription}.`
      : `Track review pressure, publishing readiness, and the blockers slowing release ${scopeDescription}.`;
  const hasActiveFilters = windowMonths !== "6" || departmentId !== "ALL";

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow={activeRole === "TENANT_ADMIN" ? "Tenant analytics" : "Librarian analytics"}
        description={roleDescription}
      >
        <span className="pill-outline">{tenantName}</span>
        <span className="pill-outline">{sessionName}</span>
      </PageHeader>

      <SurfaceCard
        eyebrow="Scope"
        title="Analytics filters"
        className="px-6 py-6 sm:px-7 sm:py-7"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,260px)_auto] lg:items-end">
          <SelectField
            label="Time window"
            value={windowMonths}
            onChange={(event) => setWindowMonths(event.target.value)}
            hint="Changes the monthly trend horizon."
          >
            {WINDOW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Department"
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            hint="Narrows the charts to one academic unit."
            disabled={departmentsQuery.isPending}
          >
            <option value="ALL">All departments</option>
            {departmentOptions.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </SelectField>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="pill-outline">{selectedDepartmentLabel}</span>
            <span className="pill-outline">
              Last {analytics.window_months} month
              {analytics.window_months === 1 ? "" : "s"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWindowMonths("6");
                setDepartmentId("ALL");
              }}
              disabled={!hasActiveFilters}
            >
              Reset filters
            </Button>
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total records"
          value={String(totalRecords)}
          detail="All theses and capstones currently visible in this tenant archive."
        />
        <StatCard
          label={activeRole === "TENANT_ADMIN" ? "Published" : "Ready to publish"}
          value={String(activeRole === "TENANT_ADMIN" ? publishedCount : readyCount)}
          detail={
            activeRole === "TENANT_ADMIN"
              ? "Finalized records already live in the repository."
              : "Records that can move into publication immediately."
          }
          tone="secondary"
        />
        <StatCard
          label="Active workflow"
          value={String(activeWorkflowCount)}
          detail="Records still moving through adviser or librarian workflow."
        />
        <StatCard
          label={activeRole === "TENANT_ADMIN" ? "Ready now" : "Blocked records"}
          value={String(activeRole === "TENANT_ADMIN" ? readyCount : blockedCount)}
          detail={
            activeRole === "TENANT_ADMIN"
              ? "Records already satisfying the publication checklist."
              : "Records held back by checklist blockers."
          }
          tone="neutral"
        />
      </section>

      {activeRole === "TENANT_ADMIN" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <AnalyticsChartCard
            eyebrow="Trend"
            title="Archive activity over time"
            description={`See how new records, submissions, and publications have moved over the last ${analytics.window_months} months.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_activity}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7c8f" fontSize={12} />
                <YAxis stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="created" stroke={CHART_COLORS[0]} strokeWidth={2.5} />
                <Line type="monotone" dataKey="submitted" stroke={CHART_COLORS[1]} strokeWidth={2.5} />
                <Line type="monotone" dataKey="published" stroke={CHART_COLORS[2]} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Distribution"
            title="Status mix"
            description="This shows where the tenant archive currently sits across workflow and publication stages."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.status_data}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7c8f" fontSize={12} />
                <YAxis stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Coverage"
            title="Department coverage"
            description="Top academic units represented in the tenant repository right now."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.department_data} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#6b7c8f" fontSize={12} width={110} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Access"
            title="Visibility mix"
            description="A quick view of how repository visibility is distributed across the tenant."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Pie
                  data={analytics.visibility_data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {analytics.visibility_data.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-2">
          <AnalyticsChartCard
            eyebrow="Workflow"
            title="Review pipeline"
            description="This chart shows how the librarian queue is distributed across review and publishing stages."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.pipeline_data}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7c8f" fontSize={12} />
                <YAxis stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Trend"
            title="Submission and publication flow"
            description={`Track how submissions and publications have moved across the last ${analytics.window_months} months.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_activity}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7c8f" fontSize={12} />
                <YAxis stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke={CHART_COLORS[1]} strokeWidth={2.5} />
                <Line type="monotone" dataKey="published" stroke={CHART_COLORS[0]} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Blockers"
            title="Top publishing blockers"
            description="See which checklist items are most often holding records back from publication."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.blocker_data} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="rgba(15,42,68,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#6b7c8f" fontSize={12} width={140} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            eyebrow="Readiness"
            title="Readiness split"
            description="Compare ready records, blocked records, and records still moving through workflow."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Pie
                  data={analytics.readiness_split}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {analytics.readiness_split.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </AnalyticsChartCard>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard eyebrow="Supporting view" title="Department activity" className="px-6 py-6 sm:px-7 sm:py-7">
          <p className="text-muted mb-5">
            {activeRole === "TENANT_ADMIN"
              ? "A second look at the units contributing the most repository records."
              : "Departments carrying the heaviest active workflow load."}
          </p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  activeRole === "TENANT_ADMIN"
                    ? analytics.department_data
                    : analytics.active_department_data
                }
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid stroke="rgba(15,42,68,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#6b7c8f" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#6b7c8f" fontSize={12} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS[2]} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Supporting view" title="At-a-glance insights" className="px-6 py-6 sm:px-7 sm:py-7">
          <div className="space-y-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            {activeRole === "TENANT_ADMIN" ? (
              <>
                <p>
                  {readyCount} record{readyCount === 1 ? "" : "s"} are publication-ready
                  right now, while {activeWorkflowCount} still remain inside workflow.
                </p>
                <p>
                  {publishedCount} record{publishedCount === 1 ? "" : "s"} are already
                  published in {tenantName}.
                </p>
              </>
            ) : (
              <>
                <p>
                  {blockedCount} record{blockedCount === 1 ? "" : "s"} are blocked by
                  checklist requirements, while {readyCount} can already move forward.
                </p>
                <p>
                  {analytics.blocker_data[0]
                    ? `The most common blocker right now is "${analytics.blocker_data[0].label}".`
                    : "There are currently no repeated blocker patterns to surface."}
                </p>
              </>
            )}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
