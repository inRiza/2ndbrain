"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import Button from "@/components/action/button";
import UserAvatar from "@/components/auth/user-avatar";
import { useAuth } from "@/components/auth/auth-provider";

export default function SettingsRail({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const { user, changePassword, logout, regenerateAvatar } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setPassword("");
      setError("");
      setSaved(false);
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

  const regen = async () => {
    setAvatarBusy(true);
    setError("");
    const message = await regenerateAvatar();
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
      <aside className="flex h-full w-44 shrink-0 flex-col gap-3 border-r border-rc-border bg-rc-surface p-3">
        <div className="flex items-center gap-2 px-1">
          <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={28} />
          <span className="truncate text-xs font-medium text-rc-fg-muted">{user.username}</span>
        </div>
        {showBack ? (
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back to projects
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Settings
        </button>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-rc-fg/20"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="relative z-10 flex w-full max-w-xs flex-col gap-2 rounded-lg border border-rc-border bg-rc-surface p-3 shadow-[var(--rc-card-shadow)]"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="settings-title" className="text-base font-semibold text-rc-fg">
                Settings
              </h2>
              <Button purpose="action" style="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-rc-border bg-rc-bg px-3 py-2">
              <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-rc-fg">{user.username}</p>
                <button
                  type="button"
                  onClick={() => void regen()}
                  disabled={avatarBusy}
                  className="text-left text-xs text-rc-fg-muted hover:text-rc-fg disabled:opacity-50"
                >
                  {avatarBusy ? "Generating…" : "Regenerate avatar"}
                </button>
              </div>
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
          </div>
        </div>
      ) : null}
    </>
  );
}
