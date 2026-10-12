export const taskStatuses = ["backlog", "todo", "in_progress", "done"] as const;
export const taskPriorities = ["none", "low", "medium", "high", "urgent"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export type PlanTask = {
  id: string;
  number: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  label: string;
};

export type PlanEvent = {
  id: string;
  title: string;
  phase: string;
  start: string;
  end: string;
};

export type Plan = {
  schedule: PlanEvent[];
  tasks: PlanTask[];
  nextNumber: number;
};

export const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export const priorityLabels: Record<TaskPriority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function emptyPlan(): Plan {
  return { schedule: [], tasks: [], nextNumber: 1 };
}

export function newId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function isPlanDate(value: string) {
  return datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function statusFromHeading(heading: string): TaskStatus | null {
  const key = heading.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "backlog") return "backlog";
  if (key === "todo" || key === "to_do") return "todo";
  if (key === "in_progress" || key === "doing" || key === "progress") return "in_progress";
  if (key === "done" || key === "selesai") return "done";
  return null;
}

function stripFrontmatter(raw: string) {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n").trim();
  if (!text.startsWith("---\n")) return text;
  const end = text.indexOf("\n---\n", 4);
  return end === -1 ? text : text.slice(end + 5);
}

export function parsePlan(raw: string): Plan {
  const body = stripFrontmatter(raw);
  const sections: Record<string, string> = {};
  for (const part of body.split(/^##\s+/m)) {
    const lineEnd = part.indexOf("\n");
    if (lineEnd === -1) continue;
    sections[part.slice(0, lineEnd).trim().toLowerCase()] = part.slice(lineEnd + 1);
  }

  const schedule: PlanEvent[] = [];
  for (const line of (sections.schedule ?? sections.jadwal ?? "").split("\n")) {
    const match = line.match(
      /^-\s*(\d{4}-\d{2}-\d{2})(?:\s*(?:->|→)\s*(\d{4}-\d{2}-\d{2}))?\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*$/,
    );
    if (!match) continue;
    const start = match[1];
    const end = match[2] ?? match[1];
    if (!isPlanDate(start) || !isPlanDate(end)) continue;
    schedule.push({
      id: newId(),
      start: start <= end ? start : end,
      end: start <= end ? end : start,
      phase: match[3],
      title: match[4],
    });
  }

  const tasks: PlanTask[] = [];
  let status: TaskStatus = "backlog";
  for (const line of (sections.board ?? sections.kanban ?? "").split("\n")) {
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      status = statusFromHeading(heading[1]) ?? status;
      continue;
    }
    const item = line.match(/^-\s*(?:\[(urgent|high|medium|low|none)\]\s*)?(.+?)\s*$/i);
    if (!item) continue;
    const labelMatch = item[2].match(/^(.*?)\s+#([\p{L}\p{N}_-]+)$/u);
    const title = (labelMatch ? labelMatch[1] : item[2]).trim();
    if (!title) continue;
    tasks.push({
      id: newId(),
      number: tasks.length + 1,
      title,
      status,
      priority: (item[1]?.toLowerCase() as TaskPriority | undefined) ?? "none",
      label: labelMatch?.[2] ?? "",
    });
  }

  schedule.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  return { schedule, tasks, nextNumber: tasks.length + 1 };
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sanitizePlan(input: unknown): Plan | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.schedule) || !Array.isArray(raw.tasks)) return null;

  const schedule = raw.schedule.slice(0, 300).flatMap((value): PlanEvent[] => {
    const item = value as Record<string, unknown>;
    const start = text(item?.start, 10);
    const end = text(item?.end, 10);
    const title = text(item?.title, 160);
    if (!title || !isPlanDate(start) || !isPlanDate(end)) return [];
    return [
      {
        id: text(item.id, 32) || newId(),
        title,
        phase: text(item.phase, 60),
        start: start <= end ? start : end,
        end: start <= end ? end : start,
      },
    ];
  });

  const tasks = raw.tasks.slice(0, 500).flatMap((value): PlanTask[] => {
    const item = value as Record<string, unknown>;
    const title = text(item?.title, 200);
    if (!title) return [];
    const status = taskStatuses.includes(item.status as TaskStatus)
      ? (item.status as TaskStatus)
      : "backlog";
    const priority = taskPriorities.includes(item.priority as TaskPriority)
      ? (item.priority as TaskPriority)
      : "none";
    const number = typeof item.number === "number" && item.number > 0 ? Math.floor(item.number) : 0;
    return [{ id: text(item.id, 32) || newId(), number, title, status, priority, label: text(item.label, 40) }];
  });

  let nextNumber = Math.max(
    typeof raw.nextNumber === "number" ? Math.floor(raw.nextNumber) : 1,
    ...tasks.map((task) => task.number + 1),
  );
  for (const task of tasks) {
    if (task.number === 0) task.number = nextNumber++;
  }
  return { schedule, tasks, nextNumber };
}
