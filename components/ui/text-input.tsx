import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextInput({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="flex flex-col gap-2.5" htmlFor={inputId}>
      <span className="text-primary-label">{label}</span>
      <input
        id={inputId}
        className={cx("input-base", className)}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[color:var(--color-error)]">{error}</span>
      ) : hint ? (
        <span className="text-xs leading-6 text-[color:var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
