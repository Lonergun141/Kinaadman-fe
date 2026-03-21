"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import { formatDateTime } from "@/lib/utils";
import type { TenantEmailDomain } from "@/types/domain";

interface EmailDomainsCardProps {
  domains: TenantEmailDomain[];
  errorMessage?: string;
  domainValue: string;
  isCreating: boolean;
  removingDomainId?: string;
  onDomainValueChange: (value: string) => void;
  onAddDomain: () => void;
  onRemoveDomain: (domainId: string) => void;
}

export function EmailDomainsCard({
  domains,
  errorMessage,
  domainValue,
  isCreating,
  removingDomainId,
  onDomainValueChange,
  onAddDomain,
  onRemoveDomain,
}: EmailDomainsCardProps) {
  return (
    <SurfaceCard eyebrow="Email domains" title="Allowed campus domains">
      {errorMessage ? (
        <EmptyState
          title="Email-domain settings unavailable"
          description={errorMessage}
        />
      ) : (
        <>
          <div className="space-y-3">
            {domains.length ? (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="card-item flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {domain.domain}
                    </p>
                    <p className="muted-label mt-1">
                      Added {formatDateTime(domain.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removingDomainId === domain.id}
                    onClick={() => onRemoveDomain(domain.id)}
                  >
                    {removingDomainId === domain.id ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="No domains configured"
                description="Add one or more approved campus domains before enabling domain enforcement."
              />
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <TextInput
              label="New email domain"
              value={domainValue}
              placeholder="campus.edu"
              onChange={(event) => onDomainValueChange(event.target.value)}
            />
            <Button
              className="self-end"
              onClick={onAddDomain}
              disabled={isCreating || !domainValue.trim()}
            >
              {isCreating ? "Adding..." : "Add domain"}
            </Button>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}
