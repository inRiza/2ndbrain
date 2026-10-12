import { redirect } from "next/navigation";
import PlanningPage from "@/components/planning/planning-page";
import { pageTitle } from "@/lib/brand";
import { getPlanAiPrompt } from "@/lib/ideas";
import { ensureSchema } from "@/lib/db";
import { listPlanningIdeas } from "@/lib/project-plans-server";
import { getProjectName, requireProjectMember } from "@/lib/project-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const id = decodeURIComponent(projectId);
  return { title: pageTitle(`Planning · ${(await getProjectName(id)) || id}`) };
}

export default async function ProjectPlanningPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ idea?: string }>;
}) {
  const { projectId } = await params;
  const { idea } = await searchParams;
  const access = await requireProjectMember(decodeURIComponent(projectId));
  if ("error" in access) redirect("/projects");
  await ensureSchema();
  const ideas = await listPlanningIdeas(access.project.id);

  return (
    <PlanningPage
      projectId={access.project.public_id}
      ideas={ideas}
      initialSlug={ideas.some((item) => item.slug === idea) ? idea! : (ideas[0]?.slug ?? "")}
      aiPrompt={getPlanAiPrompt()}
    />
  );
}
