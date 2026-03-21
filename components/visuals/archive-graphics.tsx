import type { AppRole } from "@/stores/workspace-store";
import { cx } from "@/lib/utils";

export type VisualVariant =
  | "archive"
  | "repository"
  | "workspace"
  | "review"
  | "analytics"
  | "audit"
  | "profile"
  | "admin";

type GlyphProps = {
  className?: string;
};

function RepositoryGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5.5h14v13H5z" />
      <path d="M8 9h8" />
      <path d="M8 12.5h8" />
      <path d="M8 16h5" />
      <path d="M4 5.5h1M19 5.5h1" />
    </svg>
  );
}

function ProfileGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
      <path d="M4.5 4.5h3M16.5 4.5h3" />
    </svg>
  );
}

function WorkspaceGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5h10l4 4v10H5z" />
      <path d="M15 5v4h4" />
      <path d="M8 12h8" />
      <path d="M8 15.5h5" />
    </svg>
  );
}

function ReviewGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4.5h12v15H6z" />
      <path d="M9 8.5h6" />
      <path d="M9 12.5h6" />
      <path d="m9 16 1.6 1.6L15 13" />
    </svg>
  );
}

function AnalyticsGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 18.5h14" />
      <path d="M7.5 16V11" />
      <path d="M12 16V7" />
      <path d="M16.5 16v-4.5" />
      <path d="m7.5 10.5 4.5-3 4.5 3" />
    </svg>
  );
}

function AuditGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 5h12v14H6z" />
      <path d="M9 9.5h6" />
      <path d="M9 13h6" />
      <path d="M9 16.5h3" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function AdminGlyph({ className }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 18.5h15" />
      <path d="M6 18.5V9l6-4 6 4v9.5" />
      <path d="M9 12h1.5" />
      <path d="M13.5 12H15" />
      <path d="M9 15.5h6" />
    </svg>
  );
}

