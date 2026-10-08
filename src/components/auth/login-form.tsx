"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/action/button";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const message = creating
      ? await register(username, password)
      : await login(username, password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    router.replace("/projects");
  };

  return (
    <main className="flex h-screen items-center justify-center bg-rc-bg px-4 text-rc-fg">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="flex w-full max-w-xs flex-col gap-3 rounded-lg border border-rc-border bg-rc-surface p-3"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-rc-fg">
            {creating ? "Create account" : "Login"}
          </h1>
          <p className="text-sm leading-relaxed text-rc-fg-muted">
            {creating
              ? "Pick a username. Your avatar is generated on signup."
              : "Enter your username and password."}
          </p>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rc-fg-subtle">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm text-rc-fg outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-rc-fg-subtle">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={creating ? "new-password" : "current-password"}
            className="rounded-md border border-rc-border bg-rc-surface px-3 py-1.5 text-sm text-rc-fg outline-none"
          />
        </label>
        {error ? <p className="text-sm text-rc-red">{error}</p> : null}
        <Button purpose="action" style="primary" onClick={() => void submit()}>
          {busy ? "Please wait…" : creating ? "Create account" : "Login"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setCreating((current) => !current);
            setError("");
          }}
          className="text-left text-sm text-rc-fg-muted hover:text-rc-fg"
        >
          {creating ? "Have an account" : "Create account"}
        </button>
      </form>
    </main>
  );
}
