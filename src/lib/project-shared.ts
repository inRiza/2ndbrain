export const projectCookie = "stacklist_project";

export type PublicProject = {
  publicId: string;
};

export type JoinedProject = {
  publicId: string;
  name: string;
  isOwner: boolean;
  memberCount: number;
  ideaCount: number;
  joinedAt: string;
};

export function normalizeProjectId(value: string) {
  return value.trim().toLowerCase();
}

export function cleanProjectName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateProjectName(name: string) {
  const clean = cleanProjectName(name);
  if (!clean) return "Enter a project name.";
  if (clean.length > 48) return "Keep the project name under 48 characters.";
  return "";
}

export function projectLabel(project: { name: string; publicId: string }) {
  return project.name || project.publicId;
}

export function validateProjectPassword(password: string) {
  if (password.length < 4) return "Use at least 4 characters for the project password.";
  return "";
}
