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
}

export function TabPanels({
  tabs,
  defaultTabId,
  activeTabId: controlledActiveTabId,
  onTabChange,
  className,
  tabsClassName,
  panelClassName,
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
          "flex flex-wrap items-center gap-2 rounded-full bg-[rgba(15,42,68,0.04)] p-1",
          tabsClassName,
        )}
      >
        {tabs.map((tab) => {
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
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "knowledge-gradient text-white shadow-[0_12px_20px_rgba(0,21,42,0.16)]"
                  : "text-[color:var(--color-muted-foreground)] hover:bg-white/80 hover:text-[color:var(--color-primary)]",
              )}
              onClick={() => {
                if (controlledActiveTabId === undefined) {
                  setInternalActiveTabId(tab.id);
                }
                onTabChange?.(tab.id);
              }}
            >
              {tab.label}
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
        {activeTab.description ? (
          <p className="text-muted mb-4 text-sm">{activeTab.description}</p>
        ) : null}
        {activeTab.content}
      </div>
    </div>
  );
}
