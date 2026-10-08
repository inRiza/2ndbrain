import { NextResponse } from "next/server";
import { joinProject } from "@/lib/project-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string; password?: string };
    const result = await joinProject(body.projectId ?? "", body.password ?? "");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Join project failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
