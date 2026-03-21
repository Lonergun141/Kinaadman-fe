"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextInput } from "@/components/ui/text-input";
import { formatDateTime } from "@/lib/utils";
import type { TenantHostAlias } from "@/types/domain";

interface HostAliasesCardProps {
  aliases: TenantHostAlias[];
  errorMessage?: string;
  hostnameValue: string;
  isCreating: boolean;
  removingAliasId?: string;
  onHostnameValueChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (aliasId: string) => void;
}

export function HostAliasesCard({
  aliases,
  errorMessage,
  hostnameValue,
  isCreating,
  removingAliasId,
  onHostnameValueChange,
  onAddAlias,
  onRemoveAlias,
}: HostAliasesCardProps) {
  return (
    <SurfaceCard eyebrow="Host aliases" title="Tenant hostnames">
      {errorMessage ? (
        <EmptyState
          title="Host-alias settings unavailable"
          description={errorMessage}
        />
      ) : (
        <>
          <div className="space-y-3">
            {aliases.length ? (
              aliases.map((alias) => (
                <div
                  key={alias.id}
                  className="card-item flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {alias.hostname}
                    </p>
                    <p className="muted-label mt-1">
                      Added {formatDateTime(alias.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removingAliasId === alias.id}
                    onClick={() => onRemoveAlias(alias.id)}
                  >
                    {removingAliasId === alias.id ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="No aliases configured"
                description="Add the hostnames that should resolve this tenant when white-label routing is enabled."
              />
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <TextInput
              label="New hostname"
              value={hostnameValue}
              placeholder="archive.school.edu"
              onChange={(event) => onHostnameValueChange(event.target.value)}
            />
            <Button
              className="self-end"
              onClick={onAddAlias}
              disabled={isCreating || !hostnameValue.trim()}
            >
              {isCreating ? "Adding..." : "Add hostname"}
            </Button>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}
