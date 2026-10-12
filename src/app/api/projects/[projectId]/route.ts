import { NextResponse } from "next/server";
import { deleteProject, updateProject } from "@/lib/project-server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await context.params;
    const body = (await request.json()) as { name?: string; password?: string };
    const result = await updateProject(decodeURIComponent(projectId), {
      name: body.name,
      password: body.password,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await context.params;
    const result = await deleteProject(decodeURIComponent(projectId));
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
