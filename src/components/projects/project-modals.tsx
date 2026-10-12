"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectLabel, type JoinedProject } from "@/lib/project-shared";

const secondaryButton =
  "inline-flex h-10 items-center justify-center rounded-lg bg-rc-surface-hover px-4 text-sm font-medium text-rc-fg-muted transition-colors hover:text-rc-fg";
const primaryButton =
  "inline-flex h-10 items-center justify-center rounded-lg bg-rc-fg px-4 text-sm font-medium text-rc-bg transition-opacity hover:opacity-90 disabled:opacity-50";
const dangerButton =
  "inline-flex h-10 items-center justify-center rounded-lg bg-rc-red px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";

function ModalShell({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-rc-surface p-6"
      >
        {children}
      </div>
    </div>
  );
}

export function LeaveProjectModal({
  project,
  onClose,
  onLeft,
}: {
  project: JoinedProject;
  onClose: () => void;
  onLeft: (publicId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const leave = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const response = await fetch(
      `/api/projects/${encodeURIComponent(project.publicId)}/leave`,
      { method: "POST", credentials: "include" },
    );
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not leave the project.");
      return;
    }
    onLeft(project.publicId);
  };

  return (
    <ModalShell titleId="leave-project-title" onClose={onClose}>
      <div className="flex flex-col gap-1.5">
        <h2 id="leave-project-title" className="text-lg font-semibold text-rc-fg">
          Leave project?
        </h2>
        <p className="text-sm leading-relaxed text-rc-fg-muted">
          You will lose access to <span className="text-rc-fg">{projectLabel(project)}</span>. To
          come back, you need the project ID and password again.
        </p>
      </div>
      {error ? <p className="text-sm text-rc-red">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" disabled={busy} onClick={() => void leave()} className={dangerButton}>
          {busy ? "Leaving…" : "Leave project"}
        </button>
      </div>
    </ModalShell>
  );
}

export function ConfigureProjectModal({
  project,
  onClose,
  onSaved,
  onDeleted,
}: {
  project: JoinedProject;
  onClose: () => void;
  onSaved: (publicId: string, name: string) => void;
  onDeleted: (publicId: string) => void;
}) {
  const [name, setName] = useState(project.name);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const projectPath = `/api/projects/${encodeURIComponent(project.publicId)}`;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const response = await fetch(projectPath, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password: password || undefined }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save the project.");
      return;
    }
    onSaved(project.publicId, name.trim().replace(/\s+/g, " "));
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const response = await fetch(projectPath, { method: "DELETE", credentials: "include" });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Could not delete the project.");
      return;
    }
    onDeleted(project.publicId);
  };

  return (
    <ModalShell titleId="configure-project-title" onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="configure-project-title" className="text-lg font-semibold text-rc-fg">
            Configure project
          </h2>
          <p className="truncate font-mono text-xs text-rc-fg-subtle">{project.publicId}</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="configure-name">Project name</Label>
          <Input
            id="configure-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={48}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="configure-password">New password</Label>
          <Input
            id="configure-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Leave blank to keep the current one"
            autoComplete="new-password"
          />
        </div>
        {error ? <p className="text-sm text-rc-red">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy && !confirmDelete ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-rc-red/[0.07] px-4 py-3">
        <p className="text-xs leading-relaxed text-rc-fg-muted">
          {confirmDelete
            ? "This removes every idea and vote for all members."
            : "Delete this project for everyone."}
        </p>
        {confirmDelete ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="shrink-0 rounded-lg bg-rc-red px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Confirm delete"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-rc-red transition-colors hover:bg-rc-red/10"
          >
            Delete project
          </button>
        )}
      </div>
    </ModalShell>
  );
}
