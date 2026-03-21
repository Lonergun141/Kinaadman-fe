"use client";

import { useEffect } from "react";
import type { TenantContext } from "@/types/domain";

function isHexColor(value: string | null | undefined) {
  return Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()));
}

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

function hexToRgb(value: string) {
  const normalized = normalizeHex(value);

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(hexA: string, hexB: string, ratio: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const clamped = Math.max(0, Math.min(1, ratio));

  return rgbToHex(
    a.r + (b.r - a.r) * clamped,
    a.g + (b.g - a.g) * clamped,
    a.b + (b.b - a.b) * clamped,
  );
}

const defaultTheme = {
  displayName: "Kinaadman",
  primary: "#00152a",
  primaryContainer: "#0f2a44",
  secondary: "#c9a227",
};

export function TenantThemeSync({
  tenantContext,
}: {
  tenantContext: TenantContext | null;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const primary = isHexColor(tenantContext?.branding?.primary_color)
      ? normalizeHex(tenantContext!.branding!.primary_color)
      : defaultTheme.primary;
    const secondary = isHexColor(tenantContext?.branding?.secondary_color)
      ? normalizeHex(tenantContext!.branding!.secondary_color)
      : defaultTheme.secondary;
    const primaryContainer = mix(primary, "#ffffff", 0.14);
    const selection = mix(secondary, "#ffffff", 0.45);
    const displayName =
      tenantContext?.branding?.display_name ||
      tenantContext?.name ||
      defaultTheme.displayName;

    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--color-primary-container", primaryContainer);
    root.style.setProperty("--color-secondary", secondary);
    root.style.setProperty("--color-selection", selection);
    document.title = `${displayName} | Kinaadman`;

    return () => {
      root.style.setProperty("--color-primary", defaultTheme.primary);
      root.style.setProperty("--color-primary-container", defaultTheme.primaryContainer);
      root.style.setProperty("--color-secondary", defaultTheme.secondary);
      root.style.removeProperty("--color-selection");
      document.title = "Kinaadman";
    };
  }, [tenantContext]);

  return null;
}
