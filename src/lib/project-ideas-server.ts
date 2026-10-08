import { parseIdea, type Idea } from "@/lib/idea-doc";
import { requireProjectMember } from "@/lib/project-server";
import { getSql } from "@/lib/db";

export type StoredProjectIdea = {
  slug: string;
  source: string;
  topic: string;
  author: string;
};

export type ProjectIdeasPayload = {
  ideas: { idea: Idea; topic: string; author: string }[];
};

export type ProjectIdeaPayload = {
  idea: Idea;
  source: string;
  topic: string;
  author: string;
};

export type ProjectIdeasError = { error: string };

export async function listProjectIdeas(
  publicId: string,
): Promise<ProjectIdeasPayload | ProjectIdeasError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const rows = await sql`
    SELECT slug, source, topic, author
    FROM project_ideas
    WHERE project_id = ${access.project.id}
    ORDER BY created_at DESC
  `;
  return {
    ideas: (rows as StoredProjectIdea[]).map((row) => ({
      idea: parseIdea(row.slug, row.source),
      topic: row.topic,
      author: row.author,
    })),
  };
}

export async function getProjectIdea(
  publicId: string,
  slug: string,
): Promise<ProjectIdeaPayload | ProjectIdeasError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const rows = await sql`
    SELECT slug, source, topic, author
    FROM project_ideas
    WHERE project_id = ${access.project.id} AND slug = ${slug}
    LIMIT 1
  `;
  const row = rows[0] as StoredProjectIdea | undefined;
  if (!row) return { error: "Idea not found." as const };
  return {
    idea: parseIdea(row.slug, row.source),
    source: row.source,
    topic: row.topic,
    author: row.author,
  };
}

export async function saveProjectIdea(
  publicId: string,
  slug: string,
  source: string,
  topic: string,
  author: string,
) {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  if (!/^[a-z0-9-]+$/.test(slug) || !source.trim()) {
    return { error: "Invalid idea." as const };
  }
  const sql = getSql();
  await sql`
    INSERT INTO project_ideas (project_id, slug, source, topic, author)
    VALUES (${access.project.id}, ${slug}, ${source}, ${topic}, ${author})
    ON CONFLICT (project_id, slug)
    DO UPDATE SET source = EXCLUDED.source, topic = EXCLUDED.topic, author = EXCLUDED.author
  `;
  return { ok: true as const };
}

export async function listProjectIdeasForJudge(publicId: string): Promise<Idea[]> {
  const result = await listProjectIdeas(publicId);
  if (!("ideas" in result)) return [];
  return result.ideas.map((row) => row.idea);
}
