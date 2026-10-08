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

export function generateAvatarSvg(username: string, seed = username) {
  const initials = avatarInitials(username);
  const hash = hashString(`${username}:${seed}`);
  const hue = hash % 360;
  const hue2 = (hash * 7) % 360;
  const bg = `hsl(${hue} 62% 42%)`;
  const accent = `hsl(${hue2} 70% 58%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${username} avatar">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="48" fill="url(#g)" />
  <text x="48" y="54" text-anchor="middle" font-family="system-ui, sans-serif" font-size="34" font-weight="600" fill="#ffffff">${initials}</text>
</svg>`;
}

export function avatarPath(username: string) {
  return `/api/users/${encodeURIComponent(username)}/avatar`;
}
