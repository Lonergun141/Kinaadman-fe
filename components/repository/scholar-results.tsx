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

  return `${discipline} archive record, ${item.year}. Updated ${formatDate(item.updated_at)}.`;
}

function getSnippet(item: ThesisListItem) {
  const statusLabel = toTitleCase(item.status);

  if (item.status === "PUBLISHED") {
    return "Published archive record available for discovery. Open the thesis page for the abstract, authors, adviser details, and full repository metadata.";
  }

  return `${statusLabel} archive record. Open the thesis page for the abstract, authors, adviser details, and full repository metadata.`;
}

export function ScholarResults({
  items,
  tenantDisplayName,
}: ScholarResultsProps) {
  return (
    <div className="space-y-8">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[0.5rem] bg-[rgba(255,255,255,0.82)] px-5 py-5 shadow-[0_18px_30px_rgba(0,21,42,0.04)] transition-all duration-200 hover:bg-[color:var(--color-surface-high)] hover:shadow-[0_24px_42px_rgba(0,21,42,0.08)] sm:px-7 sm:py-6"
        >
          <p className="text-[12px] leading-6 text-[color:var(--color-muted)]">
            {getArchiveLine(item, tenantDisplayName)}
          </p>
          <TransitionLink
            href={`/theses/${item.id}`}
            className="mt-1 block font-serif text-[clamp(1.45rem,2.3vw,2rem)] leading-[1.08] text-[color:var(--color-primary-container)] transition-colors hover:text-[color:var(--color-secondary)]"
            pendingClassName="opacity-80"
          >
            {item.title}
          </TransitionLink>
          <p className="mt-2 font-serif text-sm italic leading-7 text-[color:var(--color-muted-foreground)]">
            {getCitationLine(item)}
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            {getSnippet(item)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
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
        </article>
      ))}
    </div>
  );
}
