export type PublicUser = {
  username: string;
  avatarUrl: string;
};

export const sessionCookie = "stacklist_session";

export function validateUsername(username: string) {
  const name = username.trim();
  if (!/^[a-zA-Z0-9_-]{2,24}$/.test(name)) {
    return "Use 2–24 letters, numbers, _ or -.";
  }
  return "";
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}
