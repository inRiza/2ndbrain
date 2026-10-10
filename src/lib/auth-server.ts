import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { avatarColorById, avatarPath, generateAvatarSvg } from "@/lib/avatar";
import { normalizeUsername, sessionCookie, validateUsername, type PublicUser } from "@/lib/auth-shared";
import { ensureSchema, getSql } from "@/lib/db";

const sessionDays = 30;
const defaultUsername = "stacklist";
const defaultPassword = "stacklist";

type DbUser = {
  id: string;
  username: string;
  password_hash: string;
  avatar_svg: string;
  avatar_seed: string;
};

export async function initAuthStore() {
  await ensureSchema();
  await seedDefaultUser();
}

function toPublicUser(row: Pick<DbUser, "username"> & { avatar_seed: string }): PublicUser {
  return {
    username: row.username,
    avatarUrl: `${avatarPath(row.username)}&s=${encodeURIComponent(row.avatar_seed)}`,
  };
}

async function seedDefaultUser() {
  const sql = getSql();
  const existing = await sql`
    SELECT id FROM users WHERE username_lower = ${normalizeUsername(defaultUsername)} LIMIT 1
  `;
  if (existing.length) return;
  const seed = defaultUsername;
  await sql`
    INSERT INTO users (username, username_lower, password_hash, avatar_svg, avatar_seed)
    VALUES (
      ${defaultUsername},
      ${normalizeUsername(defaultUsername)},
      ${await bcrypt.hash(defaultPassword, 10)},
      ${generateAvatarSvg(defaultUsername, seed)},
      ${seed}
    )
  `;
}

export async function registerUser(username: string, password: string) {
  await initAuthStore();
  const message = validateUsername(username);
  if (message) return { error: message };
  if (!password) return { error: "Password cannot be empty." };

  const name = username.trim();
  const sql = getSql();
  const taken = await sql`
    SELECT id FROM users WHERE username_lower = ${normalizeUsername(name)} LIMIT 1
  `;
  if (taken.length) return { error: "That username is taken." };

  const seed = crypto.randomUUID();
  const inserted = await sql`
    INSERT INTO users (username, username_lower, password_hash, avatar_svg, avatar_seed)
    VALUES (
      ${name},
      ${normalizeUsername(name)},
      ${await bcrypt.hash(password, 10)},
      ${generateAvatarSvg(name, seed)},
      ${seed}
    )
    RETURNING id, username, avatar_seed
  `;
  const user = inserted[0] as { id: string; username: string; avatar_seed: string };
  const token = await createSession(user.id);
  await setSessionCookie(token);
  return { user: toPublicUser(user) };
}

export async function loginUser(username: string, password: string) {
  await initAuthStore();
  const sql = getSql();
  const rows = await sql`
    SELECT id, username, password_hash, avatar_seed
    FROM users
    WHERE username_lower = ${normalizeUsername(username)}
    LIMIT 1
  `;
  const row = rows[0] as Pick<DbUser, "id" | "username" | "password_hash" | "avatar_seed"> | undefined;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    return { error: "Username or password is wrong." };
  }
  const token = await createSession(row.id);
  await setSessionCookie(token);
  return { user: toPublicUser(row) };
}

export async function logoutUser() {
  const token = await readSessionToken();
  if (token) {
    const sql = getSql();
    await sql`DELETE FROM sessions WHERE token = ${token}`;
  }
  await clearSessionCookie();
}

export async function changePassword(password: string) {
  if (!password.trim()) return { error: "Password cannot be empty." };
  const current = await getCurrentUser();
  if (!current) return { error: "Not signed in." };
  const sql = getSql();
  await sql`
    UPDATE users
    SET password_hash = ${await bcrypt.hash(password, 10)}
    WHERE id = ${current.id}
  `;
  return { ok: true as const };
}

export async function regenerateAvatar(colorId: string) {
  const current = await getCurrentUser();
  if (!current) return { error: "Not signed in." };
  const color = avatarColorById(colorId);
  if (!color) return { error: "Pick a color." };
  const seed = color.id;
  const svg = generateAvatarSvg(current.username, seed);
  const sql = getSql();
  await sql`
    UPDATE users
    SET avatar_svg = ${svg}, avatar_seed = ${seed}
    WHERE id = ${current.id}
  `;
  return { user: toPublicUser({ username: current.username, avatar_seed: seed }) };
}

export async function getCurrentPublicUser() {
  const current = await getCurrentUser();
  if (!current) return null;
  return toPublicUser(current);
}

export async function getUserAvatar(username: string) {
  await initAuthStore();
  const sql = getSql();
  const rows = await sql`
    SELECT avatar_svg, avatar_seed
    FROM users
    WHERE username_lower = ${normalizeUsername(username)}
    LIMIT 1
  `;
  const row = rows[0] as { avatar_svg: string; avatar_seed: string } | undefined;
  if (!row) return null;
  return row;
}

export async function getCurrentUser() {
  await initAuthStore();
  const token = await readSessionToken();
  if (!token) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.username, u.password_hash, u.avatar_svg, u.avatar_seed
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
    LIMIT 1
  `;
  return (rows[0] as DbUser | undefined) ?? null;
}

async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const sql = getSql();
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, now() + make_interval(days => ${sessionDays}))
  `;
  return token;
}

async function readSessionToken() {
  const store = await cookies();
  return store.get(sessionCookie)?.value ?? "";
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * sessionDays,
  });
}

async function clearSessionCookie() {
  const store = await cookies();
  store.set(sessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
