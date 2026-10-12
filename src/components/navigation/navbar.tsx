"use client";

import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Navbar({ onSettings }: { onSettings?: () => void }) {
  return (
    <header className="bg-rc-bg">
      <div className="flex items-center justify-end gap-2 px-4 py-2">
        {onSettings ? (
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={onSettings}
            className="flex items-center justify-center rounded-xl border border-rc-border bg-rc-surface p-2.5 text-rc-fg transition-colors hover:bg-rc-surface-hover"
          >
            <Settings className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
