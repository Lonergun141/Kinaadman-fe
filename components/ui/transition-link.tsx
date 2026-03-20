"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

type TransitionLinkProps = React.ComponentProps<typeof Link> & {
  onNavigate?: () => void;
  pendingClassName?: string;
};

function resolveHrefPath(
  href: React.ComponentProps<typeof Link>["href"],
  fallbackPathname: string,
) {
  const rawHref =
    typeof href === "string"
      ? href
      : typeof href.pathname === "string"
        ? href.pathname
        : fallbackPathname;

  if (rawHref.startsWith("http://") || rawHref.startsWith("https://")) {
    return rawHref;
  }

  return rawHref.split("#")[0]?.split("?")[0] || fallbackPathname;
}

function isTrackedNavigation(
  event: React.MouseEvent<HTMLAnchorElement>,
  target?: string,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return false;
  }

  if (target && target !== "_self") {
    return false;
  }

  return true;
}

export function TransitionLink({
  href,
  onClick,
  onNavigate,
  className,
  pendingClassName,
  target,
  children,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  const navigationPendingHref = useUiStore(
    (state) => state.navigationPendingHref,
  );
  const startNavigation = useUiStore((state) => state.startNavigation);
  const resolvedHrefPath = resolveHrefPath(href, pathname);
  const currentPathname = pathname.split("#")[0]?.split("?")[0] || pathname;
  const isPending = navigationPendingHref === resolvedHrefPath;

  return (
    <Link
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event);

        if (!isTrackedNavigation(event, target)) {
          return;
        }

        onNavigate?.();

        if (
          resolvedHrefPath === currentPathname ||
          resolvedHrefPath.startsWith("http://") ||
          resolvedHrefPath.startsWith("https://")
        ) {
          return;
        }

        startNavigation(resolvedHrefPath);
      }}
      className={cx(className, isPending ? pendingClassName : undefined)}
      aria-busy={isPending || props["aria-busy"] ? true : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
