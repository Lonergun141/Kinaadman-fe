import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

export function ThesisCards({ items }: { items: ThesisListItem[] }) {
  return (
    <div className="grid gap-5 lg:hidden">
      {items.map((item) => (
        <article key={item.id} className="paper-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <Link
                href={`/theses/${item.id}`}
                className="block font-serif text-[1.25rem] leading-snug text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
              >
                {item.title}
              </Link>
              <p className="text-muted text-xs italic">
                {item.department?.name || "Unassigned department"}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--color-muted)]">
            <span>{item.year}</span>
            <span>{formatDate(item.updated_at)}</span>
            <span>{item.program?.name || "Unassigned program"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
