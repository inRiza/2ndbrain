import { NextResponse } from "next/server";
import {
  deleteProjectPlan,
  getProjectPlan,
  saveProjectPlan,
} from "@/lib/project-plans-server";

type Context = { params: Promise<{ projectId: string; slug: string }> };

async function readParams(context: Context) {
  const { projectId, slug } = await context.params;
  return { projectId: decodeURIComponent(projectId), slug: decodeURIComponent(slug) };
}

export async function GET(_request: Request, context: Context) {
  try {
    const { projectId, slug } = await readParams(context);
    const result = await getProjectPlan(projectId, slug);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 403 });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { projectId, slug } = await readParams(context);
    const body = (await request.json()) as { plan?: unknown };
    const result = await saveProjectPlan(projectId, slug, body.plan);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { projectId, slug } = await readParams(context);
    const result = await deleteProjectPlan(projectId, slug);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 403 });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
