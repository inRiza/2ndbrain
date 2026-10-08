import { redirect } from "next/navigation";
import IdeaWorkspace from "@/components/info/idea-workspace";
import { pageTitle } from "@/lib/brand";
import { getContentFile } from "@/lib/ideas";
import { requireProjectMember } from "@/lib/project-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return { title: pageTitle(decodeURIComponent(projectId)) };
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
      template={getContentFile("idea-template.md")}
      prompt={getContentFile("idea-prompt.md")}
    />
  );
}
