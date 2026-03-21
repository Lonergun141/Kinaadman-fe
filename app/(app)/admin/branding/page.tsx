"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import { updateBranding } from "@/features/admin/api";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AdminBrandingPage() {
  const activeTenantId = useWorkspaceStore((state) => state.activeTenantId);
  const tenantContext = useTenantStore((state) => state.tenantContext);
  const setTenantContext = useTenantStore((state) => state.setTenantContext);

  const [displayName, setDisplayName] = useState(
    tenantContext?.branding?.display_name || tenantContext?.name || "",
  );
  const [primaryColor, setPrimaryColor] = useState(
    tenantContext?.branding?.primary_color || "#0F2A44",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    tenantContext?.branding?.secondary_color || "#C9A227",
  );

  const brandingMutation = useMutation({
    mutationFn: updateBranding,
    onSuccess: (branding) => {
      if (!tenantContext) {
        return;
      }

      setTenantContext({
        ...tenantContext,
        branding,
      });
    },
  });

  if (!tenantContext) {
    return null;
  }

  return (
    <div className="page-shell space-y-8">
      <PageHeader
        eyebrow="Tenant administration"

        description="Shape the tenant masthead, primary palette, and overall first impression so the archive feels institutional and deliberate."
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard eyebrow="Live preview" title="Repository masthead preview">
          <div
            className="rounded-[0.5rem] p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 100%)`,
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
              Active masthead
            </p>
            <h3 className="mt-3 font-serif text-2xl italic text-white">
              {displayName}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-7 text-white/80">
              A secure, institution-first repository interface for thesis and
              capstone research.
            </p>
            <div
              className="mt-5 h-1.5 rounded-full"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Brand controls" title="Identity settings">
          <div className="space-y-3">
            <TextInput
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Primary color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
              />
              <TextInput
                label="Secondary color"
                value={secondaryColor}
                onChange={(event) => setSecondaryColor(event.target.value)}
              />
            </div>
            {brandingMutation.error ? (
              <div className="rounded-[0.5rem] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[color:var(--color-error)]">
                {brandingMutation.error.message}
              </div>
            ) : null}
            <Button
              onClick={() =>
                brandingMutation.mutate({
                  tenantId: activeTenantId,
                  displayName,
                  primaryColor,
                  secondaryColor,
                  themeTokens: tenantContext.branding?.theme_tokens || {},
                })
              }
              disabled={brandingMutation.isPending}
            >
              {brandingMutation.isPending ? "Saving..." : "Save branding"}
            </Button>
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
