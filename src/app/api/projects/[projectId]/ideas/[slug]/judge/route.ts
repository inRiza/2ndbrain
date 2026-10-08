import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import {
  clearIdeaJudgeVotes,
  getIdeaJudgeForUser,
  saveIdeaJudgeVote,
} from "@/lib/project-judge-server";
import type { JudgeScore } from "@/lib/judge";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string; slug: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { projectId, slug } = await context.params;
    const publicId = decodeURIComponent(projectId);
    const result = await getIdeaJudgeForUser(publicId, slug, user?.id);
    if ("error" in result) {
      const status = result.error === "Idea not found." ? 404 : 403;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ projectId: string; slug: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { projectId, slug } = await context.params;
    const body = (await request.json()) as Partial<JudgeScore>;
    const result = await saveIdeaJudgeVote(
      decodeURIComponent(projectId),
      slug,
      user.id,
      body,
    );
    if ("error" in result) {
      const status = result.error === "Idea not found." ? 404 : 403;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save score.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string; slug: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { projectId, slug } = await context.params;
    const result = await clearIdeaJudgeVotes(decodeURIComponent(projectId), slug);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not clear scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
