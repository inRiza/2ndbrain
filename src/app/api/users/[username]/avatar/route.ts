import { getUserAvatar } from "@/lib/auth-server";
import { generateAvatarSvg } from "@/lib/avatar";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await context.params;
    const row = await getUserAvatar(decodeURIComponent(username));
    if (!row) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(generateAvatarSvg(decodeURIComponent(username), row.avatar_seed), {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Avatar unavailable", { status: 500 });
  }
}
