interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "secondary" | "neutral";
}

const toneClasses = {
  primary:
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92))]",
  secondary:
    "bg-[linear-gradient(180deg,rgba(201,162,39,0.16),rgba(255,255,255,0.96))]",
  neutral:
    "bg-[linear-gradient(180deg,rgba(242,244,246,0.96),rgba(255,255,255,0.92))]",
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
}: StatCardProps) {
  return (
    <article className={`paper-panel px-4 py-4 sm:px-5 sm:py-4 ${toneClasses[tone]}`}>
      <p className="muted-label">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-serif text-[2.15rem] leading-none tracking-[-0.05em] text-[color:var(--color-primary)]">
          {value}
        </p>
        <span
          aria-hidden="true"
          className={
            tone === "secondary"
              ? "h-10 w-10 rounded-full bg-[rgba(201,162,39,0.16)] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.2)]"
              : tone === "neutral"
                ? "h-10 w-10 rounded-full bg-[rgba(15,42,68,0.06)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]"
                : "h-10 w-10 rounded-full bg-[rgba(15,42,68,0.07)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08)]"
          }
        />
      </div>
      <p className="text-muted mt-2.5 text-[13px]">{detail}</p>
    </article>
  );
}
