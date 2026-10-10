"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/action/button";
import FormWizardSteps from "@/components/action/form-wizard-steps";

type Mode = "pick" | "create" | "join";

const createSteps = ["Password", "Project ID"];
const joinSteps = ["Project ID", "Password"];

export default function ProjectsHub() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pick");
  const [password, setPassword] = useState("");
  const [projectId, setProjectId] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [createStep, setCreateStep] = useState(0);
  const [joinStep, setJoinStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const resetCreate = () => {
    setMode("create");
    setError("");
    setPassword("");
    setCreatedId("");
    setCreateStep(0);
  };

  const resetJoin = () => {
    setMode("join");
    setError("");
    setPassword("");
    setProjectId("");
    setJoinStep(0);
  };

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
    setCreateStep(1);
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
    <main className="flex min-h-screen items-center justify-center bg-rc-bg px-4 py-8 text-rc-fg">
      <div className="flex w-full max-w-md flex-col gap-6">
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
              onClick={resetCreate}
              className="flex flex-col gap-1 rounded-lg border border-rc-card-border bg-rc-surface p-4 text-left shadow-[var(--rc-card-shadow)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--rc-card-shadow-hover)]"
            >
              <span className="text-base font-semibold text-rc-fg">Create new project</span>
              <span className="text-sm text-rc-fg-muted">
                We generate a project ID. You choose the password.
              </span>
            </button>
            <button
              type="button"
              onClick={resetJoin}
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
          <div className="flex flex-col gap-4 rounded-lg border border-rc-card-border bg-rc-surface p-5 shadow-[var(--rc-card-shadow)]">
            <FormWizardSteps labels={createSteps} currentIndex={createStep} />
            {createStep === 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-rc-fg">Set a project password</h2>
                  <p className="text-sm text-rc-fg-muted">
                    Share this password with teammates who should join this project.
                  </p>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-rc-fg-subtle">Project password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    className="rounded-md border border-rc-border bg-rc-bg px-3 py-2 text-sm text-rc-fg outline-none transition-[box-shadow,border-color] focus:border-rc-fg-subtle focus:ring-2 focus:ring-rc-fg/10"
                  />
                </label>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    purpose="action"
                    style="primary"
                    onClick={() => void createProject()}
                  >
                    {busy ? "Creating…" : "Create project"}
                  </Button>
                  <Button purpose="action" style="ghost" onClick={() => setMode("pick")}>
                    Back
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-rc-fg">Save your project ID</h2>
                  <p className="text-sm text-rc-fg-muted">
                    You will need this ID and the password to rejoin or invite others.
                  </p>
                </div>
                <p className="rounded-md border border-rc-border bg-rc-bg px-3 py-2.5 font-mono text-sm text-rc-fg">
                  {createdId}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button purpose="action" style="primary" onClick={enterCreated}>
                    Open ideas
                  </Button>
                  <Button purpose="action" style="ghost" onClick={() => setMode("pick")}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {mode === "join" ? (
          <div className="flex flex-col gap-4 rounded-lg border border-rc-card-border bg-rc-surface p-5 shadow-[var(--rc-card-shadow)]">
            <FormWizardSteps labels={joinSteps} currentIndex={joinStep} />
            {joinStep === 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-rc-fg">Which project?</h2>
                  <p className="text-sm text-rc-fg-muted">
                    Paste the project ID from your team (starts with stk-).
                  </p>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-rc-fg-subtle">Project ID</span>
                  <input
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    placeholder="stk-xxxxxxxx"
                    autoComplete="off"
                    className="rounded-md border border-rc-border bg-rc-bg px-3 py-2 text-sm text-rc-fg outline-none transition-[box-shadow,border-color] focus:border-rc-fg-subtle focus:ring-2 focus:ring-rc-fg/10"
                  />
                </label>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    purpose="action"
                    style="primary"
                    onClick={() => {
                      setError("");
                      if (!projectId.trim()) {
                        setError("Enter a project ID.");
                        return;
                      }
                      setJoinStep(1);
                    }}
                  >
                    Continue
                  </Button>
                  <Button purpose="action" style="ghost" onClick={() => setMode("pick")}>
                    Back
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-rc-fg">Project password</h2>
                  <p className="text-sm text-rc-fg-muted">
                    Joining{" "}
                    <span className="font-mono text-rc-fg">{projectId.trim() || "…"}</span>
                  </p>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-rc-fg-subtle">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="rounded-md border border-rc-border bg-rc-bg px-3 py-2 text-sm text-rc-fg outline-none transition-[box-shadow,border-color] focus:border-rc-fg-subtle focus:ring-2 focus:ring-rc-fg/10"
                  />
                </label>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button purpose="action" style="primary" onClick={() => void joinProject()}>
                    {busy ? "Joining…" : "Join project"}
                  </Button>
                  <Button
                    purpose="action"
                    style="ghost"
                    onClick={() => {
                      setError("");
                      setJoinStep(0);
                    }}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
