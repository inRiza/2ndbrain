"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { colorFor } from "@/components/planning/plan-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isPlanDate, newId, type Plan, type PlanEvent } from "@/lib/plan-doc";
import { cn } from "@/lib/utils";

const dayWidth = 40;
const rowHeight = 40;
const listWidth = 280;
const dayMs = 86_400_000;

function toDay(value: string) {
  return Math.round(Date.parse(`${value}T00:00:00Z`) / dayMs);
}

function fromDay(day: number) {
  return new Date(day * dayMs).toISOString().slice(0, 10);
}

function todayIso() {
  const now = new Date();
  return fromDay(Math.round(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / dayMs));
}

const monthFormat = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
const shortFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const weekdayFormat = new Intl.DateTimeFormat("en", { weekday: "narrow", timeZone: "UTC" });

function rangeLabel(item: PlanEvent) {
  const start = shortFormat.format(new Date(`${item.start}T00:00:00Z`));
  if (item.start === item.end) return start;
  return `${start} – ${shortFormat.format(new Date(`${item.end}T00:00:00Z`))}`;
}

type Row = { kind: "phase"; phase: string; count: number } | { kind: "item"; item: PlanEvent };

function EventForm({
  phases,
  onSave,
  onClose,
}: {
  phases: string[];
  onSave: (item: PlanEvent) => void;
  onClose: () => void;
}) {
  const today = todayIso();
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState(phases[0] ?? "");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!title.trim()) return setError("Give the item a title.");
    if (!isPlanDate(start) || !isPlanDate(end)) return setError("Pick a start and end date.");
    onSave({
      id: newId(),
      title: title.trim(),
      phase: phase.trim(),
      start: start <= end ? start : end,
      end: start <= end ? end : start,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-event-title"
        className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-rc-surface p-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h2 id="new-event-title" className="text-lg font-semibold text-rc-fg">
          New schedule item
        </h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-title">Title</Label>
          <Input id="event-title" autoFocus value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Usability test with five students" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-phase">Phase</Label>
          <Input id="event-phase" list="event-phases" value={phase} maxLength={60} onChange={(event) => setPhase(event.target.value)} placeholder="e.g. Design" />
          <datalist id="event-phases">
            {phases.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-start">Start</Label>
            <Input id="event-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-end">End</Label>
            <Input id="event-end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
          </div>
        </div>
        {error ? <p className="text-sm text-rc-red">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-lg bg-rc-surface-hover px-4 text-sm font-medium text-rc-fg-muted hover:text-rc-fg">
            Cancel
          </button>
          <button type="submit" className="inline-flex h-9 items-center rounded-lg bg-rc-fg px-4 text-sm font-medium text-rc-bg hover:opacity-90">
            Add item
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TimelineView({
  plan,
  onChange,
}: {
  plan: Plan;
  onChange: (plan: Plan) => void;
}) {
  const [adding, setAdding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = todayIso();

  const phases = useMemo(() => {
    const order: string[] = [];
    for (const item of [...plan.schedule].sort((a, b) => a.start.localeCompare(b.start))) {
      if (!order.includes(item.phase)) order.push(item.phase);
    }
    return order;
  }, [plan.schedule]);

  const rows = useMemo<Row[]>(
    () =>
      phases.flatMap((phase) => {
        const items = plan.schedule
          .filter((item) => item.phase === phase)
          .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
        return [{ kind: "phase" as const, phase, count: items.length }, ...items.map((item) => ({ kind: "item" as const, item }))];
      }),
    [phases, plan.schedule],
  );

  const { first, days } = useMemo(() => {
    const todayDay = toDay(today);
    const starts = plan.schedule.map((item) => toDay(item.start));
    const ends = plan.schedule.map((item) => toDay(item.end));
    const min = starts.length ? Math.min(...starts) : todayDay;
    const max = ends.length ? Math.max(...ends) : todayDay + 14;
    // start on the Monday before the first item
    const firstDay = min - 3;
    const weekday = (new Date(firstDay * dayMs).getUTCDay() + 6) % 7;
    const start = firstDay - weekday;
    const count = Math.max(28, max - start + 8);
    return { first: start, days: Array.from({ length: count }, (_, index) => start + index) };
  }, [plan.schedule, today]);

  const todayIndex = toDay(today) - first;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const starts = plan.schedule.map((item) => toDay(item.start) - first);
    const earliest = starts.length ? Math.min(...starts) : todayIndex;
    const target = todayIndex >= 0 && todayIndex < days.length ? Math.min(todayIndex, earliest) : earliest;
    el.scrollLeft = Math.max(0, target * dayWidth - dayWidth);
    // only on first layout of this range
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first]);

  const months = useMemo(() => {
    const groups: { label: string; span: number }[] = [];
    for (const day of days) {
      const label = monthFormat.format(new Date(day * dayMs));
      const last = groups[groups.length - 1];
      if (last?.label === label) last.span += 1;
      else groups.push({ label, span: 1 });
    }
    return groups;
  }, [days]);

  const removeItem = (id: string) => {
    onChange({ ...plan, schedule: plan.schedule.filter((item) => item.id !== id) });
  };

  const gridWidth = days.length * dayWidth;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl ring-1 ring-rc-fg/[0.07]">
        <div ref={scrollRef} className="rc-scrollbar relative overflow-x-auto">
          <div className="relative" style={{ width: listWidth + gridWidth }}>
            {/* header */}
            <div className="sticky top-0 z-20 flex border-b border-rc-fg/[0.07] bg-rc-surface">
              <div
                className="sticky left-0 z-30 flex shrink-0 items-end border-r border-rc-fg/[0.07] bg-rc-surface px-4 pb-2 text-[11px] font-medium uppercase tracking-wide text-rc-fg-subtle"
                style={{ width: listWidth }}
              >
                <span className="flex items-center gap-1.5">
                  Schedule
                  <span className="rounded-md bg-rc-fg/[0.06] px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-rc-fg-muted">
                    {plan.schedule.length}
                  </span>
                </span>
              </div>
              <div className="flex flex-col" style={{ width: gridWidth }}>
                <div className="flex h-7">
                  {months.map((month) => (
                    <div key={month.label} className="h-full" style={{ width: month.span * dayWidth }}>
                      <span
                        className="sticky inline-block whitespace-nowrap px-2 pt-2 text-xs font-medium text-rc-fg"
                        style={{ left: listWidth }}
                      >
                        {month.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex h-8">
                  {days.map((day, index) => {
                    const date = new Date(day * dayMs);
                    const isToday = index === todayIndex;
                    return (
                      <div
                        key={day}
                        className={cn(
                          "flex flex-col items-center justify-center text-[10px] leading-none",
                          [0, 6].includes(date.getUTCDay()) ? "text-rc-fg-subtle/70" : "text-rc-fg-subtle",
                        )}
                        style={{ width: dayWidth }}
                      >
                        <span>{weekdayFormat.format(date)}</span>
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[11px]",
                            isToday ? "bg-rc-red font-semibold text-white" : "text-rc-fg-muted",
                          )}
                        >
                          {date.getUTCDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* body */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 flex" style={{ left: listWidth, width: gridWidth }}>
                {days.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "h-full border-r border-rc-fg/[0.035]",
                      [0, 6].includes(new Date(day * dayMs).getUTCDay()) && "bg-rc-fg/[0.02]",
                    )}
                    style={{ width: dayWidth }}
                  />
                ))}
              </div>
              {todayIndex >= 0 && todayIndex < days.length ? (
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-rc-red/70"
                  style={{ left: listWidth + todayIndex * dayWidth + dayWidth / 2 }}
                />
              ) : null}

              {rows.length === 0 ? (
                <div className="flex h-40 items-center" style={{ paddingLeft: listWidth }}>
                  <p className="sticky left-[300px] text-sm text-rc-fg-subtle">No schedule items yet.</p>
                </div>
              ) : null}

              {rows.map((row) =>
                row.kind === "phase" ? (
                  <div key={`phase-${row.phase}`} className="relative flex h-9 items-center border-b border-rc-fg/[0.05] bg-rc-fg/[0.02]">
                    <div className="sticky left-0 z-10 flex h-full shrink-0 items-center gap-2 border-r border-rc-fg/[0.07] bg-rc-surface px-4" style={{ width: listWidth }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: colorFor(row.phase || "General") }} />
                      <span className="truncate text-xs font-semibold text-rc-fg">{row.phase || "General"}</span>
                      <span className="text-xs text-rc-fg-subtle">{row.count}</span>
                    </div>
                  </div>
                ) : (
                  <div key={row.item.id} className="group/row relative flex border-b border-rc-fg/[0.05] hover:bg-rc-fg/[0.025]" style={{ height: rowHeight }}>
                    <div className="sticky left-0 z-10 flex h-full shrink-0 items-center gap-2 border-r border-rc-fg/[0.07] bg-rc-surface pl-8 pr-2 group-hover/row:bg-rc-surface-hover" style={{ width: listWidth }}>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] text-rc-fg">{row.item.title}</span>
                        <span className="text-[11px] text-rc-fg-subtle">{rangeLabel(row.item)}</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${row.item.title}`}
                        onClick={() => removeItem(row.item.id)}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-rc-fg-subtle opacity-0 transition-opacity hover:bg-rc-bg hover:text-rc-red focus-visible:opacity-100 group-hover/row:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                    <div className="relative h-full" style={{ width: gridWidth }}>
                      {(() => {
                        const color = colorFor(row.item.phase || "General");
                        const left = (toDay(row.item.start) - first) * dayWidth;
                        const width = (toDay(row.item.end) - toDay(row.item.start) + 1) * dayWidth;
                        const roomy = width >= 140;
                        return (
                          <>
                          <div
                            title={`${row.item.title} · ${rangeLabel(row.item)}`}
                            className="absolute top-1/2 flex h-6 -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-md px-2 text-[12px] font-medium text-rc-fg"
                            style={{
                              left: left + 3,
                              width: Math.max(width - 6, 18),
                              background: `color-mix(in srgb, ${color} 16%, transparent)`,
                              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 38%, transparent)`,
                            }}
                          >
                            <span className="h-3 w-[3px] shrink-0 rounded-full" style={{ background: color }} />
                            {roomy ? <span className="truncate">{row.item.title}</span> : null}
                          </div>
                          {roomy ? null : (
                            <span
                              className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] text-rc-fg-muted"
                              style={{ left: left + Math.max(width - 6, 18) + 10 }}
                            >
                              {row.item.title}
                            </span>
                          )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={() => setAdding(true)}
                className="sticky left-0 z-10 flex h-10 items-center gap-2 bg-rc-surface px-4 text-[13px] text-rc-fg-subtle transition-colors hover:text-rc-fg"
                style={{ width: listWidth }}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                New item
              </button>
            </div>
          </div>
        </div>
      </div>
      {adding ? (
        <EventForm
          phases={phases.filter(Boolean)}
          onClose={() => setAdding(false)}
          onSave={(item) => {
            onChange({ ...plan, schedule: [...plan.schedule, item] });
            setAdding(false);
          }}
        />
      ) : null}
    </div>
  );
}
