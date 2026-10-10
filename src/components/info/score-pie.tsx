"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { JudgeScore } from "@/lib/judge";

const slices = [
  { key: "idea", label: "Idea", fill: "var(--rc-fg)" },
  { key: "flow", label: "Flow", fill: "var(--rc-green)" },
  { key: "faq", label: "FAQ", fill: "var(--rc-yellow)" },
] as const;

export default function ScorePie({ score }: { score: JudgeScore }) {
  const data = slices.flatMap((slice) => {
    const value = score[slice.key];
    if (value <= 0) return [];
    return [{ label: slice.label, score: value, fill: slice.fill }];
  });

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <PieChart width={208} height={208}>
        <Pie
          data={data}
          dataKey="score"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={88}
          stroke="var(--rc-surface)"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--rc-surface)",
            border: "1px solid var(--rc-border)",
            borderRadius: 8,
            color: "var(--rc-fg)",
            fontSize: 12,
          }}
        />
      </PieChart>
      <div className="flex flex-wrap justify-center gap-3">
        {data.map((entry) => (
          <span
            key={entry.label}
            className="inline-flex items-center gap-1.5 text-xs text-rc-fg-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.fill }}
            />
            {entry.label} {entry.score}
          </span>
        ))}
      </div>
    </div>
  );
}
