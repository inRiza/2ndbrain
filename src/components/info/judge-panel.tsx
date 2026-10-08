"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  emptyJudge,
  judgeStorageKey,
  parseVotes,
  upsertVote,
  voteBy,
  type JudgeScore,
} from "@/lib/judge";
import { useAuth } from "@/components/auth/auth-provider";

const criteria = [
  { key: "idea", label: "Idea" },
  { key: "flow", label: "Flow" },
  { key: "faq", label: "FAQ" },
] as const;

function readScore(projectId: string, slug: string, username: string) {
  const votes = parseVotes(localStorage.getItem(judgeStorageKey(projectId, slug)) ?? "");
  return voteBy(votes, username);
}

export default function JudgePanel({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const { user } = useAuth();
  const username = user?.username ?? "";
  const [score, setScore] = useState<JudgeScore>(emptyJudge);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setScore(readScore(projectId, slug, username));
    });
    return () => cancelAnimationFrame(frame);
  }, [projectId, slug, username]);

  const save = (next: JudgeScore) => {
    if (!username) return;
    const votes = parseVotes(localStorage.getItem(judgeStorageKey(projectId, slug)) ?? "");
    localStorage.setItem(
      judgeStorageKey(projectId, slug),
      JSON.stringify(upsertVote(votes, { ...next, username })),
    );
    setScore(next);
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-rc-fg-muted">Judge</h2>
          <p className="text-sm leading-relaxed text-rc-fg-muted">
            {username ? `Scoring as ${username}.` : "Score it here."} The pie chart opens
            on the Judge page.
          </p>
        </div>
        <Link
          href={`/projects/${encodeURIComponent(projectId)}/judge#${slug}`}
          className="rc-btn-primary inline-flex shrink-0 items-center rounded-md border-transparent px-3.5 py-1.5 text-sm font-medium"
        >
          Open judgment
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {criteria.map((item) => (
          <div
            key={item.key}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span className="text-sm text-rc-fg">{item.label}</span>
            <div className="inline-flex gap-1 rounded-md border border-rc-border bg-rc-surface p-0.5">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = score[item.key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${item.label} score ${value}`}
                    aria-pressed={active}
                    onClick={() => save({ ...score, [item.key]: value })}
                    className={
                      active
                        ? "h-8 w-8 cursor-pointer rounded-md bg-rc-surface-hover text-sm font-medium text-rc-fg shadow-sm ring-1 ring-rc-border/90"
                        : "h-8 w-8 cursor-pointer rounded-md text-sm text-rc-fg-muted hover:bg-rc-surface-hover/80 hover:text-rc-fg"
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-rc-fg-subtle">Note</span>
        <textarea
          value={score.note}
          onChange={(event) => save({ ...score, note: event.target.value })}
          rows={3}
          placeholder="What should change before the next review?"
          className="resize-none rounded-md border border-rc-border bg-rc-surface px-3 py-2 text-sm text-rc-fg outline-none placeholder:text-rc-fg-subtle"
        />
      </label>
      <p className="text-xs text-rc-fg-subtle">Saved on this browser.</p>
    </section>
  );
}
