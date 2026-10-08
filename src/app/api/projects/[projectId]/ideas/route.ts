import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { listProjectIdeas, saveProjectIdea } from "@/lib/project-ideas-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await context.params;
    const result = await listProjectIdeas(decodeURIComponent(projectId));
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load ideas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await context.params;
    const body = (await request.json()) as {
      slug?: string;
      source?: string;
      topic?: string;
    };
    const result = await saveProjectIdea(
      decodeURIComponent(projectId),
      body.slug ?? "",
      body.source ?? "",
      body.topic ?? "",
      user?.username ?? "",
    );
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save idea.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
