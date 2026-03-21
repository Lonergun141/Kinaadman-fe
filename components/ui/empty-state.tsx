import { EmptyStateIllustration } from "@/components/visuals/archive-graphics";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="paper-panel flex flex-col items-center justify-center px-6 py-12 text-center sm:px-8">
      <EmptyStateIllustration className="mb-6" />
      <p className="muted-label mb-2">Archive state</p>
      <h3 className="font-serif text-[1.55rem] leading-tight text-[color:var(--color-primary)] text-balance">
        {title}
      </h3>
      <p className="text-muted mt-2 max-w-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
