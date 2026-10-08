import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UserAvatar from "@/components/auth/user-avatar";
import { avatarPath } from "@/lib/avatar";
import { formatUpdated, type Idea } from "@/lib/idea-doc";

export default function IdeaCard({
  idea,
  projectId,
  topic = "",
  author = "",
}: {
  idea: Idea;
  projectId: string;
  topic?: string;
  author?: string;
}) {
  const href = `/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(idea.slug)}`;
  const avatarUrl = author ? `${avatarPath(author)}` : "";

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-rc-card-border bg-rc-surface p-4 shadow-[var(--rc-card-shadow)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--rc-card-shadow-hover)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-rc-fg-subtle">
          {[topic, idea.updated ? formatUpdated(idea.updated) : ""].filter(Boolean).join(" · ")}
        </span>
        {author ? (
          <UserAvatar username={author} avatarUrl={avatarUrl} size={28} />
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-rc-fg">
          {idea.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-rc-fg-muted">
          {idea.summary}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-end gap-3">
        <Link
          href={href}
          className="group rc-btn-primary inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border-transparent px-3 py-1.5 text-sm font-medium"
        >
          Open idea
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-rotate-45"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
