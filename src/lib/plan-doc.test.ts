import { expect, test } from "bun:test";
import { parsePlan, sanitizePlan } from "@/lib/plan-doc";

const sample = `---
idea: antrian-kampus
start: 2026-10-14
---

## Schedule

- 2026-10-14 -> 2026-10-16 | Discovery | Interview five students
- 2026-10-13 | Kickoff | Align on scope
- 2026-10-20 -> bad | Build | ignored

## Board

### Todo
- [high] Draft the queue screen #design
- Set up the database
### In Progress
- [urgent] Officer call button #frontend
### Done
- [low] Pick a name
`;

test("parsePlan reads schedule and board", () => {
  const plan = parsePlan(sample);
  expect(plan.schedule.map((item) => [item.start, item.end, item.phase, item.title])).toEqual([
    ["2026-10-13", "2026-10-13", "Kickoff", "Align on scope"],
    ["2026-10-14", "2026-10-16", "Discovery", "Interview five students"],
  ]);
  expect(plan.tasks.map((task) => [task.number, task.status, task.priority, task.label, task.title])).toEqual([
    [1, "todo", "high", "design", "Draft the queue screen"],
    [2, "todo", "none", "", "Set up the database"],
    [3, "in_progress", "urgent", "frontend", "Officer call button"],
    [4, "done", "low", "", "Pick a name"],
  ]);
  expect(plan.nextNumber).toBe(5);
});

test("sanitizePlan drops bad rows and numbers new tasks", () => {
  const plan = sanitizePlan({
    schedule: [{ title: "Ok", start: "2026-10-02", end: "2026-10-01" }, { title: "Bad", start: "x", end: "y" }],
    tasks: [{ title: "Keep", status: "weird", number: 3 }, { title: "" }, { title: "Fresh" }],
    nextNumber: 2,
  });
  expect(plan?.schedule).toHaveLength(1);
  expect(plan?.schedule[0].start).toBe("2026-10-01");
  expect(plan?.tasks.map((task) => [task.number, task.status])).toEqual([
    [3, "backlog"],
    [4, "backlog"],
  ]);
  expect(plan?.nextNumber).toBe(5);
  expect(sanitizePlan({ schedule: 1 })).toBeNull();
});
