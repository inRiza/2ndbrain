"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { avatarPath } from "@/lib/avatar";
import {
  buildBrainGraph,
  type BrainEdge,
  type BrainKind,
  type BrainNode,
  type BrainSeed,
} from "@/lib/brain-graph";

type SimNode = BrainNode & { x: number; y: number; vx: number; vy: number };

const radius: Record<BrainKind, number> = { user: 16, idea: 8, topic: 6 };

export default function BrainGraph({
  projectId,
  seeds,
  loading,
  person,
  topic,
  onPerson,
  onTopic,
}: {
  projectId: string;
  seeds: BrainSeed[];
  loading: boolean;
  person: string;
  topic: string;
  onPerson: (value: string) => void;
  onTopic: (value: string) => void;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<BrainEdge[]>([]);
  const dragRef = useRef<SimNode | null>(null);
  const hoverRef = useRef<SimNode | null>(null);
  const [empty, setEmpty] = useState(false);
  const [hover, setHover] = useState("");
  const avatarsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    if (loading) return;
    const graph = buildBrainGraph(projectId, seeds);
    setEmpty(graph.nodes.length === 0);
    const previous = new Map(nodesRef.current.map((node) => [node.id, node]));
    const width = wrapRef.current?.clientWidth || 320;
    const height = wrapRef.current?.clientHeight || 420;
    nodesRef.current = graph.nodes.map((node, index) => {
      const kept = previous.get(node.id);
      if (kept) return { ...node, x: kept.x, y: kept.y, vx: kept.vx, vy: kept.vy };
      const angle = (index / Math.max(graph.nodes.length, 1)) * Math.PI * 2;
      const spread = Math.min(width, height) * 0.42;
      const ring = node.kind === "user" ? spread * 0.4 : node.kind === "topic" ? spread * 0.72 : spread;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * ring,
        y: height / 2 + Math.sin(angle) * ring,
        vx: 0,
        vy: 0,
      };
    });
    edgesRef.current = graph.edges;
    for (const node of graph.nodes) {
      if (node.kind !== "user" || avatarsRef.current.has(node.label)) continue;
      const image = new Image();
      image.src = avatarPath(node.label);
      image.onload = () => {
        avatarsRef.current.set(node.label, image);
      };
    }
  }, [loading, projectId, seeds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || loading || empty) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    const paint = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const styles = getComputedStyle(wrap);
      const fg = styles.getPropertyValue("--rc-fg").trim() || "#0f172a";
      const muted = styles.getPropertyValue("--rc-fg-muted").trim() || "#64748b";
      const subtle = styles.getPropertyValue("--rc-fg-subtle").trim() || "#94a3b8";
      const accent = styles.getPropertyValue("--rc-fg").trim() || "#111111";
      const line = styles.getPropertyValue("--rc-border").trim() || "#e2e8f0";
      const bg = styles.getPropertyValue("--rc-surface").trim() || "#ffffff";

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const drag = dragRef.current;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]!;
        if (a !== drag) {
          a.vx += (cx - a.x) * 0.0016;
          a.vy += (cy - a.y) * 0.0016;
        }
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.max(48, Math.hypot(dx, dy));
          const push = 6400 / (dist * dist);
          const ux = (dx / dist) * push;
          const uy = (dy / dist) * push;
          if (a !== drag) {
            a.vx += ux;
            a.vy += uy;
          }
          if (b !== drag) {
            b.vx -= ux;
            b.vy -= uy;
          }
        }
      }

      const byId = new Map(nodes.map((node) => [node.id, node]));
      for (const edge of edges) {
        const a = byId.get(edge.from);
        const b = byId.get(edge.to);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = (dist - 150) * 0.004;
        const ux = (dx / dist) * pull;
        const uy = (dy / dist) * pull;
        if (a !== drag) {
          a.vx += ux;
          a.vy += uy;
        }
        if (b !== drag) {
          b.vx -= ux;
          b.vy -= uy;
        }
      }

      for (const node of nodes) {
        if (node === drag) continue;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x = Math.min(width - 24, Math.max(24, node.x + node.vx));
        node.y = Math.min(height - 24, Math.max(24, node.y + node.vy));
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = bg;
      context.fillRect(0, 0, width, height);

      const hoverId = hoverRef.current?.id ?? "";
      const near = new Set<string>();
      if (hoverId) {
        near.add(hoverId);
        for (const edge of edges) {
          if (edge.from === hoverId) near.add(edge.to);
          if (edge.to === hoverId) near.add(edge.from);
        }
      }

      context.lineWidth = 1;
      for (const edge of edges) {
        const a = byId.get(edge.from);
        const b = byId.get(edge.to);
        if (!a || !b) continue;
        const hot = !hoverId || (near.has(a.id) && near.has(b.id));
        context.strokeStyle = hot ? muted : line;
        context.globalAlpha = hot ? 0.7 : 0.25;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
      context.globalAlpha = 1;

      for (const node of nodes) {
        const r = radius[node.kind];
        const dim = hoverId && !near.has(node.id);
        context.globalAlpha = dim ? 0.28 : 1;
        const avatar = node.kind === "user" ? avatarsRef.current.get(node.label) : undefined;
        context.beginPath();
        context.arc(node.x, node.y, r, 0, Math.PI * 2);
        if (avatar) {
          context.save();
          context.clip();
          context.drawImage(avatar, node.x - r, node.y - r, r * 2, r * 2);
          context.restore();
        } else {
          context.fillStyle = node.kind === "idea" ? accent : node.kind === "user" ? fg : bg;
          context.fill();
        }
        if (node.kind === "topic") {
          context.strokeStyle = subtle;
          context.lineWidth = 1.5;
          context.stroke();
        }
        if (node.kind !== "topic" || node === hoverRef.current) {
          context.fillStyle = fg;
          context.font = "12px system-ui, sans-serif";
          context.textAlign = "center";
          context.textBaseline = "top";
          const name = node.label.length > 28 ? `${node.label.slice(0, 26)}…` : node.label;
          if (node.kind !== "user") context.fillText(name, node.x, node.y + r + 4);
        }
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [empty, loading]);

  const hit = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let found: SimNode | null = null;
    for (const node of nodesRef.current) {
      const r = radius[node.kind] + 4;
      if ((node.x - x) ** 2 + (node.y - y) ** 2 <= r * r) found = node;
    }
    return found;
  };

  return (
    <aside className="flex h-[28rem] flex-col gap-2 lg:sticky lg:top-0 lg:h-[calc(100dvh-6.75rem)]">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <h2 className="text-sm font-semibold text-rc-fg">Neural idea</h2>
        <span className="rounded-md bg-rc-border px-2 py-0.5 text-[11px] text-rc-fg-muted">
          People
        </span>
        <span className="rounded-md bg-rc-border px-2 py-0.5 text-[11px] text-rc-fg-muted">
          Ideas
        </span>
        <span className="rounded-md bg-rc-border px-2 py-0.5 text-[11px] text-rc-fg-muted">
          Topics
        </span>
      </div>
      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-rc-border bg-rc-surface">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-rc-surface-hover/60" aria-busy="true" />
        ) : empty ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-rc-fg-muted">
            No ideas match this filter.
          </p>
        ) : (
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => {
                const node = hit(event);
                dragRef.current = node;
                if (node) (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const node = dragRef.current;
                if (node && canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  node.x = event.clientX - rect.left;
                  node.y = event.clientY - rect.top;
                  node.vx = 0;
                  node.vy = 0;
                  return;
                }
                const next = hit(event);
                hoverRef.current = next;
                setHover(next ? `${next.kind === "user" ? "Person" : next.kind === "topic" ? "Topic" : "Idea"} · ${next.label}` : "");
              }}
              onPointerUp={() => {
                dragRef.current = null;
              }}
              onPointerLeave={() => {
                if (!dragRef.current) {
                  hoverRef.current = null;
                  setHover("");
                }
              }}
              onClick={(event) => {
                const node = hit(event);
                if (!node) return;
                if (node.kind === "user") {
                  onPerson(person === node.label ? "" : node.label);
                  return;
                }
                if (node.kind === "topic") {
                  onTopic(topic === node.label ? "" : node.label);
                  return;
                }
                if (node.href) router.push(node.href);
              }}
            />
          )}
        {hover ? (
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-rc-bg/90 px-2 py-1 text-xs text-rc-fg">
            {hover}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
