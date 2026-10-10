"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, PanelLeft, PanelLeftClose, Settings, X } from "lucide-react";
import Button from "@/components/action/button";
import UserAvatar from "@/components/auth/user-avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { avatarColors } from "@/lib/avatar";

export default function SettingsRail({
  projectId = "",
  showBack = false,
  collapsed = false,
  onToggle,
}: {
  projectId?: string;
  showBack?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const router = useRouter();
  const { user, changePassword, logout, regenerateAvatar } = useAuth();
  const [panel, setPanel] = useState<"" | "profile" | "project">("");
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (!panel) return;
    const frame = requestAnimationFrame(() => {
      setPassword("");
      setError("");
      setSaved(false);
      setCopied(false);
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel("");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const save = async () => {
    if (!password.trim()) {
      setError("Password cannot be empty.");
      setSaved(false);
      return;
    }
    const message = await changePassword(password);
    if (message) {
      setError(message);
      setSaved(false);
      return;
    }
    setSaved(true);
    setError("");
    setPassword("");
  };

  const regen = async (colorId: string) => {
    setAvatarBusy(true);
    setError("");
    const message = await regenerateAvatar(colorId);
    setAvatarBusy(false);
    if (message) setError(message);
  };

  const switchAccount = async () => {
    await logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <>
      <aside
        className={
          collapsed
            ? "flex h-full w-12 shrink-0 flex-col items-center gap-1 overflow-hidden bg-rc-bg px-1.5 py-2 transition-[width,padding] duration-300 ease-out"
            : "flex h-full w-52 shrink-0 flex-col gap-1 overflow-hidden bg-rc-bg p-2 transition-[width,padding] duration-300 ease-out"
        }
      >
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          title={user.username}
          onClick={() => setPanel("profile")}
          className={
            collapsed
              ? "flex items-center justify-center rounded-md py-1 hover:bg-rc-surface-hover"
              : "flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-rc-surface-hover"
          }
        >
          <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={28} />
          <span
            className={
              collapsed
                ? "w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-rc-fg opacity-0 transition-[opacity,width] duration-200"
                : "truncate text-sm font-medium text-rc-fg opacity-100 transition-[opacity,width] duration-200"
            }
          >
            {user.username}
          </span>
        </button>
        {showBack ? (
          <Link
            href="/projects"
            title="Back to projects"
            className={
              collapsed
                ? "inline-flex h-8 w-8 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
                : "inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
            }
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span
              className={
                collapsed
                  ? "w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[opacity,width] duration-200"
                  : "truncate opacity-100 transition-[opacity,width] duration-200"
              }
            >
              Back to projects
            </span>
          </Link>
        ) : null}
        <button
          type="button"
          title="Settings"
          onClick={() => setPanel("project")}
          className={
            collapsed
              ? "inline-flex h-8 w-8 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
              : "inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
          }
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden />
          <span
            className={
              collapsed
                ? "w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[opacity,width] duration-200"
                : "truncate opacity-100 transition-[opacity,width] duration-200"
            }
          >
            Settings
          </span>
        </button>
      </aside>
      {panel ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-rc-fg/20"
            onClick={() => setPanel("")}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rail-dialog-title"
            className="relative z-10 flex w-full max-w-xs flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="rail-dialog-title" className="text-base font-semibold text-rc-fg">
                {panel === "profile" ? "Profile" : "Project"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPanel("")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {panel === "project" ? (
              projectId ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-rc-fg-muted">
                    Share this ID with people who should join the project.
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-rc-border bg-rc-bg px-3 py-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-sm text-rc-fg">{projectId}</p>
                    <button
                      type="button"
                      aria-label="Copy project ID"
                      onClick={() => {
                        void navigator.clipboard.writeText(projectId).then(() => setCopied(true));
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg"
                    >
                      <Copy className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {copied ? <p className="text-xs text-rc-fg-muted">Copied.</p> : null}
                </div>
              ) : (
                <p className="text-sm text-rc-fg-muted">Open a project to see its ID.</p>
              )
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-md border border-rc-border bg-rc-bg px-3 py-2">
                  <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-rc-fg">{user.username}</p>
                    <p className="text-xs text-rc-fg-muted">Pick a color</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      aria-label={color.id}
                      disabled={avatarBusy}
                      onClick={() => void regen(color.id)}
                      className="h-7 w-7 rounded-full border border-rc-border disabled:opacity-50"
                      style={{ backgroundColor: color.fill }}
                    />
                  ))}
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-rc-fg-subtle">New password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setSaved(false);
                    }}
                    autoComplete="new-password"
                    placeholder="Leave blank until you change it"
                    className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm text-rc-fg outline-none placeholder:text-rc-fg-subtle"
                  />
                </label>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
                {saved ? <p className="text-xs text-rc-fg-muted">Password saved.</p> : null}
                <Button purpose="action" style="primary" onClick={() => void save()}>
                  Save password
                </Button>
                <button
                  type="button"
                  onClick={() => void switchAccount()}
                  className="text-left text-sm text-rc-fg-muted hover:text-rc-fg"
                >
                  Switch account
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
