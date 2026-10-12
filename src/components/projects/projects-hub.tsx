"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, FolderPlus, LogIn } from "lucide-react";
import Button from "@/components/action/button";
import { useAuth } from "@/components/auth/auth-provider";
import UserAvatar from "@/components/auth/user-avatar";
import FormWizardSteps from "@/components/action/form-wizard-steps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProjectCard from "@/components/projects/project-card";
import { ConfigureProjectModal, LeaveProjectModal } from "@/components/projects/project-modals";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { validateProjectName, type JoinedProject } from "@/lib/project-shared";

type Mode = "pick" | "mine" | "create" | "join";

async function fetchJoinedProjects(): Promise<{ projects: JoinedProject[]; error: string }> {
  try {
    const response = await fetch("/api/projects", { credentials: "include" });
    const data = (await response.json()) as { projects?: JoinedProject[]; error?: string };
    if (!response.ok || !data.projects) {
      return { projects: [], error: data.error ?? "Could not load your projects." };
    }
    return { projects: data.projects, error: "" };
  } catch {
    return { projects: [], error: "Could not load your projects." };
  }
}

const createSteps = ["Name", "Password", "Project ID"];
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
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("pick");
  const [projects, setProjects] = useState<JoinedProject[] | null>(null);
  const [projectsError, setProjectsError] = useState("");
  const [leaving, setLeaving] = useState<JoinedProject | null>(null);
  const [configuring, setConfiguring] = useState<JoinedProject | null>(null);
  const closeLeave = useCallback(() => setLeaving(null), []);
  const closeConfigure = useCallback(() => setConfiguring(null), []);

  const dropProject = (publicId: string) => {
    setProjects((current) => current?.filter((item) => item.publicId !== publicId) ?? current);
    setLeaving(null);
    setConfiguring(null);
  };

  const renameProject = (publicId: string, name: string) => {
    setProjects(
      (current) =>
        current?.map((item) => (item.publicId === publicId ? { ...item, name } : item)) ?? current,
    );
    setConfiguring(null);
  };

  const loadProjects = useCallback(() => {
    void fetchJoinedProjects().then((result) => {
      setProjects(result.projects);
      setProjectsError(result.error);
    });
  }, []);

  useEffect(() => {
    let active = true;
    void fetchJoinedProjects().then((result) => {
      if (!active) return;
      setProjects(result.projects);
      setProjectsError(result.error);
    });
    return () => {
      active = false;
    };
  }, []);

  const [projectName, setProjectName] = useState("");
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
    setProjectName("");
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
      body: JSON.stringify({ name: projectName, password }),
    });
    const data = (await response.json()) as { project?: { publicId: string }; error?: string };
    setBusy(false);
    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not create the project.");
      return;
    }
    setCreatedId(data.project.publicId);
    setCreateStep(2);
    loadProjects();
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
    <main className="relative flex min-h-screen items-center justify-center bg-rc-bg px-4 py-10 text-rc-fg">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="flex w-full max-w-lg flex-col gap-8">
        {user && mode !== "mine" ? (
          <button
            type="button"
            onClick={() => {
              setMode("mine");
              loadProjects();
            }}
            className="group flex items-center gap-3 self-start rounded-full border border-rc-border bg-rc-surface py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-rc-surface-hover"
          >
            <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium leading-tight text-rc-fg">
                {user.username}
              </span>
              <span className="text-[11px] leading-tight text-rc-fg-muted">
                {projects === null
                  ? "Loading projects…"
                  : `${projects.length} joined ${projects.length === 1 ? "project" : "projects"}`}
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-rc-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-rc-fg-muted"
              aria-hidden
            />
          </button>
        ) : null}

        {mode === "mine" ? (
          <div className="flex flex-col gap-2 px-1">
            <button
              type="button"
              onClick={() => setMode("pick")}
              className="inline-flex items-center gap-1.5 self-start text-sm text-rc-fg-muted transition-colors hover:text-rc-fg"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <div className="flex items-center gap-3 pt-2">
              {user ? (
                <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={40} />
              ) : null}
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-rc-fg sm:text-3xl">
                  My projects
                </h1>
                <p className="text-sm text-rc-fg-muted">
                  Projects you already joined. Open one without re-entering the password.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <h1 className="text-2xl font-semibold tracking-tight text-rc-fg sm:text-3xl">
              Projects
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-rc-fg-muted">
              Create a workspace for your team or join an existing one with an ID and password.
            </p>
          </div>
        )}

        {mode === "mine" ? (
          <div className="flex flex-col gap-2">
            {projects === null ? (
              <p className="px-1 text-sm text-rc-fg-muted">Loading projects…</p>
            ) : projectsError ? (
              <p className="px-1 text-sm text-rc-red">{projectsError}</p>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-rc-border px-5 py-6">
                <p className="text-sm text-rc-fg-muted">You have not joined any project yet.</p>
                <button
                  type="button"
                  onClick={() => setMode("pick")}
                  className="text-sm font-medium text-rc-fg underline-offset-4 hover:underline"
                >
                  Create or join a project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.publicId}
                  project={project}
                  onConfigure={setConfiguring}
                  onLeave={setLeaving}
                />
              ))
            )}
          </div>
        ) : null}

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
                  primaryLabel="Continue"
                  onPrimary={() => {
                    const message = validateProjectName(projectName);
                    setError(message);
                    if (!message) setCreateStep(1);
                  }}
                />
              ) : createStep === 1 ? (
                <WizardFooter
                  onBack={() => {
                    setError("");
                    setCreateStep(0);
                  }}
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
                    Name your project
                  </h2>
                  <p className="text-sm leading-relaxed text-rc-fg-muted">
                    This is what you and your team see. You can change it later.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-name">Project name</Label>
                  <Input
                    id="create-name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="e.g. Growth experiments"
                    maxLength={48}
                    autoComplete="off"
                  />
                </div>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
              </>
            ) : createStep === 1 ? (
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
                    <span className="text-rc-fg">{projectName.trim()}</span> is ready. Teammates
                    join with this ID and the password.
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
      {leaving ? (
        <LeaveProjectModal project={leaving} onClose={closeLeave} onLeft={dropProject} />
      ) : null}
      {configuring ? (
        <ConfigureProjectModal
          project={configuring}
          onClose={closeConfigure}
          onSaved={renameProject}
          onDeleted={dropProject}
        />
      ) : null}
    </main>
  );
}
