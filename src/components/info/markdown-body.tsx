import type { ReactNode } from "react";
import { isSafeHref } from "@/lib/idea-doc";

type Inline =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

function parseInlines(input: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (!buf) return;
    out.push({ type: "text", value: buf });
    buf = "";
  };

  while (i < input.length) {
    if (input.startsWith("**", i)) {
      const end = input.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        out.push({ type: "bold", value: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        out.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (input[i] === "[") {
      const close = input.indexOf("]", i + 1);
      if (close !== -1 && input[close + 1] === "(") {
        const hrefEnd = input.indexOf(")", close + 2);
        const href = input.slice(close + 2, hrefEnd).trim();
        if (hrefEnd !== -1 && isSafeHref(href)) {
          flush();
          out.push({
            type: "link",
            label: input.slice(i + 1, close),
            href,
          });
          i = hrefEnd + 1;
          continue;
        }
      }
    }
    buf += input[i];
    i += 1;
  }
  flush();
  return out;
}

function InlineText({ inlines }: { inlines: Inline[] }) {
  return inlines.map((part, index) => {
    if (part.type === "bold") {
      return (
        <strong key={index} className="font-semibold text-rc-fg">
          {part.value}
        </strong>
      );
    }
    if (part.type === "code") {
      return (
        <code
          key={index}
          className="rounded-md bg-rc-surface-hover px-1 py-0.5 font-mono text-[0.85em] text-rc-fg"
        >
          {part.value}
        </code>
      );
    }
    if (part.type === "link") {
      return (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rc-primary underline-offset-2 hover:underline"
        >
          {part.label}
        </a>
      );
    }
    return <span key={index}>{part.value}</span>;
  });
}

export default function MarkdownBody({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text) return;
    blocks.push(
      <p key={blocks.length} className="text-sm leading-relaxed text-rc-fg-muted">
        <InlineText inlines={parseInlines(text)} />
      </p>,
    );
  };

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={blocks.length} className="flex list-none flex-col gap-1 pl-0">
        {items.map((item, index) => (
          <li key={index} className="text-sm leading-relaxed text-rc-fg-muted">
            <InlineText inlines={parseInlines(item)} />
          </li>
        ))}
      </ul>,
    );
  };

  for (const line of lines) {
    const item = line.match(/^- (.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();

  return <div className="flex flex-col gap-3">{blocks}</div>;
}
