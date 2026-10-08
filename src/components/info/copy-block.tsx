"use client";

import { useState } from "react";
import Button from "@/components/action/button";

export default function CopyBlock({
  title,
  body,
  text,
}: {
  title: string;
  body: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-rc-fg-muted">{title}</h2>
          <p className="text-sm leading-relaxed text-rc-fg-muted">{body}</p>
        </div>
        <Button purpose="action" style="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="rc-scrollbar max-h-36 overflow-auto rounded-lg border border-rc-border bg-rc-bg p-3 font-mono text-xs leading-relaxed text-rc-fg">
        {text}
      </pre>
    </section>
  );
}
