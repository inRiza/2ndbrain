import { redirect } from "next/navigation";

export default async function ProjectBrainPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${encodeURIComponent(decodeURIComponent(projectId))}`);
}
