"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TabPicker from "@/components/action/tab-picker";
import Button from "@/components/action/button";
import CopyBlock from "@/components/info/copy-block";
import { slugFromName } from "@/lib/local-ideas";
import { resolvedTopic } from "@/lib/topics";
import TopicSelect from "@/components/search/topic-select";

export default function AddIdea({
  open,
  onClose,
  projectId,
  aiPrompt,
  takenSlugs,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  aiPrompt: string;
  takenSlugs: string[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("prompt");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const source = await file.text();
    if (!source.trim()) {
      setError("This file is empty.");
      return;
    }
    const chosen = resolvedTopic(topic, customTopic);
    if (!chosen) {
      setError("Choose a topic.");
      return;
    }
    const slug = slugFromName(file.name);
    if (takenSlugs.includes(slug)) {
      setError("An idea with this name already exists.");
      return;
    }
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/ideas`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, source, topic: chosen }),
      },
    );
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    onClose();
    onSaved();
    router.push(
      `/projects/${encodeURIComponent(projectId)}/ideas/${encodeURIComponent(slug)}`,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-rc-fg/20"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-idea-title"
        className="relative z-10 flex max-h-[min(40rem,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-rc-border bg-rc-surface shadow-[var(--rc-card-shadow)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-rc-border p-4 pb-3">
          <div className="flex flex-col gap-1">
            <h2 id="add-idea-title" className="text-lg font-semibold text-rc-fg">
              Add idea
            </h2>
            <p className="text-sm leading-relaxed text-rc-fg-muted">
              Copy one AI prompt, or upload the .md file it returns.
            </p>
          </div>
          <Button purpose="action" style="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="rc-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pt-3">
          <TabPicker
            className="w-fit self-start"
            value={mode}
            onChange={setMode}
            options={[
              { value: "prompt", label: "AI prompt" },
              { value: "upload", label: "Upload markdown" },
            ]}
          />
          {mode === "prompt" ? (
            <CopyBlock
              title="Prompt"
              body="Paste to an AI. Replace the last line with your idea. Save the reply as a .md file, then upload."
              text={aiPrompt.trim()}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <TopicSelect
                fullWidth
                value={topic}
                custom={customTopic}
                onValue={setTopic}
                onCustom={setCustomTopic}
              />
              <p className="text-sm leading-relaxed text-rc-fg-muted">
                Upload the .md file from the AI (same sections as the prompt).
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".md,text/markdown"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    void onFile(file);
                  }}
                />
                <Button
                  purpose="action"
                  style="primary"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload markdown
                </Button>
                {error ? <p className="text-sm text-rc-red">{error}</p> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
