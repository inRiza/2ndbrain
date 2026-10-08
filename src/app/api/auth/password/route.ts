import { NextResponse } from "next/server";
import { changePassword } from "@/lib/auth-server";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const result = await changePassword(body.password ?? "");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
