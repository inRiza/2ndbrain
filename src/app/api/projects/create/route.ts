import { NextResponse } from "next/server";
import { createProject } from "@/lib/project-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; password?: string };
    const result = await createProject(body.name ?? "", body.password ?? "");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create project failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
