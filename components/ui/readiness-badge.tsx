import { getReadinessClasses, getReadinessStatusLabel } from "@/lib/publication-readiness";
import { cx } from "@/lib/utils";

export function ReadinessBadge({
  status,
  children,
}: {
  status: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={cx("badge-base", getReadinessClasses(status))}>
      {children || getReadinessStatusLabel(status)}
    </span>
  );
}
