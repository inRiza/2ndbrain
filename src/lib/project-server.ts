import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import {
  normalizeProjectId,
  projectCookie,
  validateProjectPassword,
  type PublicProject,
} from "@/lib/project-shared";
import { ensureSchema, getSql } from "@/lib/db";

export function generatePublicId() {
  const chunk = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `stk-${chunk}`;
}

export async function createProject(password: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };
  const message = validateProjectPassword(password);
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
    INSERT INTO projects (public_id, public_id_lower, password_hash, created_by)
    VALUES (
      ${publicId},
      ${normalizeProjectId(publicId)},
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
