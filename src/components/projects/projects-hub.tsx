"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FolderPlus, LogIn } from "lucide-react";
import Button from "@/components/action/button";
import FormWizardSteps from "@/components/action/form-wizard-steps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "pick" | "create" | "join";

const createSteps = ["Password", "Project ID"];
const joinSteps = ["Project ID", "Password"];

function WizardShell({
  steps,
  stepIndex,
  footer,
  children,
}: {
  steps: string[];
  stepIndex: number;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-rc-surface px-6 py-7 sm:px-8">
      <FormWizardSteps labels={steps} currentIndex={stepIndex} />
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex justify-end pt-1">{footer}</div>
    </div>
  );
}

function WizardFooter({
  onBack,
  backLabel = "Back",
  primaryLabel,
  onPrimary,
  busy = false,
}: {
  onBack: () => void;
  backLabel?: string;
  primaryLabel: string;
  onPrimary: () => void;
  busy?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 w-36 items-center justify-center rounded-lg bg-rc-surface-hover text-sm font-medium text-rc-fg-muted transition-colors hover:text-rc-fg"
      >
        {backLabel}
      </button>
      <Button
        purpose="action"
        style="primary"
        className="h-10 w-36 rounded-lg px-0"
        onClick={onPrimary}
      >
        {busy ? `${primaryLabel}…` : primaryLabel}
      </Button>
    </div>
  );
}

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
    <main className="flex min-h-screen items-center justify-center bg-rc-bg px-4 py-10 text-rc-fg">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="flex flex-col gap-2 px-1">
          <h1 className="text-2xl font-semibold tracking-tight text-rc-fg sm:text-3xl">
            Projects
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-rc-fg-muted">
            Create a workspace for your team or join an existing one with an ID and password.
          </p>
        </div>

        {mode === "pick" ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={resetCreate}
              className="group flex items-center gap-4 rounded-2xl bg-rc-surface px-5 py-4 text-left transition-colors hover:bg-rc-surface-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rc-surface-hover text-rc-fg group-hover:bg-rc-bg">
                <FolderPlus className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-rc-fg">Create new project</span>
                <span className="mt-0.5 block text-sm text-rc-fg-muted">
                  We generate a project ID. You choose the password.
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-rc-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-rc-fg-muted"
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={resetJoin}
              className="group flex items-center gap-4 rounded-2xl bg-rc-surface px-5 py-4 text-left transition-colors hover:bg-rc-surface-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rc-surface-hover text-rc-fg group-hover:bg-rc-bg">
                <LogIn className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-rc-fg">Join project</span>
                <span className="mt-0.5 block text-sm text-rc-fg-muted">
                  Enter the project ID and password from your team.
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-rc-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-rc-fg-muted"
                aria-hidden
              />
            </button>
          </div>
        ) : null}

        {mode === "create" ? (
          <WizardShell
            steps={createSteps}
            stepIndex={createStep}
            footer={
              createStep === 0 ? (
                <WizardFooter
                  onBack={() => setMode("pick")}
                  primaryLabel="Create project"
                  onPrimary={() => void createProject()}
                  busy={busy}
                />
              ) : (
                <WizardFooter
                  backLabel="Close"
                  onBack={() => setMode("pick")}
                  primaryLabel="Open ideas"
                  onPrimary={enterCreated}
                />
              )
            }
          >
            {createStep === 0 ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-rc-fg">
                    Set a project password
                  </h2>
                  <p className="text-sm leading-relaxed text-rc-fg-muted">
                    Share this password with teammates who should join this project.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-password">Project password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-rc-fg">
                    Save your project ID
                  </h2>
                  <p className="text-sm leading-relaxed text-rc-fg-muted">
                    You will need this ID and the password to rejoin or invite others.
                  </p>
                </div>
                <p className="rounded-lg border border-rc-border bg-rc-bg px-3 py-2.5 font-mono text-sm text-rc-fg">
                  {createdId}
                </p>
              </>
            )}
          </WizardShell>
        ) : null}

        {mode === "join" ? (
          <WizardShell
            steps={joinSteps}
            stepIndex={joinStep}
            footer={
              joinStep === 0 ? (
                <WizardFooter
                  onBack={() => {
                    setError("");
                    setMode("pick");
                  }}
                  primaryLabel="Continue"
                  onPrimary={() => {
                    setError("");
                    if (!projectId.trim()) {
                      setError("Enter a project ID.");
                      return;
                    }
                    setJoinStep(1);
                  }}
                />
              ) : (
                <WizardFooter
                  onBack={() => {
                    setError("");
                    setJoinStep(0);
                  }}
                  primaryLabel="Join project"
                  onPrimary={() => void joinProject()}
                  busy={busy}
                />
              )
            }
          >
            {joinStep === 0 ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-rc-fg">
                    Which project?
                  </h2>
                  <p className="text-sm leading-relaxed text-rc-fg-muted">
                    Paste the project ID from your team
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="join-project-id">Project ID</Label>
                  <Input
                    id="join-project-id"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    placeholder="Enter project ID"
                    autoComplete="off"
                  />
                </div>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-semibold tracking-tight text-rc-fg">
                    Project password
                  </h2>
                  <p className="text-sm leading-relaxed text-rc-fg-muted">
                    Joining{" "}
                    <span className="font-mono text-rc-fg">{projectId.trim() || "…"}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="join-password">Password</Label>
                  <Input
                    id="join-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
              </>
            )}
          </WizardShell>
        ) : null}
      </div>
    </main>
  );
}
