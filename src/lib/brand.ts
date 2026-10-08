export const appName = "2ndbrain";

export function pageTitle(segment?: string) {
  return segment ? `${segment} · ${appName}` : appName;
}
