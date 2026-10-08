"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import ScorePie from "@/components/info/score-pie";
import AppShell from "@/components/navigation/app-shell";
import type { Idea } from "@/lib/idea-doc";
import {
  averageScore,
  judgeStorageKey,
  judgeTotal,
  parseVotes,
  rankScores,
  type JudgeScore,
  type Vote,
} from "@/lib/judge";

type Row = {
  slug: string;
  title: string;
  author: string;
  score: JudgeScore;
  voters: string[];
  notes: string[];
};

type IdeaRow = {
  idea: Idea;
  author: string;
};

export default function JudgePage({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void (async () => {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/ideas`,
          { credentials: "include" },
        );
        if (!response.ok) {
          setRows([]);
          setReady(true);
          return;
        }
        const data = (await response.json()) as { ideas: IdeaRow[] };
        const next = data.ideas.flatMap((item) => {
          const votes = parseVotes(
            localStorage.getItem(judgeStorageKey(projectId, item.idea.slug)) ?? "",
          );
          if (votes.length === 0) return [];
          return [toRow(item.idea, votes, item.author)];
        });
        setRows(next);
        setReady(true);
      })();
    });
    return () => cancelAnimationFrame(frame);
  }, [projectId]);

  const remove = (slug: string) => {
    localStorage.removeItem(judgeStorageKey(projectId, slug));
    setRows((current) => current.filter((row) => row.slug !== slug));
  };

  return (
    <AppShell projectId={projectId}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-rc-fg-subtle">
            {projectId}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-rc-fg">Judge</h1>
          <p className="text-sm leading-relaxed text-rc-fg-muted">
            Ranked by Idea, Flow, and FAQ. Open a row to see the pie.
          </p>
        </div>
        {!ready ? null : rows.length === 0 ? (
          <p className="text-sm text-rc-fg-muted">No judgment yet.</p>
        ) : (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-rc-fg-muted">Leaderboard</h2>
              <ol className="overflow-hidden rounded-lg border border-rc-border bg-rc-surface">
                {rankScores(rows).map((row) => (
                  <li
                    key={row.slug}
                    className="flex items-center gap-3 border-b border-rc-border px-3 py-2.5 last:border-b-0"
                  >
                    <span className="w-6 text-xs tabular-nums text-rc-fg-muted">
                      {row.rank}
                    </span>
                    <Link
                      href={`#${row.slug}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-rc-fg"
                    >
                      {row.title}
                    </Link>
                    <span className="hidden min-w-0 truncate text-xs text-rc-fg-subtle sm:block">
                      {voterLine(row)}
                    </span>
                    <span className="text-sm tabular-nums text-rc-fg-muted">
                      {row.total}/15
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${row.title} from leaderboard`}
                      onClick={() => remove(row.slug)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-rc-fg-muted">Scores</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {rankScores(rows).map((row) => (
                  <article
                    key={row.slug}
                    id={row.slug}
                    className="flex scroll-mt-20 flex-col gap-3 rounded-lg border border-rc-card-border bg-rc-surface p-4 shadow-[var(--rc-card-shadow)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(row.slug)}`}
                        className="line-clamp-2 text-base font-semibold leading-snug text-rc-fg"
                      >
                        {row.title}
                      </Link>
                      <span className="shrink-0 text-xs tabular-nums text-rc-fg-muted">
                        {judgeTotal(row.score)}/15
                      </span>
                    </div>
                    <ScorePie score={row.score} />
                    {row.notes.map((note) => (
                      <p key={note} className="text-sm leading-relaxed text-rc-fg-muted">
                        {note}
                      </p>
                    ))}
                    <p className="text-xs text-rc-fg-subtle">{voterLine(row)}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function toRow(idea: Idea, votes: Vote[], author: string): Row {
  return {
    slug: idea.slug,
    title: idea.title,
    author,
    score: averageScore(votes),
    voters: votes.map((vote) => vote.username),
    notes: votes.flatMap((vote) => (vote.note ? [`${vote.username}: ${vote.note}`] : [])),
  };
}

function voterLine(row: Row) {
  return [
    row.author ? `by ${row.author}` : "",
    row.voters.length ? `voted by ${row.voters.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
