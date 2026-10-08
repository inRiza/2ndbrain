"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const onLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !onLogin) router.replace("/login");
    if (user && onLogin) router.replace("/projects");
  }, [loading, onLogin, pathname, router, user]);

  if (onLogin) return children;
  if (loading || !user) return null;
  return children;
}
