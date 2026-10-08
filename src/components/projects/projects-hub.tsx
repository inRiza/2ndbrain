"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/action/button";
import AppShell from "@/components/navigation/app-shell";

type Mode = "pick" | "create" | "join";

export default function ProjectsHub() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pick");
  const [password, setPassword] = useState("");
  const [projectId, setProjectId] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const createProject = async () => {
    setBusy(true);
    setError("");
    const response = await fetch("/api/projects/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { project?: { publicId: string }; error?: string };
    setBusy(false);
    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not create the project.");
      return;
    }
    setCreatedId(data.project.publicId);
  };

  const joinProject = async () => {
    setBusy(true);
    setError("");
    const response = await fetch("/api/projects/join", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, password }),
    });
    const data = (await response.json()) as { project?: { publicId: string }; error?: string };
    setBusy(false);
    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not join the project.");
      return;
    }
    router.replace(`/projects/${encodeURIComponent(data.project.publicId)}`);
  };

  const enterCreated = () => {
    if (!createdId) return;
    router.replace(`/projects/${encodeURIComponent(createdId)}`);
  };

  return (
    <AppShell projectId="">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1 px-1">
          <h1 className="text-2xl font-semibold tracking-tight text-rc-fg">Projects</h1>
          <p className="text-sm leading-relaxed text-rc-fg-muted">
            Create a new project or join one with its ID and password.
          </p>
        </div>

        {mode === "pick" ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("create");
                setError("");
                setPassword("");
                setCreatedId("");
              }}
              className="flex flex-col gap-1 rounded-lg border border-rc-card-border bg-rc-surface p-4 text-left shadow-[var(--rc-card-shadow)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--rc-card-shadow-hover)]"
            >
              <span className="text-base font-semibold text-rc-fg">Create new project</span>
              <span className="text-sm text-rc-fg-muted">
                We generate a project ID. You choose the password.
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("join");
                setError("");
                setPassword("");
                setProjectId("");
              }}
              className="flex flex-col gap-1 rounded-lg border border-rc-card-border bg-rc-surface p-4 text-left shadow-[var(--rc-card-shadow)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--rc-card-shadow-hover)]"
            >
              <span className="text-base font-semibold text-rc-fg">Join project</span>
              <span className="text-sm text-rc-fg-muted">
                Enter the project ID and password from your team.
              </span>
            </button>
          </div>
        ) : null}

        {mode === "create" ? (
          <div className="flex flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-4">
            {createdId ? (
              <>
                <p className="text-sm text-rc-fg-muted">Project created. Save this ID:</p>
                <p className="rounded-md border border-rc-border bg-rc-bg px-3 py-2 font-mono text-sm text-rc-fg">
                  {createdId}
                </p>
                <Button purpose="action" style="primary" onClick={enterCreated}>
                  Open ideas
                </Button>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-rc-fg-subtle">Project password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm outline-none"
                  />
                </label>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button purpose="action" style="primary" onClick={() => void createProject()}>
                    {busy ? "Creating…" : "Create project"}
                  </Button>
                  <Button purpose="action" style="ghost" onClick={() => setMode("pick")}>
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {mode === "join" ? (
          <div className="flex flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-rc-fg-subtle">Project ID</span>
              <input
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="stk-xxxxxxxx"
                className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-rc-fg-subtle">Project password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm outline-none"
              />
            </label>
            {error ? <p className="text-sm text-rc-red">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button purpose="action" style="primary" onClick={() => void joinProject()}>
                {busy ? "Joining…" : "Join project"}
              </Button>
              <Button purpose="action" style="ghost" onClick={() => setMode("pick")}>
                Back
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
