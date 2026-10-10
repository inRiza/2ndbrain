import Link from "next/link";
import UserAvatar from "@/components/auth/user-avatar";
import CopyMarkdown from "@/components/info/copy-markdown";
import JudgePanel from "@/components/info/judge-panel";
import { FaqList, FlowGraph, LinkList } from "@/components/info/idea-sections";
import MarkdownBody from "@/components/info/markdown-body";
import AppShell from "@/components/navigation/app-shell";
import { avatarPath } from "@/lib/avatar";
import { formatUpdated, type Idea } from "@/lib/idea-doc";

export default function IdeaDocument({
  projectId,
  idea,
  source,
  topic = "",
  author = "",
}: {
  projectId: string;
  idea: Idea;
  source: string;
  topic?: string;
  author?: string;
}) {
  const ideasHref = `/projects/${encodeURIComponent(projectId)}`;
  const avatarUrl = author ? avatarPath(author) : "";

  return (
    <AppShell projectId={projectId}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={ideasHref}
            className="w-fit text-sm font-medium text-rc-fg-muted transition-colors hover:text-rc-fg"
          >
            Ideas
          </Link>
          <CopyMarkdown source={source} />
        </div>
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {author ? (
              <UserAvatar username={author} avatarUrl={avatarUrl} size={32} />
            ) : null}
            <span className="flex flex-wrap gap-1.5">
              {[topic, idea.updated ? formatUpdated(idea.updated) : ""]
                .filter(Boolean)
                .map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-rc-border px-2 py-0.5 text-[11px] text-rc-fg-muted"
                  >
                    {label}
                  </span>
                ))}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-rc-fg">{idea.title}</h1>
          <p className="text-sm leading-relaxed text-rc-fg-muted">{idea.summary}</p>
        </header>
        {idea.idea ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-rc-fg-muted">Idea</h2>
            <MarkdownBody source={idea.idea} />
          </section>
        ) : null}
        <FlowGraph edges={idea.flow} />
        <FaqList items={idea.faq} />
        {idea.design ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-rc-fg-muted">Design</h2>
            <MarkdownBody source={idea.design} />
          </section>
        ) : null}
        <LinkList title="References" links={idea.references} />
        <LinkList title="Sites" links={idea.sites} />
        <JudgePanel projectId={projectId} slug={idea.slug} />
      </div>
    </AppShell>
  );
}
