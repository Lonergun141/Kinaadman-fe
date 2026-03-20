import type { SelectHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function SelectField({
  label,
  hint,
  children,
  id,
  className,
  ...props
}: SelectFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex flex-col gap-2.5" htmlFor={inputId}>
      <span className="text-primary-label">{label}</span>
      <span className="relative">
        <select
          id={inputId}
          className={cx("input-base appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </span>
      {hint ? (
        <span className="text-xs leading-6 text-[color:var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
