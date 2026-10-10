export type BrainKind = "user" | "idea" | "topic";

export type BrainNode = {
  id: string;
  kind: BrainKind;
  label: string;
  href: string;
};

export type BrainEdge = {
  from: string;
  to: string;
};

export type BrainSeed = {
  slug: string;
  title: string;
  author: string;
  topic: string;
  tags: string[];
};

export function buildBrainGraph(
  projectId: string,
  seeds: BrainSeed[],
): { nodes: BrainNode[]; edges: BrainEdge[] } {
  const nodes = new Map<string, BrainNode>();
  const edges: BrainEdge[] = [];
  const seen = new Set<string>();

  const link = (from: string, to: string) => {
    if (!from || !to || from === to) return;
    const key = from < to ? `${from}|${to}` : `${to}|${from}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to });
  };

  const ideaIds: { id: string; tags: string[] }[] = [];

  for (const seed of seeds) {
    const ideaId = `idea:${seed.slug}`;
    nodes.set(ideaId, {
      id: ideaId,
      kind: "idea",
      label: seed.title || seed.slug,
      href: `/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(seed.slug)}`,
    });
    ideaIds.push({ id: ideaId, tags: seed.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean) });

    const author = seed.author.trim();
    if (author) {
      const userId = `user:${author.toLowerCase()}`;
      if (!nodes.has(userId)) {
        nodes.set(userId, { id: userId, kind: "user", label: author, href: "" });
      }
      link(userId, ideaId);
    }

    const topic = seed.topic.trim();
    if (topic) {
      const topicId = `topic:${topic.toLowerCase()}`;
      if (!nodes.has(topicId)) {
        nodes.set(topicId, { id: topicId, kind: "topic", label: topic, href: "" });
      }
      link(ideaId, topicId);
    }
  }

  for (let i = 0; i < ideaIds.length; i += 1) {
    for (let j = i + 1; j < ideaIds.length; j += 1) {
      const left = ideaIds[i]!;
      const right = ideaIds[j]!;
      if (left.tags.some((tag) => right.tags.includes(tag))) link(left.id, right.id);
    }
  }

  return { nodes: [...nodes.values()], edges };
}
