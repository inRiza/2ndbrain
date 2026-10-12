import type { TaskPriority, TaskStatus } from "@/lib/plan-doc";

export function StatusIcon({ status, className = "" }: { status: TaskStatus; className?: string }) {
  const common = { width: 14, height: 14, viewBox: "0 0 14 14", className, "aria-hidden": true };
  if (status === "backlog") {
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--rc-fg-subtle)" strokeWidth="1.5" strokeDasharray="1.6 1.9" />
      </svg>
    );
  }
  if (status === "todo") {
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--rc-fg-muted)" strokeWidth="1.5" />
      </svg>
    );
  }
  if (status === "in_progress") {
    return (
      <svg {...common}>
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--rc-yellow)" strokeWidth="1.5" />
        <path d="M 7 3.5 A 3.5 3.5 0 0 1 7 10.5 Z" fill="var(--rc-yellow)" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="7" cy="7" r="6.25" fill="var(--rc-blue)" />
      <path d="M 4.4 7.2 L 6.2 9 L 9.7 5.3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PriorityIcon({
  priority,
  className = "",
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const common = { width: 14, height: 14, viewBox: "0 0 14 14", className, "aria-hidden": true };
  if (priority === "urgent") {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="12" height="12" rx="3" fill="var(--rc-orange)" />
        <rect x="6.25" y="3.5" width="1.5" height="4.5" rx="0.75" fill="white" />
        <rect x="6.25" y="9" width="1.5" height="1.5" rx="0.75" fill="white" />
      </svg>
    );
  }
  if (priority === "none") {
    return (
      <svg {...common}>
        {[3, 7, 11].map((x) => (
          <rect key={x} x={x - 0.9} y="6.1" width="1.8" height="1.8" rx="0.9" fill="var(--rc-fg-subtle)" />
        ))}
      </svg>
    );
  }
  const level = priority === "low" ? 1 : priority === "medium" ? 2 : 3;
  return (
    <svg {...common}>
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={1.5 + index * 4}
          y={9 - index * 3}
          width="3"
          height={3.5 + index * 3}
          rx="1"
          fill="var(--rc-fg-muted)"
          opacity={index < level ? 1 : 0.28}
        />
      ))}
    </svg>
  );
}

const labelPalette = ["var(--rc-blue)", "var(--rc-green)", "var(--rc-orange)", "var(--rc-red)", "var(--rc-yellow)", "#8b5cf6", "#14b8a6", "#ec4899"];

export function colorFor(value: string) {
  let hash = 0;
  for (const char of value.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return labelPalette[hash % labelPalette.length];
}
