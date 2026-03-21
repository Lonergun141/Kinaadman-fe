"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

const sizeClasses = {
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = "lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/42 p-4 backdrop-blur-[2px] sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          "paper-panel relative z-[91] flex max-h-[90vh] w-full flex-col overflow-hidden",
          sizeClasses[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 sm:px-8">
          <div className="space-y-2">
            {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
            <div className="space-y-2">
              <h2
                id={titleId}
                className="text-[1.75rem] leading-tight tracking-[-0.03em] text-balance"
              >
                {title}
              </h2>
              {description ? (
                <p className="text-muted max-w-2xl text-sm">{description}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,42,68,0.05)] text-[color:var(--color-primary)] transition-colors hover:bg-[rgba(15,42,68,0.1)]"
            aria-label="Close modal"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="editorial-divider mx-6 sm:mx-8" />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {children}
        </div>

        {footer ? (
          <>
            <div className="editorial-divider mx-6 sm:mx-8" />
            <div className="px-6 py-5 sm:px-8">{footer}</div>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
