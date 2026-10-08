import { notFound, redirect } from "next/navigation";
import IdeaDocument from "@/components/info/idea-document";
import { pageTitle } from "@/lib/brand";
import { getProjectIdea } from "@/lib/project-ideas-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string; slug: string }>;
}) {
  const { projectId, slug } = await params;
  const result = await getProjectIdea(decodeURIComponent(projectId), slug);
  if ("error" in result) return { title: pageTitle() };
  return { title: pageTitle(result.idea.title) };
}

export default async function ProjectIdeaPage({
  params,
}: {
  params: Promise<{ projectId: string; slug: string }>;
}) {
  const { projectId, slug } = await params;
  const publicId = decodeURIComponent(projectId);
  const result = await getProjectIdea(publicId, slug);
  if ("error" in result) {
    if (result.error === "You are not in this project.") redirect("/projects");
    notFound();
  }
  return (
    <IdeaDocument
      projectId={publicId}
      idea={result.idea}
      source={result.source}
      topic={result.topic}
      author={result.author}
    />
  );
}
