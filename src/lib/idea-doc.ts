export type FlowEdge = {
  from: string;
  to: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type IdeaLink = {
  label: string;
  href: string;
  note: string;
};

export type Idea = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  tags: string[];
  skills: string[];
  idea: string;
  flow: FlowEdge[];
  faq: FaqItem[];
  references: IdeaLink[];
  design: string;
  sites: IdeaLink[];
};

export function isSafeHref(href: string) {
  return href.startsWith("https://") || href.startsWith("http://");
}

export function parseIdea(slug: string, raw: string): Idea {
  const { meta, body } = splitFrontmatter(raw);
  const sections = splitSections(body);

  return {
    slug,
    title: meta.title || slug,
    summary: meta.summary || "",
    updated: meta.updated || "",
    tags: splitList(meta.tags),
    skills: splitList(meta.skills),
    idea: sections.idea || "",
    flow: parseFlow(sections.flow || ""),
    faq: parseFaq(sections.faq || ""),
    references: parseLinks(sections.references || ""),
    design: sections.design || "",
    sites: parseLinks(sections.sites || ""),
  };
}

export function flowLayers(edges: FlowEdge[]) {
  // ponytail: one walk from the roots. A cycle is dumped in the last row, not drawn as a loop.
  const nodes: string[] = [];
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  for (const edge of edges) {
    if (!nodes.includes(edge.from)) nodes.push(edge.from);
    if (!nodes.includes(edge.to)) nodes.push(edge.to);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    incoming.set(edge.from, incoming.get(edge.from) ?? 0);
  }

  const roots = nodes.filter((node) => incoming.get(node) === 0);
  let current = roots.length > 0 ? roots : nodes.slice(0, 1);
  const seen = new Set<string>();
  const layers: string[][] = [];

  while (current.length > 0) {
    const layer = current.filter((node) => !seen.has(node));
    if (layer.length === 0) break;
    for (const node of layer) seen.add(node);
    layers.push(layer);
    const next: string[] = [];
    for (const node of layer) {
      for (const target of outgoing.get(node) ?? []) {
        if (!seen.has(target) && !next.includes(target)) next.push(target);
      }
    }
    current = next;
  }

  const rest = nodes.filter((node) => !seen.has(node));
  if (rest.length > 0) layers.push(rest);
  return layers;
}

function splitList(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readFrontmatter(raw: string) {
  return splitFrontmatter(raw);
}

function splitFrontmatter(raw: string) {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return { meta: {}, body: text.trim() };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, body: text.trim() };
  const meta: Record<string, string> = {};
  for (const line of text.slice(4, end).split("\n")) {
    const cut = line.indexOf(":");
    if (cut === -1) continue;
    meta[line.slice(0, cut).trim()] = line.slice(cut + 1).trim();
  }
  return { meta, body: text.slice(end + 5).trim() };
}

function splitSections(body: string) {
  const sections: Record<string, string> = {};
  const parts = body.split(/^##\s+/m);
  for (const part of parts) {
    const lineEnd = part.indexOf("\n");
    if (lineEnd === -1) continue;
    const name = part.slice(0, lineEnd).trim().toLowerCase();
    sections[name] = part.slice(lineEnd + 1).trim();
  }
  return sections;
}

function parseFlow(source: string): FlowEdge[] {
  return source.split("\n").flatMap((line) => {
    const match = line.match(/^- (.+)$/);
    if (!match) return [];
    const parts = match[1]
      .split(/\s*(?:->|→)\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
    const edges: FlowEdge[] = [];
    for (let index = 0; index < parts.length - 1; index += 1) {
      edges.push({ from: parts[index], to: parts[index + 1] });
    }
    return edges;
  });
}

function parseFaq(source: string): FaqItem[] {
  return source
    .split(/^###\s+/m)
    .slice(1)
    .flatMap((part) => {
      const lineEnd = part.indexOf("\n");
      const question = (lineEnd === -1 ? part : part.slice(0, lineEnd)).trim();
      const answer = (lineEnd === -1 ? "" : part.slice(lineEnd + 1)).trim();
      if (!question) return [];
      return [{ question, answer }];
    });
}

function parseLinks(source: string): IdeaLink[] {
  return source
    .split("\n")
    .map((line) => {
      const match = line.match(
        /^- \[([^\]]+)\]\(([^)]+)\)(?:\s+[—–-]\s+(.+))?$/,
      );
      if (!match || !isSafeHref(match[2].trim())) return null;
      return {
        label: match[1].trim(),
        href: match[2].trim(),
        note: (match[3] || "").trim(),
      };
    })
    .filter((link): link is IdeaLink => link !== null);
}

export function formatUpdated(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
