"use client";

import { useEffect, useState, type ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import SettingsRail from "@/components/navigation/settings-rail";

const storageKey = "stacklist-sidebar-collapsed";

export default function AppShell({
  children,
  projectId = "",
}: {
  children: ReactNode;
  projectId?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(storageKey) === "1");
  }, []);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  };

  return (
    <main className="flex h-screen bg-rc-bg text-rc-fg">
      <SettingsRail
        projectId={projectId}
        showBack={Boolean(projectId)}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar projectId={projectId} />
        <div className="min-h-0 flex-1 px-2 pb-2 pt-1">
          <section className="rc-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl bg-rc-surface py-6">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
