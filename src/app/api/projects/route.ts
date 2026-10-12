import { NextResponse } from "next/server";
import { listJoinedProjects } from "@/lib/project-server";

export async function GET() {
  try {
    const result = await listJoinedProjects();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load projects.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
