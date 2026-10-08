"use client";

import { useState } from "react";
import Button from "@/components/action/button";

export default function CopyMarkdown({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button purpose="action" style="secondary" className="shrink-0" onClick={copy}>
      {copied ? "Copied" : "Copy markdown"}
    </Button>
  );
}
