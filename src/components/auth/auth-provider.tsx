"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicUser } from "@/lib/auth-shared";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<PublicUser | null>;
  login: (username: string, password: string) => Promise<string>;
  register: (username: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  changePassword: (password: string) => Promise<string>;
  regenerateAvatar: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) {
        setUser(null);
        return null;
      }
      const data = await readJson<{ user: PublicUser }>(response);
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await readJson<{ user?: PublicUser; error?: string }>(response);
    if (!response.ok || !data.user) {
      return data.error ?? "Login failed.";
    }
    setUser(data.user);
    return "";
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await readJson<{ user?: PublicUser; error?: string }>(response);
    if (!response.ok || !data.user) {
      return data.error ?? "Register failed.";
    }
    setUser(data.user);
    return "";
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const changePassword = useCallback(async (password: string) => {
    const response = await fetch("/api/auth/password", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await readJson<{ error?: string }>(response);
    if (!response.ok) return data.error ?? "Could not save the password.";
    return "";
  }, []);

  const regenerateAvatar = useCallback(async () => {
    const response = await fetch("/api/auth/avatar/regenerate", {
      method: "POST",
      credentials: "include",
    });
    const data = await readJson<{ user?: PublicUser; error?: string }>(response);
    if (!response.ok || !data.user) {
      return data.error ?? "Could not regenerate the avatar.";
    }
    setUser(data.user);
    return "";
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      login,
      register,
      logout,
      changePassword,
      regenerateAvatar,
    }),
    [
      user,
      loading,
      refresh,
      login,
      register,
      logout,
      changePassword,
      regenerateAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
