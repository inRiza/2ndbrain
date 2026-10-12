"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { FlowEdge } from "@/lib/idea-doc";

function layerNodes(edges: FlowEdge[]) {
  // longest-path layering: each node sits one row below its deepest parent; back edges (cycles) are ignored
  const nodes: string[] = [];
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    if (!nodes.includes(edge.from)) nodes.push(edge.from);
    if (!nodes.includes(edge.to)) nodes.push(edge.to);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }
  const state = new Map<string, "open" | "done">();
  const order: string[] = [];
  const forward: FlowEdge[] = [];
  const visit = (node: string) => {
    state.set(node, "open");
    for (const target of outgoing.get(node) ?? []) {
      if (state.get(target) === "open") continue;
      forward.push({ from: node, to: target });
      if (!state.has(target)) visit(target);
    }
    state.set(node, "done");
    order.unshift(node);
  };
  for (const node of nodes) if (!state.has(node)) visit(node);

  const depth = new Map(nodes.map((node) => [node, 0]));
  for (const node of order) {
    for (const edge of forward) {
      if (edge.from === node) {
        depth.set(edge.to, Math.max(depth.get(edge.to) ?? 0, (depth.get(node) ?? 0) + 1));
      }
    }
  }
  const layers: string[][] = [];
  for (const node of nodes) {
    const row = depth.get(node) ?? 0;
    (layers[row] ??= []).push(node);
  }
  return layers.filter(Boolean);
}

type Box = { x: number; y: number; w: number; h: number };
type Curve = { key: string; d: string; back: boolean };

function edgePath(
  from: Box,
  to: Box,
  spreadFrom: number,
  spreadTo: number,
  others: Box[],
): Curve["d"] {
  if (to.y > from.y + from.h / 2) {
    // forward edge: bottom of source to top of target, eased S-curve
    const x1 = from.x + from.w / 2 + spreadFrom;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2 + spreadTo;
    const y2 = to.y;
    const left = Math.min(x1, x2) - 12;
    const right = Math.max(x1, x2) + 12;
    const blockers = others.filter(
      (box) => box.y > y1 && box.y + box.h < y2 && box.x < right && box.x + box.w > left,
    );
    if (blockers.length > 0) {
      // skip-level edge with nodes in the way: swing around them
      const minX = Math.min(...blockers.map((box) => box.x));
      const maxX = Math.max(...blockers.map((box) => box.x + box.w));
      const goRight = Math.abs(x1 - maxX) <= Math.abs(x1 - minX);
      const xd = goRight ? maxX + 28 : minX - 28;
      const ym = (y1 + y2) / 2;
      const b = Math.max(24, (ym - y1) * 0.5);
      return `M ${x1} ${y1} C ${x1} ${y1 + b}, ${xd} ${y1 + b}, ${xd} ${ym} S ${x2} ${y2 - b}, ${x2} ${y2}`;
    }
    const bend = Math.max(28, (y2 - y1) * 0.55);
    return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
  }
  if (Math.abs(to.y - from.y) < from.h / 2) {
    // same row: arc over the gap between the two nodes
    const leftToRight = to.x > from.x;
    const x1 = leftToRight ? from.x + from.w : from.x;
    const x2 = leftToRight ? to.x : to.x + to.w;
    const y = from.y + from.h / 2;
    const lift = Math.min(36, Math.abs(x2 - x1) * 0.6 + 12);
    return `M ${x1} ${y} C ${x1 + (leftToRight ? 1 : -1) * 20} ${y - lift}, ${x2 + (leftToRight ? -1 : 1) * 20} ${y - lift}, ${x2} ${y}`;
  }
  // going back up: loop out of the right side
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x + to.w;
  const y2 = to.y + to.h / 2;
  const reach = Math.max(x1, x2) + 48 + Math.abs(y2 - y1) * 0.15;
  return `M ${x1} ${y1} C ${reach} ${y1}, ${reach} ${y2}, ${x2} ${y2}`;
}

function spread(index: number, count: number, width: number) {
  if (count <= 1) return 0;
  const span = Math.min(width * 0.5, 18 * (count - 1));
  return -span / 2 + (span * index) / (count - 1);
}

export default function FlowDiagram({ edges }: { edges: FlowEdge[] }) {
  const layers = layerNodes(edges);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [curves, setCurves] = useState<Curve[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const edgeKey = edges.map((edge) => `${edge.from}>${edge.to}`).join("|");

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const origin = wrap.getBoundingClientRect();
      const boxes = new Map<string, Box>();
      for (const [name, el] of nodeRefs.current) {
        const rect = el.getBoundingClientRect();
        boxes.set(name, {
          x: rect.left - origin.left,
          y: rect.top - origin.top,
          w: rect.width,
          h: rect.height,
        });
      }
      const outCount = new Map<string, number>();
      const inCount = new Map<string, number>();
      for (const edge of edges) {
        outCount.set(edge.from, (outCount.get(edge.from) ?? 0) + 1);
        inCount.set(edge.to, (inCount.get(edge.to) ?? 0) + 1);
      }
      const outSeen = new Map<string, number>();
      const inSeen = new Map<string, number>();
      const next: Curve[] = [];
      for (const edge of edges) {
        const from = boxes.get(edge.from);
        const to = boxes.get(edge.to);
        if (!from || !to) continue;
        const oi = outSeen.get(edge.from) ?? 0;
        const ii = inSeen.get(edge.to) ?? 0;
        outSeen.set(edge.from, oi + 1);
        inSeen.set(edge.to, ii + 1);
        next.push({
          key: `${edge.from}>${edge.to}`,
          d: edgePath(
            from,
            to,
            spread(oi, outCount.get(edge.from) ?? 1, from.w),
            spread(ii, inCount.get(edge.to) ?? 1, to.w),
            [...boxes.values()].filter((box) => box !== from && box !== to),
          ),
          back: to.y < from.y - from.h / 2,
        });
      }
      setCurves(next);
      setSize({ w: origin.width, h: origin.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
    // edgeKey captures every change to edges
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeKey]);

  if (layers.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-rc-fg-muted">User flow</h2>
      <div className="rc-scrollbar overflow-x-auto rounded-2xl bg-rc-fg/[0.035] px-6 py-8 sm:px-10">
        <div ref={wrapRef} className="relative mx-auto flex w-fit min-w-full flex-col items-center gap-16 pr-12">
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={size.w}
            height={size.h}
            aria-hidden
          >
            <defs>
              <marker
                id="flow-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 1 1.5 L 8 5 L 1 8.5" fill="none" stroke="var(--rc-fg-subtle)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            {curves.map((curve) => (
              <path
                key={curve.key}
                d={curve.d}
                fill="none"
                stroke="var(--rc-fg-subtle)"
                strokeOpacity={curve.back ? 0.55 : 0.8}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={curve.back ? "4 5" : undefined}
                markerEnd="url(#flow-arrow)"
              />
            ))}
          </svg>
          {layers.map((layer, index) => (
            <div key={layer.join("|")} className="relative flex flex-wrap justify-center gap-x-6 gap-y-4">
              {layer.map((node) => (
                <div
                  key={node}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(node, el);
                    else nodeRefs.current.delete(node);
                  }}
                  className="flex max-w-[15rem] items-center gap-2.5 rounded-xl bg-rc-surface px-4 py-2.5 text-sm font-medium text-rc-fg shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-rc-fg/[0.06]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rc-fg/[0.07] text-[10px] font-semibold text-rc-fg-muted">
                    {index + 1}
                  </span>
                  <span className="leading-snug">{node}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
