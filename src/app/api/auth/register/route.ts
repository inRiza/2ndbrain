import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const result = await registerUser(body.username ?? "", body.password ?? "");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Register failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
