import { getSql } from "@/lib/db";
import { parseIdea } from "@/lib/idea-doc";
import { sanitizePlan, type Plan } from "@/lib/plan-doc";
import { requireProjectMember } from "@/lib/project-server";

export async function getProjectPlan(publicId: string, slug: string) {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const rows = await sql`
    SELECT data, updated_at
    FROM project_plans
    WHERE project_id = ${access.project.id} AND slug = ${slug}
    LIMIT 1
  `;
  const row = rows[0] as { data: unknown; updated_at: string | Date } | undefined;
  return {
    plan: row ? sanitizePlan(row.data) : null,
    updatedAt: row ? new Date(row.updated_at).toISOString() : "",
  };
}

export async function saveProjectPlan(publicId: string, slug: string, input: unknown) {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const plan: Plan | null = sanitizePlan(input);
  if (!plan) return { error: "Invalid plan." };
  const sql = getSql();
  const idea = await sql`
    SELECT 1 FROM project_ideas WHERE project_id = ${access.project.id} AND slug = ${slug} LIMIT 1
  `;
  if (!idea.length) return { error: "Idea not found." };
  await sql`
    INSERT INTO project_plans (project_id, slug, data, updated_at)
    VALUES (${access.project.id}, ${slug}, ${JSON.stringify(plan)}::jsonb, now())
    ON CONFLICT (project_id, slug)
    DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
  return { plan };
}

export async function deleteProjectPlan(publicId: string, slug: string) {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  await sql`DELETE FROM project_plans WHERE project_id = ${access.project.id} AND slug = ${slug}`;
  return { ok: true as const };
}

export type PlanningIdea = {
  slug: string;
  title: string;
  summary: string;
  source: string;
  hasPlan: boolean;
};

export async function listPlanningIdeas(projectRowId: string): Promise<PlanningIdea[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT i.slug, i.source, (p.slug IS NOT NULL) AS has_plan
    FROM project_ideas i
    LEFT JOIN project_plans p ON p.project_id = i.project_id AND p.slug = i.slug
    WHERE i.project_id = ${projectRowId}
    ORDER BY i.created_at DESC
  `) as { slug: string; source: string; has_plan: boolean }[];
  return rows.map((row) => {
    const idea = parseIdea(row.slug, row.source);
    return {
      slug: row.slug,
      title: idea.title,
      summary: idea.summary,
      source: row.source,
      hasPlan: row.has_plan,
    };
  });
}
