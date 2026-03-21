import { TransitionLink } from "@/components/ui/transition-link";
import { formatDate, toTitleCase } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

interface ScholarResultsProps {
  items: ThesisListItem[];
  tenantDisplayName: string;
}

function getArchiveLine(item: ThesisListItem, tenantDisplayName: string) {
  return [
    tenantDisplayName,
    item.department?.name,
    item.program?.name,
  ]
    .filter(Boolean)
    .join(" - ");
}

function getCitationLine(item: ThesisListItem) {
  const discipline = item.program?.name || item.department?.name || "Institutional archive";

  return `${discipline} archive record, ${item.year}.`;
}

function getSnippet(item: ThesisListItem) {
  const statusLabel = toTitleCase(item.status);

  if (item.status === "PUBLISHED") {
    return `Published archive record. Updated ${formatDate(item.updated_at)}.`;
  }

  return `${statusLabel} archive record. Last updated ${formatDate(item.updated_at)}.`;
}

export function ScholarResults({
  items,
  tenantDisplayName,
}: ScholarResultsProps) {
  return (
    <div className="overflow-hidden rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.98)] shadow-[0_18px_32px_rgba(0,21,42,0.04)]">
      {items.map((item) => (
        <article
          key={item.id}
          className="grid gap-4 border-b border-[rgba(15,42,68,0.08)] px-4 py-4 transition-colors duration-200 last:border-b-0 hover:bg-[rgba(247,244,237,0.62)] sm:px-5 lg:grid-cols-[minmax(0,1fr)_180px]"
        >
          <div>
            <p className="text-[11px] leading-5 text-[color:var(--color-muted)]">
              {getArchiveLine(item, tenantDisplayName)}
            </p>
            <TransitionLink
              href={`/theses/${item.id}`}
              className="mt-1 block max-w-4xl font-serif text-[clamp(1.24rem,1.9vw,1.62rem)] leading-[1.12] text-[color:var(--color-primary-container)] transition-colors hover:text-[color:var(--color-secondary)]"
              pendingClassName="opacity-80"
            >
              {item.title}
            </TransitionLink>
            <p className="mt-1 text-[13px] leading-6 text-[color:var(--color-muted-foreground)]">
              {getCitationLine(item)}
            </p>
            <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-[color:var(--color-muted-foreground)]">
              {getSnippet(item)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
              <TransitionLink
                href={`/theses/${item.id}`}
                className="text-[color:var(--color-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
                pendingClassName="opacity-80"
              >
                View record
              </TransitionLink>
              <span>{toTitleCase(item.status)}</span>
              <span>Year {item.year}</span>
              {item.published_at ? (
                <span>Published {formatDate(item.published_at)}</span>
              ) : (
                <span>Updated {formatDate(item.updated_at)}</span>
              )}
            </div>
          </div>

          <div className="hidden justify-self-end text-right lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-secondary)]">
              [{item.status === "PUBLISHED" ? "Archive" : "Record"}]
            </p>
            <p className="mt-1 text-base text-[color:var(--color-primary-container)]">
              {item.program?.name || item.department?.name || tenantDisplayName}
            </p>
            <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {item.department?.name || "Institutional repository"}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
