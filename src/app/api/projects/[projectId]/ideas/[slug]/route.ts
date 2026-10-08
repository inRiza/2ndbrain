import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { deleteProjectIdea } from "@/lib/project-ideas-server";

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
    const result = await deleteProjectIdea(
      decodeURIComponent(projectId),
      slug,
      user.username,
    );
    if ("error" in result) {
      const status = result.error === "Idea not found." ? 404 : 403;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete idea.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
