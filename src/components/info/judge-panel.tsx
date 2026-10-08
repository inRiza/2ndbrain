"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { emptyJudge, type JudgeScore } from "@/lib/judge";
import { useAuth } from "@/components/auth/auth-provider";

const criteria = [
  { key: "idea", label: "Idea" },
  { key: "flow", label: "Flow" },
  { key: "faq", label: "FAQ" },
] as const;

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
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(slug)}/judge`,
      { credentials: "include" },
    );
    if (!response.ok) {
      setScore(emptyJudge());
      setReady(true);
      return;
    }
    const data = (await response.json()) as { mine: JudgeScore };
    setScore(data.mine);
    setReady(true);
  }, [projectId, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (next: JudgeScore) => {
    if (!username) return;
    setScore(next);
    await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(slug)}/judge`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      },
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-rc-fg-muted">Judge</h2>
          <p className="text-sm leading-relaxed text-rc-fg-muted">
            {username ? `Scoring as ${username}.` : "Sign in to score."} Scores are shared
            with everyone in this project.
          </p>
        </div>
        <Link
          href={`/projects/${encodeURIComponent(projectId)}/judge#${slug}`}
          className="rc-btn-primary inline-flex shrink-0 items-center rounded-md border-transparent px-3.5 py-1.5 text-sm font-medium"
        >
          Open judgment
        </Link>
      </div>
      {!ready ? (
        <p className="text-sm text-rc-fg-muted">Loading scores…</p>
      ) : (
        <>
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
                        disabled={!username}
                        aria-label={`${item.label} score ${value}`}
                        aria-pressed={active}
                        onClick={() => void save({ ...score, [item.key]: value })}
                        className={
                          active
                            ? "h-8 w-8 cursor-pointer rounded-md bg-rc-surface-hover text-sm font-medium text-rc-fg shadow-sm ring-1 ring-rc-border/90 disabled:cursor-not-allowed disabled:opacity-50"
                            : "h-8 w-8 cursor-pointer rounded-md text-sm text-rc-fg-muted hover:bg-rc-surface-hover/80 hover:text-rc-fg disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={!username}
              onChange={(event) => void save({ ...score, note: event.target.value })}
              rows={3}
              placeholder="What should change before the next review?"
              className="resize-none rounded-md border border-rc-border bg-rc-surface px-3 py-2 text-sm text-rc-fg outline-none placeholder:text-rc-fg-subtle disabled:opacity-50"
            />
          </label>
        </>
      )}
    </section>
  );
}
