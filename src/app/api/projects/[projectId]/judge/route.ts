import { NextResponse } from "next/server";
import { listProjectJudge } from "@/lib/project-judge-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await context.params;
    const result = await listProjectJudge(decodeURIComponent(projectId));
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load judge data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
