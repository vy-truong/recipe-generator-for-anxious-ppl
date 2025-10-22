"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * BackLink renders a simple back arrow. It uses `usePathname` to determine a sensible default.
 * By default it goes back to "/" when no explicit `href` is provided.
 */
export default function BackLink({ href }) {
  const pathname = usePathname();
  const targetHref = useMemo(() => href || "/", [href]);

  if (pathname === targetHref) {
    return null;
  }

  return (
    <Link
      href={targetHref}
      className="inline-flex items-center gap-2 text-sm text-[var(--color-text)] dark:text-[var(--color-textd)] hover:text-[var(--color-heading)] dark:hover:text-[var(--color-headingd)] transition"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-default">←</span>
      Back
    </Link>
  );
}
