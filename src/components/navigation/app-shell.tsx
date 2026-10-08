import type { ReactNode } from "react";
import Navbar from "@/components/navigation/navbar";
import SettingsRail from "@/components/navigation/settings-rail";

export default function AppShell({
  children,
  projectId = "",
}: {
  children: ReactNode;
  projectId?: string;
}) {
  return (
    <main className="flex h-screen flex-col bg-rc-bg text-rc-fg">
      <Navbar projectId={projectId} />
      <div className="flex min-h-0 flex-1">
        <SettingsRail showBack={Boolean(projectId)} />
        <section className="rc-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden py-6">
          {children}
        </section>
      </div>
    </main>
  );
}
