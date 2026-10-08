"use client";

import { cn } from "@/lib/utils";

type TabPickerProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function TabPicker({
  options,
  value,
  onChange,
  className = "",
}: TabPickerProps) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-row flex-wrap gap-1 rounded-md border border-rc-border bg-rc-surface p-0.5",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1.5 text-sm font-medium transition-[box-shadow,background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary/40",
              active
                ? "rc-btn-primary border-transparent text-white"
                : "border border-transparent text-rc-fg-muted hover:bg-rc-surface/80 hover:text-rc-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
