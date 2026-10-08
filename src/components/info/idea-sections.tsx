import { ArrowDown, ExternalLink } from "lucide-react";
import {
  flowLayers,
  type FaqItem,
  type FlowEdge,
  type IdeaLink,
} from "@/lib/idea-doc";

export function FlowGraph({ edges }: { edges: FlowEdge[] }) {
  const layers = flowLayers(edges);
  if (layers.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-rc-fg-muted">User flow</h2>
      <div className="flex flex-col items-center gap-2">
        {layers.map((layer, index) => (
          <div
            key={layer.join("|")}
            className="flex w-full flex-col items-center gap-2"
          >
            {index > 0 ? (
              <ArrowDown className="h-4 w-4 text-rc-fg-subtle" aria-hidden />
            ) : null}
            <div className="flex flex-wrap justify-center gap-2">
              {layer.map((node) => (
                <div
                  key={node}
                  className="max-w-full rounded-lg border border-rc-card-border bg-rc-surface px-3 py-2 text-center text-sm font-medium text-rc-fg shadow-[var(--rc-card-shadow)]"
                >
                  {node}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-rc-fg-muted">FAQ</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-lg border border-rc-border bg-rc-surface px-3 py-2"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-rc-fg [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <p className="pt-2 text-sm leading-relaxed text-rc-fg-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function LinkList({
  title,
  links,
}: {
  title: string;
  links: IdeaLink[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-rc-fg-muted">{title}</h2>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-rc-surface-hover/70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-rc-border bg-rc-surface-hover/80 text-rc-fg-muted">
                <ExternalLink className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-rc-fg">
                  {link.label}
                </span>
                {link.note ? (
                  <span className="mt-0.5 block text-xs text-rc-fg-subtle">
                    {link.note}
                  </span>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
