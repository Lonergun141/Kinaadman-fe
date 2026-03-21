"use client";

import { SurfaceCard } from "@/components/ui/surface-card";

export interface SubmissionChecklistItem {
  label: string;
  complete?: boolean;
}

interface SubmissionChecklistCardProps {
  embedded?: boolean;
  items?: SubmissionChecklistItem[];
}

const defaultChecklistItems: SubmissionChecklistItem[] = [
  {
    label: "Metadata fields are complete and aligned with department standards.",
  },
  {
    label: "Adviser assignment is confirmed if review routing needs it.",
  },
  {
    label: "Main thesis PDF and supporting files are prepared for upload before submission.",
  },
  {
    label: "The abstract is polished for academic review.",
  },
  {
    label: "Year, department, and program reflect the final archive record.",
  },
];

function ChecklistContent({
  items = defaultChecklistItems,
}: Pick<SubmissionChecklistCardProps, "items">) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-3">
          <span
            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${
              item.complete === true
                ? "bg-[rgba(201,162,39,0.18)] text-[color:var(--color-secondary)]"
                : item.complete === false
                  ? "bg-[rgba(15,42,68,0.06)] text-[color:var(--color-muted)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.1)]"
                  : "bg-[rgba(201,162,39,0.12)] text-[color:var(--color-secondary)]"
            }`}
          >
            {item.complete === true ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10.5 8.5 14 15 7.5" />
              </svg>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <span
            className={`text-sm leading-7 ${
              item.complete === true
                ? "text-[color:var(--color-primary)]"
                : "text-[color:var(--color-muted-foreground)]"
            }`}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SubmissionChecklistCard({
  embedded = false,
  items,
}: SubmissionChecklistCardProps) {
  if (embedded) {
    return <ChecklistContent items={items} />;
  }

  return (
    <SurfaceCard eyebrow="Submission checklist" title="Ready-to-submit controls">
      <ChecklistContent items={items} />
    </SurfaceCard>
  );
}
