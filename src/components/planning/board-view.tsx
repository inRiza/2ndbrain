"use client";

import { useState, type DragEvent } from "react";
import { Plus, X } from "lucide-react";
import { colorFor, PriorityIcon, StatusIcon } from "@/components/planning/plan-icons";
import {
  newId,
  priorityLabels,
  statusLabels,
  taskPriorities,
  taskStatuses,
  type Plan,
  type PlanTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/plan-doc";
import { cn } from "@/lib/utils";

function nextPriority(priority: TaskPriority): TaskPriority {
  return taskPriorities[(taskPriorities.indexOf(priority) + 1) % taskPriorities.length];
}

function Composer({
  onSave,
  onCancel,
}: {
  onSave: (title: string, priority: TaskPriority, label: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("none");

  const submit = () => {
    if (!title.trim()) return;
    onSave(title.trim(), priority, label.trim().replace(/\s+/g, "-"));
    setTitle("");
    setLabel("");
    setPriority("none");
  };

  return (
    <form
      className="flex flex-col gap-2 rounded-lg bg-rc-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-rc-fg/[0.12]"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        maxLength={200}
        className="bg-transparent text-[13px] font-medium text-rc-fg outline-none placeholder:text-rc-fg-subtle"
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title={priorityLabels[priority]}
          onClick={() => setPriority(nextPriority(priority))}
          className="inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-[11px] text-rc-fg-muted ring-1 ring-rc-fg/[0.08] hover:bg-rc-surface-hover"
        >
          <PriorityIcon priority={priority} />
          {priorityLabels[priority]}
        </button>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label"
          maxLength={40}
          className="h-6 min-w-0 flex-1 rounded-md bg-transparent px-1.5 text-[11px] text-rc-fg outline-none ring-1 ring-rc-fg/[0.08] placeholder:text-rc-fg-subtle"
        />
      </div>
      <div className="flex justify-end gap-1.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-7 rounded-md px-2.5 text-xs font-medium text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="h-7 rounded-md bg-rc-fg px-2.5 text-xs font-medium text-rc-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Add task
        </button>
      </div>
    </form>
  );
}

function TaskCard({
  task,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onPriority,
  onDelete,
}: {
  task: PlanTask;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onPriority: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={cn(
        "group/card relative flex cursor-grab flex-col gap-2.5 rounded-lg bg-rc-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-rc-fg/[0.07] transition-[box-shadow,opacity] hover:ring-rc-fg/[0.14] active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-2 pr-6">
        <span className="font-mono text-[11px] text-rc-fg-subtle">TSK-{task.number}</span>
      </div>
      <button
        type="button"
        aria-label={`Delete TSK-${task.number}`}
        onClick={onDelete}
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-rc-fg-subtle opacity-0 transition-opacity hover:bg-rc-surface-hover hover:text-rc-red focus-visible:opacity-100 group-hover/card:opacity-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
      <div className="flex items-start gap-2">
        <StatusIcon status={task.status} className="mt-[3px] shrink-0" />
        <p className="text-[13px] font-medium leading-snug text-rc-fg">{task.title}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title={`Priority: ${priorityLabels[task.priority]}`}
          onClick={onPriority}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-rc-fg/[0.08] hover:bg-rc-surface-hover"
        >
          <PriorityIcon priority={task.priority} />
        </button>
        {task.label ? (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] text-rc-fg-muted ring-1 ring-rc-fg/[0.08]">
            <span className="h-2 w-2 rounded-full" style={{ background: colorFor(task.label) }} />
            {task.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function BoardView({
  plan,
  onChange,
}: {
  plan: Plan;
  onChange: (plan: Plan) => void;
}) {
  const [composing, setComposing] = useState<TaskStatus | null>(null);
  const [dragId, setDragId] = useState("");
  const [drop, setDrop] = useState<{ status: TaskStatus; index: number } | null>(null);

  const columnTasks = (status: TaskStatus) => plan.tasks.filter((task) => task.status === status);

  const addTask = (status: TaskStatus, title: string, priority: TaskPriority, label: string) => {
    const task: PlanTask = { id: newId(), number: plan.nextNumber, title, status, priority, label };
    const lastIndex = plan.tasks.findLastIndex((item) => item.status === status);
    const tasks = [...plan.tasks];
    tasks.splice(lastIndex + 1, 0, task);
    onChange({ ...plan, tasks, nextNumber: plan.nextNumber + 1 });
  };

  const updateTask = (id: string, patch: Partial<PlanTask>) => {
    onChange({
      ...plan,
      tasks: plan.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    });
  };

  const removeTask = (id: string) => {
    onChange({ ...plan, tasks: plan.tasks.filter((task) => task.id !== id) });
  };

  const moveTask = (id: string, status: TaskStatus, index: number) => {
    const moving = plan.tasks.find((task) => task.id === id);
    if (!moving) return;
    const rest = plan.tasks.filter((task) => task.id !== id);
    const column = rest.filter((task) => task.status === status);
    const anchor = column[index];
    const insertAt = anchor
      ? rest.indexOf(anchor)
      : rest.findLastIndex((task) => task.status === status) + 1 || rest.length;
    rest.splice(insertAt, 0, { ...moving, status });
    onChange({ ...plan, tasks: rest });
  };

  const finishDrag = () => {
    setDragId("");
    setDrop(null);
  };

  return (
    <div className="rc-scrollbar flex min-h-[28rem] gap-3 overflow-x-auto pb-2">
      {taskStatuses.map((status) => {
        const tasks = columnTasks(status);
        const activeDrop = drop?.status === status ? drop.index : -1;
        return (
          <section
            key={status}
            className={cn(
              "flex w-[18rem] shrink-0 flex-col gap-2 rounded-xl bg-rc-fg/[0.025] p-2 transition-colors",
              dragId && drop?.status === status && "bg-rc-fg/[0.05]",
            )}
            onDragOver={(event) => {
              if (!dragId) return;
              event.preventDefault();
              if (event.target === event.currentTarget) setDrop({ status, index: tasks.length });
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragId && drop) moveTask(dragId, drop.status, drop.index);
              finishDrag();
            }}
          >
            <header className="flex h-8 items-center gap-2 px-1.5">
              <StatusIcon status={status} />
              <h3 className="text-[13px] font-medium text-rc-fg">{statusLabels[status]}</h3>
              <span className="text-[13px] text-rc-fg-subtle">{tasks.length}</span>
              <button
                type="button"
                aria-label={`Add task to ${statusLabels[status]}`}
                onClick={() => setComposing(status)}
                className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-rc-fg-subtle hover:bg-rc-surface-hover hover:text-rc-fg"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </header>
            <div className="flex flex-col gap-2">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex flex-col gap-2">
                  {activeDrop === index ? <div className="h-0.5 rounded-full bg-rc-blue" /> : null}
                  <TaskCard
                    task={task}
                    dragging={dragId === task.id}
                    onDragStart={() => setDragId(task.id)}
                    onDragEnd={finishDrag}
                    onDragOver={(event) => {
                      if (!dragId) return;
                      event.preventDefault();
                      event.stopPropagation();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const after = event.clientY > rect.top + rect.height / 2;
                      setDrop({ status, index: index + (after ? 1 : 0) });
                    }}
                    onPriority={() => updateTask(task.id, { priority: nextPriority(task.priority) })}
                    onDelete={() => removeTask(task.id)}
                  />
                </div>
              ))}
              {activeDrop === tasks.length && tasks.length > 0 ? (
                <div className="h-0.5 rounded-full bg-rc-blue" />
              ) : null}
              {composing === status ? (
                <Composer
                  onSave={(title, priority, label) => addTask(status, title, priority, label)}
                  onCancel={() => setComposing(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setComposing(status)}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] text-rc-fg-subtle transition-colors hover:bg-rc-fg/[0.04] hover:text-rc-fg-muted",
                    tasks.length === 0 && !dragId && "h-20 justify-center border border-dashed border-rc-fg/[0.1]",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  New task
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
