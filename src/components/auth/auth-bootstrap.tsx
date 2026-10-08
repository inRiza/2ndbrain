"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function AuthBootstrap() {
  const { refresh } = useAuth();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return null;
}
