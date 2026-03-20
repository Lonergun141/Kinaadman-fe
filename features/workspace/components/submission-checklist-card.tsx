"use client";

import { SurfaceCard } from "@/components/ui/surface-card";

export function SubmissionChecklistCard() {
  return (
    <SurfaceCard eyebrow="Submission checklist" title="Ready-to-submit controls">
      <ul className="text-muted space-y-2">
        <li>Metadata fields are completed and aligned with department standards.</li>
        <li>Adviser assignment is confirmed if review routing needs it.</li>
        <li>The abstract is ready for institutional review.</li>
        <li>The year, department, and program reflect the final archive record.</li>
      </ul>
    </SurfaceCard>
  );
}
