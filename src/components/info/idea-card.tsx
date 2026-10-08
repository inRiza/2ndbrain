"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MoreHorizontal, Trash2 } from "lucide-react";
import UserAvatar from "@/components/auth/user-avatar";
import { avatarPath } from "@/lib/avatar";
import { formatUpdated, type Idea } from "@/lib/idea-doc";
import { judgeStorageKey } from "@/lib/judge";

export default function IdeaCard({
  idea,
  projectId,
  topic = "",
  author = "",
  canDelete = false,
  onDeleted,
}: {
  idea: Idea;
  projectId: string;
  topic?: string;
  author?: string;
  canDelete?: boolean;
  onDeleted?: () => void;
}) {
  const href = `/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(idea.slug)}`;
  const avatarUrl = author ? `${avatarPath(author)}` : "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  const remove = async () => {
    if (!canDelete || busy) return;
    setBusy(true);
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(idea.slug)}`,
      { method: "DELETE", credentials: "include" },
    );
    setBusy(false);
    setMenuOpen(false);
    if (!response.ok) return;
    localStorage.removeItem(judgeStorageKey(projectId, idea.slug));
    onDeleted?.();
  };

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-rc-card-border bg-rc-surface p-4 shadow-[var(--rc-card-shadow)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--rc-card-shadow-hover)]">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-rc-fg-subtle">
          {[topic, idea.updated ? formatUpdated(idea.updated) : ""].filter(Boolean).join(" · ")}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {author ? (
            <UserAvatar username={author} avatarUrl={avatarUrl} size={28} />
          ) : null}
          {canDelete ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Idea options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-[8.5rem] overflow-hidden rounded-md border border-rc-border bg-rc-surface py-1 shadow-[var(--rc-card-shadow)]">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove()}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-rc-red hover:bg-rc-surface-hover disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                    {busy ? "Deleting…" : "Delete"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-rc-fg">
          {idea.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-rc-fg-muted">{idea.summary}</p>
      </div>
      <div className="mt-auto flex items-center justify-end gap-3">
        <Link
          href={href}
          className="group rc-btn-primary inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border-transparent px-3 py-1.5 text-sm font-medium"
        >
          Open idea
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-rotate-45"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
