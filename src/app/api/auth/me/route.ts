import { NextResponse } from "next/server";
import { getCurrentPublicUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getCurrentPublicUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Session check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