export function getVisualVariantFromPath(pathname: string): VisualVariant {
  if (pathname.startsWith("/workspace")) {
    return "workspace";
  }

  if (pathname.startsWith("/review")) {
    return "review";
  }

  if (pathname.startsWith("/analytics")) {
    return "analytics";
  }

  if (pathname.startsWith("/audit")) {
    return "audit";
  }

  if (pathname.startsWith("/profile")) {
    return "profile";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (pathname.startsWith("/repository") || pathname.startsWith("/theses")) {
    return "repository";
  }

  return "archive";
}

function glyphForVariant(variant: VisualVariant) {
  switch (variant) {
    case "workspace":
      return WorkspaceGlyph;
    case "review":
      return ReviewGlyph;
    case "analytics":
      return AnalyticsGlyph;
    case "audit":
      return AuditGlyph;
    case "profile":
      return ProfileGlyph;
    case "admin":
      return AdminGlyph;
    case "repository":
    case "archive":
    default:
      return RepositoryGlyph;
  }
}

export function NavigationGlyph({
  href,
  active = false,
  className,
}: {
  href: string;
  active?: boolean;
  className?: string;
}) {
  const variant =
    href === "/profile"
      ? "profile"
      : href === "/workspace"
        ? "workspace"
        : href === "/review"
          ? "review"
          : href === "/analytics"
            ? "analytics"
            : href === "/audit"
              ? "audit"
              : href.startsWith("/admin")
                ? "admin"
                : "repository";
  const Glyph = glyphForVariant(variant);

  return (
    <Glyph
      className={cx(
        "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
        active
          ? "text-[color:var(--color-primary)]"
          : "text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-primary)]",
        className,
      )}
    />
  );
}

function paletteForVariant(variant: VisualVariant) {
  switch (variant) {
    case "workspace":
      return {
        tint: "rgba(201, 162, 39, 0.26)",
        glow: "rgba(15, 42, 68, 0.14)",
        accent: "rgba(201, 162, 39, 0.5)",
      };
    case "review":
      return {
        tint: "rgba(15, 42, 68, 0.18)",
        glow: "rgba(201, 162, 39, 0.18)",
        accent: "rgba(15, 42, 68, 0.4)",
      };
    case "analytics":
      return {
        tint: "rgba(15, 42, 68, 0.14)",
        glow: "rgba(37, 99, 235, 0.16)",
        accent: "rgba(37, 99, 235, 0.4)",
      };
    case "audit":
      return {
        tint: "rgba(107, 113, 124, 0.16)",
        glow: "rgba(201, 162, 39, 0.18)",
        accent: "rgba(15, 42, 68, 0.28)",
      };
    case "profile":
      return {
        tint: "rgba(236, 240, 244, 0.78)",
        glow: "rgba(201, 162, 39, 0.18)",
        accent: "rgba(15, 42, 68, 0.25)",
      };
    case "admin":
      return {
        tint: "rgba(15, 42, 68, 0.16)",
        glow: "rgba(201, 162, 39, 0.22)",
        accent: "rgba(201, 162, 39, 0.48)",
      };
    case "archive":
    case "repository":
    default:
      return {
        tint: "rgba(15, 42, 68, 0.14)",
        glow: "rgba(201, 162, 39, 0.2)",
        accent: "rgba(201, 162, 39, 0.42)",
      };
  }
}

export function HeaderIllustration({
  variant,
  className,
}: {
  variant: VisualVariant;
  className?: string;
}) {
  const Glyph = glyphForVariant(variant);
  const palette = paletteForVariant(variant);

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[0.75rem] border border-[rgba(15,42,68,0.08)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_22px_40px_rgba(0,21,42,0.06)] backdrop-blur-sm",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(circle at 20% 18%, ${palette.glow}, transparent 35%),
            radial-gradient(circle at 82% 24%, ${palette.tint}, transparent 32%),
            linear-gradient(135deg, rgba(255,255,255,0.82), rgba(247,249,251,0.96))
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-[linear-gradient(90deg,transparent,rgba(15,42,68,0.12),transparent)]" />
      <div className="relative h-[168px]">
        <div
          className="absolute left-0 top-0 h-16 w-16 rounded-full blur-2xl"
          style={{ backgroundColor: palette.glow }}
        />
        <div
          className="absolute bottom-2 right-2 h-20 w-20 rounded-full blur-2xl"
          style={{ backgroundColor: palette.tint }}
        />
        <div className="absolute left-4 top-6 flex h-12 w-12 items-center justify-center rounded-[0.8rem] border border-[rgba(15,42,68,0.08)] bg-white/86 text-[color:var(--color-primary)] shadow-[0_10px_20px_rgba(0,21,42,0.06)]">
          <Glyph className="h-5 w-5" />
        </div>
        <div className="absolute left-4 top-24 h-[2px] w-28 rounded-full bg-[rgba(15,42,68,0.08)]" />
        <div className="absolute left-4 top-[7.75rem] h-[2px] w-20 rounded-full bg-[rgba(15,42,68,0.08)]" />
        <div className="absolute right-5 top-7 w-[48%] rounded-[1rem] border border-[rgba(15,42,68,0.08)] bg-white/90 p-3 shadow-[0_14px_26px_rgba(0,21,42,0.06)]">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
            <span className="h-[2px] flex-1 rounded-full bg-[rgba(15,42,68,0.09)]" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <span className="h-8 rounded-[0.65rem] bg-[rgba(15,42,68,0.06)]" />
            <span className="h-8 rounded-[0.65rem] bg-[rgba(201,162,39,0.14)]" />
            <span className="h-8 rounded-[0.65rem] bg-[rgba(15,42,68,0.08)]" />
          </div>
        </div>
        <div className="absolute bottom-4 left-[26%] right-4 rounded-[1rem] border border-[rgba(15,42,68,0.08)] bg-white/84 px-4 py-3 shadow-[0_16px_28px_rgba(0,21,42,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <span className="h-[2px] w-20 rounded-full bg-[rgba(15,42,68,0.09)]" />
            <div className="flex gap-2">
              <span
                className="h-7 w-7 rounded-full border border-white/70"
                style={{ backgroundColor: palette.tint }}
              />
              <span
                className="h-7 w-7 rounded-full border border-white/70"
                style={{ backgroundColor: palette.accent }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "relative h-28 w-full max-w-[300px] overflow-hidden rounded-[0.9rem] border border-[rgba(15,42,68,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(247,249,251,0.9))] shadow-[0_22px_36px_rgba(0,21,42,0.05)]",
        className,
      )}
    >
      <div className="absolute left-4 top-4 h-16 w-16 rounded-full bg-[rgba(201,162,39,0.16)] blur-2xl" />
      <div className="absolute right-4 top-4 h-14 w-14 rounded-full bg-[rgba(15,42,68,0.1)] blur-2xl" />
      <div className="absolute left-6 top-5 flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-white/92 text-[color:var(--color-primary)] shadow-[0_10px_18px_rgba(0,21,42,0.08)]">
        <RepositoryGlyph className="h-[18px] w-[18px]" />
      </div>
      <div className="absolute right-5 top-5 rounded-[0.8rem] border border-[rgba(15,42,68,0.08)] bg-white/90 px-3 py-2 shadow-[0_10px_20px_rgba(0,21,42,0.06)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[color:var(--color-secondary)]" />
          <span className="h-[2px] w-16 rounded-full bg-[rgba(15,42,68,0.12)]" />
        </div>
      </div>
      <div className="absolute bottom-4 left-6 right-6 rounded-[0.9rem] border border-[rgba(15,42,68,0.08)] bg-white/90 px-4 py-3 shadow-[0_12px_24px_rgba(0,21,42,0.05)]">
        <div className="h-[2px] w-24 rounded-full bg-[rgba(15,42,68,0.1)]" />
        <div className="mt-3 flex gap-2">
          <span className="h-6 flex-1 rounded-[0.55rem] bg-[rgba(15,42,68,0.06)]" />
          <span className="h-6 w-12 rounded-[0.55rem] bg-[rgba(201,162,39,0.14)]" />
        </div>
      </div>
    </div>
  );
}

