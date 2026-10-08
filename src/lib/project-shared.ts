export const projectCookie = "stacklist_project";

export type PublicProject = {
  publicId: string;
};

export function normalizeProjectId(value: string) {
  return value.trim().toLowerCase();
}

export function validateProjectPassword(password: string) {
  if (password.length < 4) return "Use at least 4 characters for the project password.";
  return "";
}
