import { TransitionLink } from "@/components/ui/transition-link";
import { cx } from "@/lib/utils";

interface FullScreenMessageProps {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryAction?: React.ReactNode;
}

export function FullScreenMessage({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  secondaryAction,
}: FullScreenMessageProps) {
  return (
    <main className="archive-grid flex min-h-screen items-center justify-center px-4 py-16 sm:px-8">
      <div className="paper-panel max-w-3xl space-y-6 px-8 py-12 text-center sm:px-12">
        <p className="muted-label">{eyebrow}</p>
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,4vw,4.2rem)] leading-[0.92] font-medium tracking-[-0.04em] text-balance">
            {title}
          </h1>
          <p className="text-muted mx-auto max-w-xl">{description}</p>
        </div>
        {(actionHref && actionLabel) || secondaryAction ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actionHref && actionLabel ? (
              <TransitionLink
                href={actionHref}
                className={cx(
                  "knowledge-gradient inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all hover:shadow-[0_20px_36px_rgba(0,21,42,0.18)] active:scale-[0.98]",
                )}
                pendingClassName="opacity-85"
              >
                {actionLabel}
              </TransitionLink>
            ) : null}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </main>
  );
}
