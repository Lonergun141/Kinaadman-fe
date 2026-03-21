"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

export interface TabPanelItem {
  id: string;
  label: string;
  content: React.ReactNode;
  description?: string;
}

interface TabPanelsProps {
  tabs: TabPanelItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  tabsClassName?: string;
  panelClassName?: string;
  variant?: "pill" | "grid" | "underline";
  showDescriptionsInTabs?: boolean;
}

export function TabPanels({
  tabs,
  defaultTabId,
  activeTabId: controlledActiveTabId,
  onTabChange,
  className,
  tabsClassName,
  panelClassName,
  variant = "pill",
  showDescriptionsInTabs = false,
}: TabPanelsProps) {
  const [internalActiveTabId, setInternalActiveTabId] = useState(
    defaultTabId || tabs[0]?.id || "",
  );
  const activeTabId = controlledActiveTabId ?? internalActiveTabId;

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      const fallbackTabId = defaultTabId || tabs[0]?.id || "";

      if (controlledActiveTabId === undefined) {
        setInternalActiveTabId(fallbackTabId);
      } else if (fallbackTabId) {
        onTabChange?.(fallbackTabId);
      }
    }
  }, [activeTabId, controlledActiveTabId, defaultTabId, onTabChange, tabs]);

  const activeTab =
    tabs.find((tab) => tab.id === activeTabId) || tabs[0] || null;

  if (!tabs.length || !activeTab) {
    return null;
  }

  return (
    <div className={cx("space-y-5", className)}>
      <div
        role="tablist"
        aria-label="Content sections"
        className={cx(
          variant === "grid"
            ? "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            : variant === "underline"
              ? "flex flex-wrap items-center gap-5 border-b border-[rgba(15,42,68,0.1)]"
              : "flex flex-wrap items-center gap-2 rounded-full bg-[rgba(15,42,68,0.04)] p-1",
          tabsClassName,
        )}
      >
        {tabs.map((tab, index) => {
          const active = tab.id === activeTab.id;
          const tabButtonId = `tab-${tab.id}`;

          return (
            <button
              key={tab.id}
              id={tabButtonId}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              className={cx(
                variant === "grid"
                  ? "group flex min-h-[9.5rem] w-full flex-col justify-between rounded-[0.9rem] px-5 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,162,39,0.3)]"
                  : variant === "underline"
                    ? "-mb-px border-b-2 px-0 pb-3 pt-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,162,39,0.24)]"
                    : "rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,162,39,0.24)]",
                variant === "grid" && active
                  ? "knowledge-gradient text-white shadow-[0_24px_36px_rgba(0,21,42,0.14)]"
                  : null,
                variant === "grid" && !active
                  ? "bg-[rgba(255,255,255,0.82)] text-[color:var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(15,42,68,0.08),0_16px_28px_rgba(0,21,42,0.04)] hover:bg-[rgba(255,255,255,0.92)] hover:shadow-[inset_0_0_0_1px_rgba(15,42,68,0.12),0_20px_34px_rgba(0,21,42,0.05)]"
                  : null,
                variant === "pill" && active
                  ? "knowledge-gradient text-white shadow-[0_12px_20px_rgba(0,21,42,0.16)]"
                  : null,
                variant === "pill" && !active
                  ? "text-[color:var(--color-muted-foreground)] hover:bg-white/80 hover:text-[color:var(--color-primary)]"
                  : null,
                variant === "underline" && active
                  ? "border-[color:var(--color-secondary)] text-[color:var(--color-primary)]"
                  : null,
                variant === "underline" && !active
                  ? "border-transparent text-[color:var(--color-muted-foreground)] hover:border-[rgba(15,42,68,0.14)] hover:text-[color:var(--color-primary)]"
                  : null,
              )}
              onClick={() => {
                if (controlledActiveTabId === undefined) {
                  setInternalActiveTabId(tab.id);
                }
                onTabChange?.(tab.id);
              }}
            >
              {variant === "grid" ? (
                <>
                  <span className="space-y-3">
                    <span
                      className={cx(
                        "block text-[0.76rem] font-semibold uppercase tracking-[0.18em]",
                        active
                          ? "text-[rgba(255,246,214,0.88)]"
                          : "text-[color:var(--color-muted)]",
                      )}
                    >
                      Task {index + 1}
                    </span>
                    <span className="block font-serif text-[1.35rem] leading-tight">
                      {tab.label}
                    </span>
                    {showDescriptionsInTabs && tab.description ? (
                      <span
                        className={cx(
                          "block max-w-[28ch] text-sm leading-6",
                          active
                            ? "text-[rgba(247,249,251,0.82)]"
                            : "text-[color:var(--color-muted-foreground)]",
                        )}
                      >
                        {tab.description}
                      </span>
                    ) : null}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx(
                      "mt-5 h-[2px] w-14 rounded-full transition-all",
                      active
                        ? "bg-[color:var(--color-secondary)]"
                        : "bg-[rgba(15,42,68,0.12)] group-hover:bg-[rgba(15,42,68,0.22)]",
                    )}
                  />
                </>
              ) : (
                tab.label
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab.id}`}
        aria-labelledby={`tab-${activeTab.id}`}
        className={panelClassName}
      >
        {activeTab.description && !showDescriptionsInTabs ? (
          <p className="text-muted mb-4 text-sm">{activeTab.description}</p>
        ) : null}
        {activeTab.content}
      </div>
    </div>
  );
}
