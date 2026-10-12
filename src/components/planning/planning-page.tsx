"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Copy, MoreHorizontal, Upload, X } from "lucide-react";
import AppShell from "@/components/navigation/app-shell";
import BoardView from "@/components/planning/board-view";
import TimelineView from "@/components/planning/timeline-view";
import { emptyPlan, parsePlan, type Plan } from "@/lib/plan-doc";
import type { PlanningIdea } from "@/lib/project-plans-server";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

const badgeClass = "rounded-md bg-rc-fg/[0.06] px-2 py-0.5 text-[11px] text-rc-fg-muted";

function planPrompt(aiPrompt: string, idea: PlanningIdea) {
  return `${aiPrompt.trim()}\n\nSlug ide: ${idea.slug}\n\nIde:\n\n${idea.source.trim()}\n`;
}

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open, close]);
  return ref;
}

function IdeaPicker({
  ideas,
  value,
  onChange,
}: {
  ideas: PlanningIdea[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutside(open, close);
  const current = ideas.find((idea) => idea.slug === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        aria-expanded={open}
        className="inline-flex h-9 max-w-[18rem] items-center gap-2 rounded-lg bg-rc-fg/[0.04] px-3 text-sm font-medium text-rc-fg ring-1 ring-rc-fg/[0.06] transition-colors hover:bg-rc-fg/[0.07]"
      >
        <span className="truncate">{current?.title ?? "Pick an idea"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-rc-fg-subtle" aria-hidden />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-80 overflow-hidden rounded-xl bg-rc-surface p-1 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-rc-fg/[0.08]">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-rc-fg-subtle">
            Ideas
          </p>
          <div className="rc-scrollbar max-h-72 overflow-y-auto">
            {ideas.map((idea) => (
              <button
                key={idea.slug}
                type="button"
                onClick={() => {
                  onChange(idea.slug);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-rc-surface-hover"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-rc-fg">{idea.title}</span>
                  <span className="truncate text-xs text-rc-fg-subtle">{idea.summary}</span>
                </span>
                {idea.slug === value ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-rc-fg-muted" aria-hidden />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImportModal({
  idea,
  aiPrompt,
  replacing,
  onClose,
  onImport,
}: {
  idea: PlanningIdea;
  aiPrompt: string;
  replacing: boolean;
  onClose: () => void;
  onImport: (plan: Plan) => void;
}) {
  // closing without importing keeps an empty, hand-editable plan
  const [copied, setCopied] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    await navigator.clipboard.writeText(planPrompt(aiPrompt, idea));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const importText = (text: string) => {
    const plan = parsePlan(text);
    if (plan.schedule.length === 0 && plan.tasks.length === 0) {
      setError("No Schedule or Board found. Check that the AI kept the format.");
      return;
    }
    onImport(plan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-plan-title"
        className="relative z-10 flex max-h-[min(42rem,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-rc-surface"
      >
        <div className="flex items-start justify-between gap-3 px-6 pb-2 pt-6">
          <div className="flex flex-col gap-1">
            <h2 id="import-plan-title" className="text-lg font-semibold text-rc-fg">
              {replacing ? "Re-generate the plan" : "Generate a plan with AI?"}
            </h2>
            <p className="text-sm text-rc-fg-muted">
              For <span className="text-rc-fg">{idea.title}</span>
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="rc-scrollbar flex flex-col gap-5 overflow-y-auto px-6 pb-6 pt-3">
          <ol className="flex flex-col gap-4">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rc-fg/[0.07] text-xs font-semibold text-rc-fg-muted">1</span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-sm font-medium text-rc-fg">Copy the prompt with this idea</p>
                <p className="text-xs leading-relaxed text-rc-fg-muted">
                  It holds the idea markdown and the rules for a schedule and a kanban board.
                </p>
                <button type="button" onClick={() => void copy()} className="inline-flex h-8 w-fit items-center gap-2 rounded-lg bg-rc-fg/[0.05] px-3 text-xs font-medium text-rc-fg ring-1 ring-rc-fg/[0.07] hover:bg-rc-fg/[0.08]">
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? "Copied" : "Copy AI prompt"}
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rc-fg/[0.07] text-xs font-semibold text-rc-fg-muted">2</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-rc-fg">Paste it into your AI</p>
                <p className="text-xs leading-relaxed text-rc-fg-muted">
                  ChatGPT, Claude, or any model. It replies with one markdown file.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rc-fg/[0.07] text-xs font-semibold text-rc-fg-muted">3</span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-sm font-medium text-rc-fg">Upload or paste the reply</p>
                <textarea
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  placeholder={"---\nidea: ...\n---\n\n## Schedule\n..."}
                  className="rc-scrollbar h-32 w-full resize-none rounded-lg bg-rc-bg p-3 font-mono text-xs text-rc-fg outline-none ring-1 ring-rc-fg/[0.08] placeholder:text-rc-fg-subtle focus:ring-rc-fg/[0.2]"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".md,text/markdown,text/plain"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    void file.text().then((text) => {
                      setMarkdown(text);
                      importText(text);
                    });
                  }}
                />
              </div>
            </li>
          </ol>
          {replacing ? (
            <p className="rounded-lg bg-rc-yellow/10 px-3 py-2 text-xs text-rc-fg-muted">
              Importing replaces the current schedule and board for this idea.
            </p>
          ) : null}
          {error ? <p className="text-sm text-rc-red">{error}</p> : null}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {replacing ? null : (
              <button type="button" onClick={onClose} className="mr-auto inline-flex h-9 items-center px-1 text-sm font-medium text-rc-fg-muted hover:text-rc-fg">
                No, start empty
              </button>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-rc-surface-hover px-4 text-sm font-medium text-rc-fg-muted hover:text-rc-fg">
              <Upload className="h-4 w-4" aria-hidden />
              Upload .md
            </button>
            <button
              type="button"
              disabled={!markdown.trim()}
              onClick={() => importText(markdown)}
              className="inline-flex h-9 items-center rounded-lg bg-rc-fg px-4 text-sm font-medium text-rc-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Import plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanningPage({
  projectId,
  ideas,
  initialSlug,
  aiPrompt,
}: {
  projectId: string;
  ideas: PlanningIdea[];
  initialSlug: string;
  aiPrompt: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "board" ? "board" : "timeline";
  const [slug, setSlug] = useState(initialSlug);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialSlug));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [importing, setImporting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useOutside(menuOpen, closeMenu);

  const idea = ideas.find((item) => item.slug === slug);
  const planUrl = `/api/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(slug)}`;

  useEffect(() => {
    if (!slug) return;
    let active = true;
    void fetch(planUrl, { credentials: "include" })
      .then((response) => response.json() as Promise<{ plan?: Plan | null }>)
      .then((data) => {
        if (!active) return;
        setPlan(data.plan ?? emptyPlan());
        setSaved(Boolean(data.plan));
        setImporting(!data.plan);
        setLoading(false);
        setSaveState("idle");
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [planUrl, slug]);

  const persist = useCallback(
    (next: Plan, immediate = false) => {
      window.clearTimeout(saveTimer.current);
      setSaveState("saving");
      const run = async () => {
        const response = await fetch(planUrl, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: next }),
        });
        setSaveState(response.ok ? "saved" : "error");
        if (response.ok) setSaved(true);
      };
      if (immediate) void run();
      else saveTimer.current = window.setTimeout(() => void run(), 450);
    },
    [planUrl],
  );

  const change = (next: Plan) => {
    setPlan(next);
    persist(next);
  };

  const pickIdea = (next: string) => {
    if (next === slug) return;
    window.clearTimeout(saveTimer.current);
    setSlug(next);
    setPlan(null);
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("idea", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearPlan = async () => {
    setMenuOpen(false);
    window.clearTimeout(saveTimer.current);
    const response = await fetch(planUrl, { method: "DELETE", credentials: "include" });
    if (!response.ok) return;
    setPlan(emptyPlan());
    setSaved(false);
    setSaveState("idle");
    setImporting(true);
  };

  const done = plan?.tasks.filter((task) => task.status === "done").length ?? 0;

  return (
    <AppShell projectId={projectId}>
      <div className="flex w-full flex-col gap-6 px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-rc-fg">Planning</h1>
            <p className="text-sm leading-relaxed text-rc-fg-muted">
              Turn an idea into a schedule and a board. Generate it with AI, then edit by hand.
            </p>
          </div>
          {ideas.length > 0 ? <IdeaPicker ideas={ideas} value={slug} onChange={pickIdea} /> : null}
        </header>

        {ideas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-rc-fg/[0.03] px-6 py-16 text-center">
            <p className="text-sm font-medium text-rc-fg">No ideas to plan yet</p>
            <p className="max-w-sm text-sm text-rc-fg-muted">Add an idea first. Each idea gets its own schedule and board.</p>
            <Link href={`/projects/${encodeURIComponent(projectId)}`} className="mt-1 inline-flex h-9 items-center rounded-lg bg-rc-fg px-4 text-sm font-medium text-rc-bg hover:opacity-90">
              Go to ideas
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rc-fg/[0.07] pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="mr-1.5 text-sm font-semibold text-rc-fg">
                  {view === "board" ? "Board" : "Timeline"}
                </h2>
                {plan ? (
                  <>
                    <span className={badgeClass}>{plan.schedule.length} items</span>
                    <span className={badgeClass}>{plan.tasks.length} tasks</span>
                    <span className={badgeClass}>{done} done</span>
                    {saveState !== "idle" ? (
                      <span className={cn(badgeClass, saveState === "error" && "text-rc-red")}>
                        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Not saved"}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImporting(true)}
                  className="inline-flex h-8 items-center gap-2 rounded-lg bg-rc-fg px-3 text-[13px] font-medium text-rc-bg transition-opacity hover:opacity-90"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  {saved ? "Re-generate" : "Generate plan"}
                </button>
                {saved ? (
                  <div ref={menuRef} className="relative">
                    <button
                      type="button"
                      aria-label="Plan options"
                      onClick={() => setMenuOpen((open) => !open)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rc-fg-muted ring-1 ring-rc-fg/[0.07] hover:bg-rc-surface-hover hover:text-rc-fg"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden />
                    </button>
                    {menuOpen ? (
                      <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl bg-rc-surface p-1 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-rc-fg/[0.08]">
                        <button type="button" onClick={() => void clearPlan()} className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm text-rc-red hover:bg-rc-surface-hover">
                          Clear plan
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2" aria-busy="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-lg bg-rc-fg/[0.04]" />
                ))}
              </div>
            ) : plan ? (
              view === "timeline" ? (
                <TimelineView plan={plan} onChange={change} />
              ) : (
                <BoardView plan={plan} onChange={change} />
              )
            ) : null}
          </>
        )}
      </div>
      {importing && idea ? (
        <ImportModal
          idea={idea}
          aiPrompt={aiPrompt}
          replacing={saved}
          onClose={() => setImporting(false)}
          onImport={(next) => {
            setPlan(next);
            persist(next, true);
            setImporting(false);
          }}
        />
      ) : null}
    </AppShell>
  );
}
