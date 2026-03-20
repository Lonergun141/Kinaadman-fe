"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  widthClassName?: string;
}

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

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  side = "right",
  widthClassName = "w-full max-w-[430px]",
}: DrawerProps) {
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
    <div className="fixed inset-0 z-[88] bg-slate-950/38 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          "paper-panel absolute inset-y-0 z-[89] flex flex-col overflow-hidden rounded-none sm:rounded-[0.5rem]",
          widthClassName,
          side === "right" ? "right-0" : "left-0",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="space-y-2">
            {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
            <div className="space-y-2">
              <h2
                id={titleId}
                className="text-[1.55rem] leading-tight tracking-[-0.03em] text-balance"
              >
                {title}
              </h2>
              {description ? (
                <p className="text-muted text-sm">{description}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,42,68,0.05)] text-[color:var(--color-primary)] transition-colors hover:bg-[rgba(15,42,68,0.1)]"
            aria-label="Close drawer"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="editorial-divider mx-5 sm:mx-6" />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          {children}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
