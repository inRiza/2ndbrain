import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseIdea, type Idea } from "@/lib/idea-doc";

export function getIdeas(): Idea[] {
  const dir = path.join(process.cwd(), "content", "ideas");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const slug = name.slice(0, -3);
      return parseIdea(slug, readFileSync(path.join(dir, name), "utf8"));
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

export function getIdea(slug: string) {
  return getIdeas().find((idea) => idea.slug === slug) ?? null;
}

export function getIdeaSource(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(process.cwd(), "content", "ideas", `${slug}.md`);
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8");
}

export function getIdeaAiPrompt() {
  return readFileSync(path.join(process.cwd(), "content", "idea-ai-prompt.md"), "utf8");
}
