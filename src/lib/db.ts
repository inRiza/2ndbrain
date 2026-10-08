import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local");
  }
  return neon(url);
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = runEnsureSchema();
  }
  await schemaReady;
}

async function runEnsureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      username_lower TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_svg TEXT NOT NULL,
      avatar_seed TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token)`;
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      public_id TEXT NOT NULL UNIQUE,
      public_id_lower TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS project_members (
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (project_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS project_ideas (
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      source TEXT NOT NULL,
      topic TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (project_id, slug)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS project_ideas_project_idx ON project_ideas(project_id)`;
}
