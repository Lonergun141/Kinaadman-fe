import { StatusBadge } from "@/components/ui/status-badge";
import { TransitionLink } from "@/components/ui/transition-link";
import { formatDate } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

export function ThesisCards({ items }: { items: ThesisListItem[] }) {
  return (
    <div className="grid gap-5 lg:hidden">
      {items.map((item) => (
        <article key={item.id} className="paper-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="muted-label">Archive record</p>
              <TransitionLink
                href={`/theses/${item.id}`}
                className="block font-serif text-[1.25rem] leading-snug text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
                pendingClassName="opacity-80"
              >
                {item.title}
              </TransitionLink>
              <p className="text-muted text-xs italic">
                {item.department?.name || "Unassigned department"}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="pill-outline">{item.year}</span>
            <span className="pill-outline">{formatDate(item.updated_at)}</span>
            <span className="pill-outline">
              {item.program?.name || "Unassigned program"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
