import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import {
  cleanProjectName,
  normalizeProjectId,
  projectCookie,
  validateProjectName,
  validateProjectPassword,
  type JoinedProject,
  type PublicProject,
} from "@/lib/project-shared";
import { ensureSchema, getSql } from "@/lib/db";

export function generatePublicId() {
  const chunk = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `stk-${chunk}`;
}

export async function createProject(name: string, password: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  const message = validateProjectName(name) || validateProjectPassword(password);
  if (message) return { error: message };

  await ensureSchema();
  const sql = getSql();
  let publicId = generatePublicId();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await sql`
      SELECT id FROM projects WHERE public_id_lower = ${normalizeProjectId(publicId)} LIMIT 1
    `;
    if (!clash.length) break;
    publicId = generatePublicId();
  }

  const inserted = await sql`
    INSERT INTO projects (public_id, public_id_lower, name, password_hash, created_by)
    VALUES (
      ${publicId},
      ${normalizeProjectId(publicId)},
      ${cleanProjectName(name)},
      ${await bcrypt.hash(password, 10)},
      ${user.id}
    )
    RETURNING id, public_id
  `;
  const row = inserted[0] as { id: string; public_id: string };
  await sql`
    INSERT INTO project_members (project_id, user_id)
    VALUES (${row.id}, ${user.id})
    ON CONFLICT DO NOTHING
  `;
  await setProjectCookie(row.public_id);
  return { project: { publicId: row.public_id } satisfies PublicProject };
}

export async function joinProject(projectId: string, password: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  if (!projectId.trim()) return { error: "Enter a project ID." };
  if (!password) return { error: "Enter the project password." };

  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, public_id, password_hash
    FROM projects
    WHERE public_id_lower = ${normalizeProjectId(projectId)}
    LIMIT 1
  `;
  const row = rows[0] as { id: string; public_id: string; password_hash: string } | undefined;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    return { error: "Project ID or password is wrong." };
  }
  await sql`
    INSERT INTO project_members (project_id, user_id)
    VALUES (${row.id}, ${user.id})
    ON CONFLICT DO NOTHING
  `;
  await setProjectCookie(row.public_id);
  return { project: { publicId: row.public_id } satisfies PublicProject };
}

export async function listJoinedProjects() {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT
      p.public_id,
      p.name,
      p.created_by = ${user.id} AS is_owner,
      m.joined_at,
      (SELECT count(*)::int FROM project_members pm WHERE pm.project_id = p.id) AS member_count,
      (SELECT count(*)::int FROM project_ideas pi WHERE pi.project_id = p.id) AS idea_count
    FROM projects p
    JOIN project_members m ON m.project_id = p.id
    WHERE m.user_id = ${user.id}
    ORDER BY m.joined_at DESC
  `) as {
    public_id: string;
    name: string;
    is_owner: boolean;
    joined_at: string | Date;
    member_count: number;
    idea_count: number;
  }[];
  return {
    projects: rows.map(
      (row): JoinedProject => ({
        publicId: row.public_id,
        name: row.name,
        isOwner: row.is_owner,
        memberCount: row.member_count,
        ideaCount: row.idea_count,
        joinedAt: new Date(row.joined_at).toISOString(),
      }),
    ),
  };
}

export async function leaveProject(publicId: string) {
  const access = await requireProjectMember(publicId);
  if ("error" in access) return access;
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  const sql = getSql();
  await sql`
    DELETE FROM project_members
    WHERE project_id = ${access.project.id} AND user_id = ${user.id}
  `;
  const store = await cookies();
  if (normalizeProjectId(store.get(projectCookie)?.value ?? "") === normalizeProjectId(publicId)) {
    await clearProjectCookie();
  }
  return { ok: true as const };
}

async function requireProjectOwner(publicId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." as const };
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, public_id
    FROM projects
    WHERE public_id_lower = ${normalizeProjectId(publicId)} AND created_by = ${user.id}
    LIMIT 1
  `;
  const row = rows[0] as { id: string; public_id: string } | undefined;
  if (!row) return { error: "Only the project owner can do this." as const };
  return { project: row };
}

export async function updateProject(
  publicId: string,
  changes: { name?: string; password?: string },
) {
  const access = await requireProjectOwner(publicId);
  if ("error" in access) return access;
  const sql = getSql();
  if (changes.name !== undefined) {
    const message = validateProjectName(changes.name);
    if (message) return { error: message };
    await sql`
      UPDATE projects SET name = ${cleanProjectName(changes.name)} WHERE id = ${access.project.id}
    `;
  }
  if (changes.password) {
    const message = validateProjectPassword(changes.password);
    if (message) return { error: message };
    await sql`
      UPDATE projects
      SET password_hash = ${await bcrypt.hash(changes.password, 10)}
      WHERE id = ${access.project.id}
    `;
  }
  return { ok: true as const };
}

export async function deleteProject(publicId: string) {
  const access = await requireProjectOwner(publicId);
  if ("error" in access) return access;
  const sql = getSql();
  await sql`DELETE FROM projects WHERE id = ${access.project.id}`;
  const store = await cookies();
  if (normalizeProjectId(store.get(projectCookie)?.value ?? "") === normalizeProjectId(publicId)) {
    await clearProjectCookie();
  }
  return { ok: true as const };
}

export async function getProjectName(publicId: string) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT name FROM projects WHERE public_id_lower = ${normalizeProjectId(publicId)} LIMIT 1
  `;
  return (rows[0] as { name: string } | undefined)?.name ?? "";
}

export async function clearProjectCookie() {
  const store = await cookies();
  store.set(projectCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type ProjectMemberAccess =
  | { error: string }
  | { project: { id: string; public_id: string } };

export async function requireProjectMember(publicId: string): Promise<ProjectMemberAccess> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." as const };
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT p.id, p.public_id
    FROM projects p
    JOIN project_members m ON m.project_id = p.id
    WHERE p.public_id_lower = ${normalizeProjectId(publicId)} AND m.user_id = ${user.id}
    LIMIT 1
  `;
  const row = rows[0] as { id: string; public_id: string } | undefined;
  if (!row) return { error: "You are not in this project." as const };
  return { project: row };
}

async function setProjectCookie(publicId: string) {
  const store = await cookies();
  store.set(projectCookie, publicId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}
