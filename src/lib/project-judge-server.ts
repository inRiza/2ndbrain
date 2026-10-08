import { parseIdea } from "@/lib/idea-doc";
import {
  emptyJudge,
  judgeTotal,
  parseJudge,
  type JudgeScore,
  type Vote,
} from "@/lib/judge";
import { getSql } from "@/lib/db";
import { requireProjectMember } from "@/lib/project-server";

export type ProjectJudgeError = { error: string };

type VoteRow = {
  slug: string;
  username: string;
  score_idea: number;
  score_flow: number;
  score_faq: number;
  note: string;
};

function voteWithUsername(row: VoteRow): Vote {
  const score = parseJudge(
    JSON.stringify({
      idea: row.score_idea,
      flow: row.score_flow,
      faq: row.score_faq,
      note: row.note,
    }),
  );
  return { ...score, username: row.username };
}

function isEmptyScore(score: JudgeScore) {
  return judgeTotal(score) === 0 && !score.note.trim();
}

async function loadVotesForProject(projectId: string): Promise<Map<string, Vote[]>> {
  const sql = getSql();
  const rows = (await sql`
    SELECT v.slug, u.username, v.score_idea, v.score_flow, v.score_faq, v.note
    FROM project_idea_votes v
    JOIN users u ON u.id = v.user_id
    WHERE v.project_id = ${projectId}
    ORDER BY v.updated_at DESC
  `) as VoteRow[];
  const bySlug = new Map<string, Vote[]>();
  for (const row of rows) {
    const vote = voteWithUsername(row);
    if (isEmptyScore(vote)) continue;
    const list = bySlug.get(row.slug) ?? [];
    list.push(vote);
    bySlug.set(row.slug, list);
  }
  return bySlug;
}

export type JudgeIdeaEntry = {
  slug: string;
  title: string;
  author: string;
  votes: Vote[];
};

export async function listProjectJudge(
  publicId: string,
): Promise<{ entries: JudgeIdeaEntry[] } | ProjectJudgeError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const ideas = (await sql`
    SELECT slug, source, author
    FROM project_ideas
    WHERE project_id = ${access.project.id}
    ORDER BY created_at DESC
  `) as { slug: string; source: string; author: string }[];
  const bySlug = await loadVotesForProject(access.project.id);
  const entries = ideas.flatMap((row) => {
    const votes = bySlug.get(row.slug) ?? [];
    if (votes.length === 0) return [];
    const idea = parseIdea(row.slug, row.source);
    return [{ slug: row.slug, title: idea.title, author: row.author, votes }];
  });
  return { entries };
}

export async function getIdeaJudgeForUser(
  publicId: string,
  slug: string,
  userId?: string,
): Promise<{ votes: Vote[]; mine: JudgeScore } | ProjectJudgeError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const ideaRows = await sql`
    SELECT slug FROM project_ideas
    WHERE project_id = ${access.project.id} AND slug = ${slug}
    LIMIT 1
  `;
  if (!ideaRows.length) return { error: "Idea not found." };
  const rows = (await sql`
    SELECT u.username, v.score_idea, v.score_flow, v.score_faq, v.note
    FROM project_idea_votes v
    JOIN users u ON u.id = v.user_id
    WHERE v.project_id = ${access.project.id} AND v.slug = ${slug}
    ORDER BY v.updated_at DESC
  `) as Omit<VoteRow, "slug">[];
  const votes = rows.flatMap((row) => {
    const vote = voteWithUsername({ slug, ...row });
    return isEmptyScore(vote) ? [] : [vote];
  });
  let mine = emptyJudge();
  if (userId) {
    const mineRows = await sql`
      SELECT score_idea, score_flow, score_faq, note
      FROM project_idea_votes
      WHERE project_id = ${access.project.id} AND slug = ${slug} AND user_id = ${userId}
      LIMIT 1
    `;
    const row = mineRows[0] as
      | { score_idea: number; score_flow: number; score_faq: number; note: string }
      | undefined;
    if (row) {
      mine = parseJudge(
        JSON.stringify({
          idea: row.score_idea,
          flow: row.score_flow,
          faq: row.score_faq,
          note: row.note,
        }),
      );
    }
  }
  return { votes, mine };
}

export async function saveIdeaJudgeVote(
  publicId: string,
  slug: string,
  userId: string,
  raw: Partial<JudgeScore>,
): Promise<{ ok: true } | ProjectJudgeError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  const ideaRows = await sql`
    SELECT slug FROM project_ideas
    WHERE project_id = ${access.project.id} AND slug = ${slug}
    LIMIT 1
  `;
  if (!ideaRows.length) return { error: "Idea not found." };
  const score = parseJudge(JSON.stringify(raw));
  if (isEmptyScore(score)) {
    await sql`
      DELETE FROM project_idea_votes
      WHERE project_id = ${access.project.id} AND slug = ${slug} AND user_id = ${userId}
    `;
    return { ok: true };
  }
  await sql`
    INSERT INTO project_idea_votes (
      project_id, slug, user_id, score_idea, score_flow, score_faq, note, updated_at
    )
    VALUES (
      ${access.project.id},
      ${slug},
      ${userId},
      ${score.idea},
      ${score.flow},
      ${score.faq},
      ${score.note},
      now()
    )
    ON CONFLICT (project_id, slug, user_id)
    DO UPDATE SET
      score_idea = EXCLUDED.score_idea,
      score_flow = EXCLUDED.score_flow,
      score_faq = EXCLUDED.score_faq,
      note = EXCLUDED.note,
      updated_at = now()
  `;
  return { ok: true };
}

export async function clearIdeaJudgeVotes(
  publicId: string,
  slug: string,
): Promise<{ ok: true } | ProjectJudgeError> {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return { error: access.error };
  const sql = getSql();
  await sql`
    DELETE FROM project_idea_votes
    WHERE project_id = ${access.project.id} AND slug = ${slug}
  `;
  return { ok: true };
}
