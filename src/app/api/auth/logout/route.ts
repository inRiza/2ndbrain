import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth-server";

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
