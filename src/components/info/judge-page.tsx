"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import ScorePie from "@/components/info/score-pie";
import AppShell from "@/components/navigation/app-shell";
import {
  averageScore,
  judgeTotal,
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

type Entry = {
  slug: string;
  title: string;
  author: string;
  votes: Vote[];
};

export default function JudgePage({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/judge`,
      { credentials: "include" },
    );
    if (!response.ok) {
      setRows([]);
      setReady(true);
      return;
    }
    const data = (await response.json()) as { entries: Entry[] };
    setRows(data.entries.map(toRow));
    setReady(true);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (slug: string) => {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(slug)}/judge`,
      { method: "DELETE", credentials: "include" },
    );
    if (!response.ok) return;
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
        {!ready ? (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading judge scores">
            <section className="flex flex-col gap-2">
              <div className="h-6 w-28 animate-pulse rounded bg-rc-surface-hover" />
              <ol className="overflow-hidden rounded-lg border border-rc-border bg-rc-surface">
                {Array.from({ length: 4 }, (_, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 border-b border-rc-border px-3 py-2.5 last:border-b-0"
                  >
                    <div className="h-3 w-4 animate-pulse rounded bg-rc-surface-hover" />
                    <div className="h-4 min-w-0 flex-1 animate-pulse rounded bg-rc-surface-hover" />
                    <div className="hidden h-3 w-24 animate-pulse rounded bg-rc-surface-hover sm:block" />
                    <div className="h-4 w-10 animate-pulse rounded bg-rc-surface-hover" />
                    <div className="h-8 w-8 animate-pulse rounded-md bg-rc-surface-hover" />
                  </li>
                ))}
              </ol>
            </section>
            <section className="flex flex-col gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-rc-surface-hover" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse flex-col gap-3 rounded-lg border border-rc-card-border bg-rc-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-5 w-full rounded bg-rc-surface-hover" />
                      <div className="h-3 w-10 shrink-0 rounded bg-rc-surface-hover" />
                    </div>
                    <div className="mx-auto h-32 w-32 rounded-full bg-rc-surface-hover" />
                    <div className="h-3 w-3/4 rounded bg-rc-surface-hover" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : rows.length === 0 ? (
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
                      aria-label={`Clear all scores for ${row.title}`}
                      onClick={() => void remove(row.slug)}
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

function toRow(entry: Entry): Row {
  return {
    slug: entry.slug,
    title: entry.title,
    author: entry.author,
    score: averageScore(entry.votes),
    voters: entry.votes.map((vote) => vote.username),
    notes: entry.votes.flatMap((vote) =>
      vote.note ? [`${vote.username}: ${vote.note}`] : [],
    ),
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
