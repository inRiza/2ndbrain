import { redirect } from "next/navigation";
import JudgePage from "@/components/info/judge-page";
import { pageTitle } from "@/lib/brand";
import { requireProjectMember } from "@/lib/project-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return { title: pageTitle(`Judge · ${decodeURIComponent(projectId)}`) };
}

export default async function ProjectJudgePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await requireProjectMember(decodeURIComponent(projectId));
  if ("error" in access) redirect("/projects");
  return <JudgePage projectId={access.project.public_id} />;
}