function resolveStatVariant(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("publish")) {
    return "analytics";
  }
  if (
    normalizedLabel.includes("review") ||
    normalizedLabel.includes("workflow") ||
    normalizedLabel.includes("blocked")
  ) {
    return "review";
  }
  if (
    normalizedLabel.includes("user") ||
    normalizedLabel.includes("invite") ||
    normalizedLabel.includes("policy") ||
    normalizedLabel.includes("brand")
  ) {
    return "admin";
  }
  if (normalizedLabel.includes("profile")) {
    return "profile";
  }
  if (normalizedLabel.includes("audit")) {
    return "audit";
  }

  return "repository";
}

export function StatGlyph({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const Glyph = glyphForVariant(resolveStatVariant(label));

  return (
    <div
      className={cx(
        "flex h-11 w-11 items-center justify-center rounded-[0.85rem] border border-[rgba(15,42,68,0.08)] bg-white/90 text-[color:var(--color-primary)] shadow-[0_12px_22px_rgba(0,21,42,0.06)]",
        className,
      )}
    >
      <Glyph className="h-[18px] w-[18px]" />
    </div>
  );
}

export function SidebarHero({
  role,
  tenantName,
  className,
}: {
  role: AppRole;
  tenantName: string;
  className?: string;
}) {
  const variant: VisualVariant =
    role === "STUDENT"
      ? "workspace"
      : role === "ADVISER" || role === "LIBRARIAN"
        ? "review"
        : role === "TENANT_ADMIN" || role === "SUPER_ADMIN"
          ? "admin"
          : "archive";
  const Glyph = glyphForVariant(variant);

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[0.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-4 py-4 text-white shadow-[0_22px_36px_rgba(0,0,0,0.16)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,224,142,0.24),transparent_28%),radial-gradient(circle_at_12%_78%,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[0.85rem] border border-white/12 bg-white/10 text-white">
          <Glyph className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/68">
            Living archive
          </p>
          <p className="mt-1 max-w-[12rem] text-balance font-serif text-[1.15rem] leading-tight">
            {tenantName}
          </p>
        </div>
      </div>
      <div className="relative mt-4 rounded-[0.8rem] border border-white/10 bg-white/6 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/62">
            Current mode
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/86">
            {role.replaceAll("_", " ")}
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <span className="block h-[2px] w-24 rounded-full bg-white/25" />
            <span className="block h-[2px] w-16 rounded-full bg-white/14" />
          </div>
          <div className="flex gap-2">
            <span className="h-7 w-7 rounded-full border border-white/12 bg-[rgba(255,224,142,0.22)]" />
            <span className="h-7 w-7 rounded-full border border-white/12 bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
