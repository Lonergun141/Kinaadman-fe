import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "px-3 py-2 text-[11px] gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-sm gap-2",
};

const variantClasses = {
  primary:
    "knowledge-gradient text-white shadow-[0_18px_30px_rgba(0,21,42,0.16)] hover:shadow-[0_24px_36px_rgba(0,21,42,0.22)]",
  secondary:
    "border border-[rgba(201,162,39,0.38)] bg-transparent text-[color:var(--color-secondary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)] hover:bg-[rgba(201,162,39,0.08)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--color-secondary)] hover:bg-[rgba(15,42,68,0.05)]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center rounded-sm font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
