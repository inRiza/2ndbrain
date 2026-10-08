"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/action/button";
import AddIdea from "@/components/info/add-idea";
import IdeaCard from "@/components/info/idea-card";
import AppShell from "@/components/navigation/app-shell";
import TopicSelect from "@/components/search/topic-select";
import type { Idea } from "@/lib/idea-doc";
import { resolvedTopic } from "@/lib/topics";

type Row = {
  idea: Idea;
  topic: string;
  author: string;
};

export default function IdeaWorkspace({
  projectId,
  aiPrompt,
}: {
  projectId: string;
  aiPrompt: string;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas`,
      { credentials: "include" },
    );
    if (!response.ok) {
      setError("Could not load ideas for this project.");
      setRows([]);
      return;
    }
    const data = (await response.json()) as { ideas: Row[] };
    setRows(data.ideas);
    setError("");
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const chosen = resolvedTopic(topic, customTopic);
    return rows.filter((row) => {
      if (chosen && row.topic !== chosen) return false;
      if (!needle) return true;
      const haystack = [row.idea.title, row.idea.summary, row.idea.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [customTopic, query, rows, topic]);

  const topics = useMemo(() => rows.map((row) => row.topic).filter(Boolean), [rows]);

  return (
    <AppShell projectId={projectId}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <div className="flex flex-wrap items-start justify-between gap-3 px-1">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-rc-fg-subtle">
              {projectId}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-rc-fg">Ideas</h1>
            <p className="text-sm leading-relaxed text-rc-fg-muted">
              A directory of ideas in this project. Open a note to score it, or copy the
              markdown for an AI judge.
            </p>
          </div>
          <Button
            purpose="action"
            style="primary"
            className="shrink-0"
            onClick={() => setAdding(true)}
          >
            Add idea
          </Button>
        </div>
        <AddIdea
          open={adding}
          onClose={() => setAdding(false)}
          projectId={projectId}
          aiPrompt={aiPrompt}
          takenSlugs={rows.map((row) => row.idea.slug)}
          onSaved={() => void load()}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 min-w-0 w-full flex-1 items-center gap-2 rounded-md border border-rc-border bg-rc-surface px-3 sm:min-w-[12rem]">
            <Search className="h-4 w-4 shrink-0 text-rc-fg-subtle" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ideas"
              className="w-full bg-transparent text-sm text-rc-fg outline-none placeholder:text-rc-fg-subtle"
            />
          </label>
          <TopicSelect
            allowAll
            className="shrink-0 self-start sm:self-auto"
            extra={topics}
            value={topic}
            custom={customTopic}
            onValue={setTopic}
            onCustom={setCustomTopic}
          />
        </div>
        {error ? <p className="text-sm text-rc-red">{error}</p> : null}
        {visible.length === 0 ? (
          <p className="text-sm text-rc-fg-muted">No ideas match this filter.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((row) => (
              <IdeaCard
                key={row.idea.slug}
                projectId={projectId}
                idea={row.idea}
                topic={row.topic}
                author={row.author}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
