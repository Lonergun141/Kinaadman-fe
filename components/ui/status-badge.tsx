import { cx, toTitleCase } from "@/lib/utils";

const styles: Record<string, string> = {
  DRAFT:
    "bg-[rgba(15,42,68,0.06)] text-[color:var(--color-muted-foreground)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]",
  SUBMITTED:
    "bg-[rgba(201,162,39,0.14)] text-[color:var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.18)]",
  IN_REVIEW:
    "bg-[rgba(37,99,235,0.1)] text-[color:var(--color-info)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.15)]",
  APPROVED:
    "bg-[rgba(22,163,74,0.1)] text-[color:var(--color-success)] shadow-[inset_0_0_0_1px_rgba(22,163,74,0.15)]",
  PUBLISHED:
    "bg-[rgba(201,162,39,0.18)] text-[color:var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.22)]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "badge-base",
        styles[status] || "bg-slate-100 text-slate-700",
      )}
    >
      {toTitleCase(status)}
    </span>
  );
}
