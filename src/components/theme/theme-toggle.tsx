"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md border border-rc-border bg-rc-surface p-2 text-rc-fg-muted transition-colors hover:bg-rc-surface-hover hover:text-rc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary/40"
    >
      {resolvedTheme ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="block h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
