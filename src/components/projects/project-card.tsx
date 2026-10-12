"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, MoreHorizontal, Settings2 } from "lucide-react";
import type { JoinedProject } from "@/lib/project-shared";

const joinedDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

const badgeClass = "rounded-md bg-rc-fg/[0.06] px-2 py-0.5 text-[11px] text-rc-fg-muted";

const menuItemClass =
  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-rc-surface-hover";

export default function ProjectCard({
  project,
  onConfigure,
  onLeave,
}: {
  project: JoinedProject;
  onConfigure: (project: JoinedProject) => void;
  onLeave: (project: JoinedProject) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = project.name || "Untitled project";

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  return (
    <div className="group relative rounded-2xl bg-rc-surface transition-colors hover:bg-rc-surface-hover">
      <Link
        href={`/projects/${encodeURIComponent(project.publicId)}`}
        className="flex flex-col gap-4 p-5"
      >
        <span className="flex items-center gap-3 pr-10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rc-surface-hover text-sm font-semibold uppercase text-rc-fg group-hover:bg-rc-bg">
            {label.charAt(0)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-semibold tracking-tight text-rc-fg">
              {label}
            </span>
            <span className="truncate font-mono text-xs text-rc-fg-subtle">
              {project.publicId}
            </span>
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <span className={badgeClass}>{project.isOwner ? "Owner" : "Member"}</span>
          <span className={badgeClass}>
            {project.ideaCount} {project.ideaCount === 1 ? "idea" : "ideas"}
          </span>
          <span className={badgeClass}>
            {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </span>
          <span className="ml-auto text-[11px] text-rc-fg-subtle">
            Joined {joinedDate.format(new Date(project.joinedAt))}
          </span>
        </span>
      </Link>
      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          type="button"
          aria-label="Project options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rc-fg-subtle transition-colors hover:bg-rc-bg hover:text-rc-fg"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-10 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-rc-border bg-rc-surface py-1">
            {project.isOwner ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onConfigure(project);
                }}
                className={`${menuItemClass} text-rc-fg`}
              >
                <Settings2 className="h-4 w-4 shrink-0 text-rc-fg-muted" aria-hidden />
                Configure
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLeave(project);
              }}
              className={`${menuItemClass} text-rc-red`}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Leave project
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
