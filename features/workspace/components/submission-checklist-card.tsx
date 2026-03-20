"use client";

import { SurfaceCard } from "@/components/ui/surface-card";

interface SubmissionChecklistCardProps {
  embedded?: boolean;
}

function ChecklistContent() {
  return (
    <ul className="space-y-4">
      {[
        "Metadata fields are complete and aligned with department standards.",
        "Adviser assignment is confirmed if review routing needs it.",
        "Main thesis PDF and supporting files are prepared for upload before submission.",
        "The abstract is polished for academic review.",
        "Year, department, and program reflect the final archive record.",
      ].map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--color-secondary)]" />
          <span className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SubmissionChecklistCard({
  embedded = false,
}: SubmissionChecklistCardProps) {
  if (embedded) {
    return <ChecklistContent />;
  }

  return (
    <SurfaceCard eyebrow="Submission checklist" title="Ready-to-submit controls">
      <ChecklistContent />
    </SurfaceCard>
  );
}
