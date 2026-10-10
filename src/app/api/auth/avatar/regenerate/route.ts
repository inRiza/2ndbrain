import { NextResponse } from "next/server";
import { regenerateAvatar } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { color?: string };
    const result = await regenerateAvatar(body.color ?? "");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
