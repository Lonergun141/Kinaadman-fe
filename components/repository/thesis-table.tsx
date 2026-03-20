import { StatusBadge } from "@/components/ui/status-badge";
import { TransitionLink } from "@/components/ui/transition-link";
import { formatDate } from "@/lib/utils";
import type { ThesisListItem } from "@/types/domain";

export function ThesisTable({ items }: { items: ThesisListItem[] }) {
  return (
    <div className="table-shell hidden lg:block">
      <table className="min-w-full">
        <thead className="knowledge-gradient text-left text-[11px] uppercase tracking-[0.16em] text-white">
          <tr>
            <th className="px-5 py-4">Title</th>
            <th className="px-5 py-4">Reading note</th>
            <th className="px-5 py-4">Department</th>
            <th className="px-5 py-4">Year</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Updated</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={
                index % 2 === 0
                  ? "bg-[color:var(--color-surface-lowest)]"
                  : "bg-[color:var(--color-surface)]"
              }
            >
              <td className="px-5 py-5 align-top">
                <TransitionLink
                  href={`/theses/${item.id}`}
                  className="font-serif text-[1.08rem] font-medium leading-snug text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-secondary)]"
                  pendingClassName="opacity-80"
                >
                  {item.title}
                </TransitionLink>
                <p className="text-muted mt-1 text-xs italic">
                  {item.program?.name || "Unassigned program"}
                </p>
              </td>
              <td className="text-muted px-5 py-5 align-top">
                Open the detail view for contributors and full citation context.
              </td>
              <td className="text-muted px-5 py-5 align-top">
                {item.department?.name || "Unassigned department"}
              </td>
              <td className="text-muted px-5 py-5 align-top">{item.year}</td>
              <td className="px-5 py-5 align-top">
                <StatusBadge status={item.status} />
              </td>
              <td className="text-muted px-5 py-5 align-top">
                {formatDate(item.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
