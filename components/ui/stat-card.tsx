interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "secondary" | "neutral";
}

const toneClasses = {
  primary: "bg-[rgba(255,255,255,0.94)]",
  secondary: "bg-[linear-gradient(180deg,rgba(201,162,39,0.12),rgba(255,255,255,0.94))]",
  neutral: "bg-[rgba(242,244,246,0.96)]",
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
}: StatCardProps) {
  return (
    <article
      className={`rounded-xl px-5 py-5 shadow-[0_14px_30px_rgba(0,21,42,0.05)] ring-1 ring-[rgba(15,42,68,0.04)] ${toneClasses[tone]}`}
    >
      <p className="muted-label">{label}</p>
      <p className="mt-3 font-serif text-[2.15rem] leading-none tracking-[-0.04em] text-[color:var(--color-primary)]">
        {value}
      </p>
      <p className="text-muted mt-2 text-[13px]">{detail}</p>
    </article>
  );
}
