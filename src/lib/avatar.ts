function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarInitials(username: string) {
  const parts = username.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const compact = username.replace(/[^a-zA-Z0-9]/g, "");
  return (compact.slice(0, 2) || "??").toUpperCase();
}

export const avatarColors = [
  { id: "rose", fill: "#f6c9cf", ink: "#7a3b46" },
  { id: "peach", fill: "#f8d7b8", ink: "#7a4d2c" },
  { id: "sand", fill: "#f3e3b8", ink: "#6d5824" },
  { id: "sage", fill: "#cfe3c8", ink: "#3d5c38" },
  { id: "mint", fill: "#c5e6dc", ink: "#2f5c52" },
  { id: "sky", fill: "#c9dff5", ink: "#2e5278" },
  { id: "lilac", fill: "#ddd4f5", ink: "#53447a" },
  { id: "stone", fill: "#e4e2de", ink: "#4a4844" },
] as const;

export function avatarColorById(id: string) {
  return avatarColors.find((color) => color.id === id);
}

export function generateAvatarSvg(username: string, seed = username) {
  const initials = avatarInitials(username);
  const chosen =
    avatarColorById(seed) ?? avatarColors[hashString(`${username}:${seed}`) % avatarColors.length]!;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${username} avatar">
  <rect width="96" height="96" rx="48" fill="${chosen.fill}" />
  ${avatarInitialsMarkup(initials, chosen.ink)}
</svg>`;
}

function avatarInitialsMarkup(initials: string, ink = "#3f3f46") {
  return `<g transform="translate(48,48)"><text text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="600" fill="${ink}">${initials}</text></g>`;
}

export function normalizeAvatarSvg(svg: string) {
  if (svg.includes('transform="translate(48,48)"')) return svg;
  const match = svg.match(/<text[^>]*>([^<]*)<\/text>/);
  if (!match) return svg;
  const initials = match[1] ?? "??";
  return svg.replace(/<text[^>]*>[^<]*<\/text>/, avatarInitialsMarkup(initials));
}

export function avatarPath(username: string) {
  return `/api/users/${encodeURIComponent(username)}/avatar?style=pastel`;
}
