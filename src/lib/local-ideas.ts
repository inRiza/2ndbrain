const storageKey = "stacklist-uploaded-ideas";

export type StoredIdea = {
  slug: string;
  source: string;
  topic: string;
  author: string;
};

export function slugFromName(name: string) {
  const base = name.replace(/\.md$/i, "").trim().toLowerCase();
  const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "idea";
}

export function parseStoredList(raw: string): StoredIdea[] {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as {
        slug?: unknown;
        source?: unknown;
        topic?: unknown;
        author?: unknown;
      };
      if (typeof record.slug !== "string" || typeof record.source !== "string") {
        return [];
      }
      if (!/^[a-z0-9-]+$/.test(record.slug) || !record.source.trim()) return [];
      return [
        {
          slug: record.slug,
          source: record.source,
          topic: typeof record.topic === "string" ? record.topic.trim() : "",
          author: typeof record.author === "string" ? record.author.trim() : "",
        },
      ];
    });
  } catch {
    return [];
  }
}

export function readStoredIdeas() {
  if (typeof window === "undefined") return [];
  return parseStoredList(localStorage.getItem(storageKey) ?? "");
}

export function saveStoredIdea(
  slug: string,
  source: string,
  topic: string,
  author: string,
) {
  const next = [
    { slug, source, topic, author },
    ...readStoredIdeas().filter((item) => item.slug !== slug),
  ];
  localStorage.setItem(storageKey, JSON.stringify(next));
}
