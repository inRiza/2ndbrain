import { redirect } from "next/navigation";
import IdeaWorkspace from "@/components/info/idea-workspace";
import { pageTitle } from "@/lib/brand";
import { getIdeaAiPrompt } from "@/lib/ideas";
import { getProjectName, requireProjectMember } from "@/lib/project-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const id = decodeURIComponent(projectId);
  return { title: pageTitle((await getProjectName(id)) || id) };
}

export default async function ProjectIdeasPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await requireProjectMember(decodeURIComponent(projectId));
  if ("error" in access) redirect("/projects");

  return (
    <IdeaWorkspace
      projectId={access.project.public_id}
      aiPrompt={getIdeaAiPrompt()}
    />
  );
}
