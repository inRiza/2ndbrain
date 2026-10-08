"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { customTopic, topicOptions } from "@/lib/topics";

const triggerClass =
  "flex h-9 w-auto min-w-[10rem] max-w-[12rem] items-center justify-between gap-2 rounded-md border border-rc-border bg-rc-surface px-3 text-left text-sm text-rc-fg";

export default function TopicSelect({
  value,
  custom,
  onValue,
  onCustom,
  allowAll = false,
  extra = [],
  className = "",
  fullWidth = false,
}: {
  value: string;
  custom: string;
  onValue: (value: string) => void;
  onCustom: (value: string) => void;
  allowAll?: boolean;
  extra?: string[];
  className?: string;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(false);
  const [menu, setMenu] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLInputElement>(null);
  const options = [
    ...topicOptions,
    ...extra.filter((topic, index, list) => {
      const name = topic.trim();
      return (
        name &&
        list.findIndex((item) => item.trim() === name) === index &&
        !topicOptions.includes(name as (typeof topicOptions)[number])
      );
    }),
  ];
  const label =
    value === customTopic
      ? custom.trim() || "Custom"
      : value || (allowAll ? "All topics" : "Choose a topic");

  const syncMenu = () => {
    const node = triggerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setMenu({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenu(null);
      return;
    }
    syncMenu();
    window.addEventListener("scroll", syncMenu, true);
    window.addEventListener("resize", syncMenu);
    return () => {
      window.removeEventListener("scroll", syncMenu, true);
      window.removeEventListener("resize", syncMenu);
    };
  }, [open, customExpanded]);

  useEffect(() => {
    if (!open) {
      setCustomExpanded(false);
      return;
    }
    if (customExpanded) {
      customRef.current?.focus();
    }
  }, [open, customExpanded]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next: string) => {
    onValue(next);
    setOpen(false);
  };

  const startCustom = () => {
    onValue(customTopic);
    setCustomExpanded(true);
  };

  const menuNode =
    open && menu ? (
      <div
        ref={menuRef}
        style={{ top: menu.top, left: menu.left, width: menu.width }}
        className="fixed z-[100] max-h-72 overflow-hidden rounded-md border border-rc-border bg-rc-surface py-1 shadow-[var(--rc-card-shadow)]"
      >
        <ul role="listbox" className="rc-scrollbar max-h-72 overflow-y-auto">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => pick("")}
              className="flex w-full px-3 py-1.5 text-left text-sm text-rc-fg-muted hover:bg-rc-surface-hover"
            >
              {allowAll ? "All topics" : "Choose a topic"}
            </button>
          </li>
          {options.map((topic) => (
            <li key={topic}>
              <button
                type="button"
                role="option"
                aria-selected={value === topic}
                onClick={() => pick(topic)}
                className="flex w-full px-3 py-1.5 text-left text-sm text-rc-fg hover:bg-rc-surface-hover"
              >
                {topic}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === customTopic}
              onClick={startCustom}
              className={cn(
                "flex w-full px-3 py-1.5 text-left text-sm text-rc-fg hover:bg-rc-surface-hover",
                value === customTopic && customExpanded && "bg-rc-surface-hover",
              )}
            >
              Custom
            </button>
            {customExpanded ? (
              <input
                ref={customRef}
                value={custom}
                onChange={(event) => onCustom(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && custom.trim()) setOpen(false);
                }}
                placeholder="Write a topic"
                className="block w-full border-0 bg-transparent px-3 pb-2 pt-0.5 text-sm text-rc-fg outline-none ring-0 placeholder:text-rc-fg-subtle"
              />
            ) : null}
          </li>
        </ul>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn("min-w-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Topic"
        onClick={() => setOpen((current) => !current)}
        className={cn(triggerClass, fullWidth && "w-full min-w-0 max-w-none")}
      >
        <span className={cn("truncate", value ? "" : "text-rc-fg-subtle")}>{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-rc-fg-subtle" aria-hidden />
      </button>
      {typeof document !== "undefined" && menuNode
        ? createPortal(menuNode, document.body)
        : null}
    </div>
  );
}
