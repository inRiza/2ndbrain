"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Navbar({ projectId = "" }: { projectId?: string }) {
  const pathname = usePathname();
  const inProject = Boolean(projectId);
  const ideasHref = inProject ? `/projects/${encodeURIComponent(projectId)}` : "/projects";
  const judgeHref = inProject
    ? `/projects/${encodeURIComponent(projectId)}/judge`
    : "/projects";

  return (
    <header className="sticky top-0 z-50 border-b border-rc-border bg-rc-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-2">
        <Link href="/projects" className="shrink-0 text-lg font-semibold text-rc-fg">
          2ndbrain
        </Link>
        <nav className="flex min-w-0 flex-1 justify-center gap-1">
          {inProject ? (
            <>
              <Link
                href={ideasHref}
                className={
                  pathname === ideasHref
                    ? "rounded-sm bg-rc-surface-hover px-2.5 py-1.5 text-sm font-medium text-rc-fg"
                    : "rounded-sm px-2.5 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
                }
              >
                Ideas
              </Link>
              <Link
                href={judgeHref}
                className={
                  pathname === judgeHref
                    ? "rounded-sm bg-rc-surface-hover px-2.5 py-1.5 text-sm font-medium text-rc-fg"
                    : "rounded-sm px-2.5 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
                }
              >
                Judge
              </Link>
            </>
          ) : null}
          {inProject ? (
            <Link
              href="/projects"
              className="rounded-sm px-2.5 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
            >
              Projects
            </Link>
          ) : null}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
