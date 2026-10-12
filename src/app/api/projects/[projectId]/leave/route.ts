import { NextResponse } from "next/server";
import { leaveProject } from "@/lib/project-server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await context.params;
    const result = await leaveProject(decodeURIComponent(projectId));
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not leave the project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
