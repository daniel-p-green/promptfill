"use client";

import { useEffect, useMemo, useState } from "react";
import { renderTemplate } from "@/lib/templateRender";

const brand = "var(--pf-accent)";
const storageKey = "promptfill:library:v1";

type Variable = {
  name: string;
  required: boolean;
  defaultValue: string;
};

type PromptItem = {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: Variable[];
  values: Record<string, string | number | boolean>;
};

export default function InlineCard() {
  const [prompt, setPrompt] = useState<PromptItem | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");

  /* eslint-disable react-hooks/set-state-in-effect -- One-time hydration from localStorage after mount is intentional for this inline view. */
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { prompts?: PromptItem[]; selectedId?: string };
      const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];
      const selected = parsed.selectedId
        ? prompts.find((item) => item.id === parsed.selectedId) || null
        : prompts[0] || null;
      setPrompt(selected);
    } catch {
      // ignore
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const preview = useMemo(() => {
    if (!prompt) return "";
    const values: Record<string, unknown> = {};
    prompt.variables.forEach((variable) => {
      const value = prompt.values?.[variable.name];
      if (value !== undefined && value !== "") {
        values[variable.name] = value;
      } else if (variable.defaultValue !== "") {
        values[variable.name] = variable.defaultValue;
      }
    });
    return renderTemplate(prompt.template, values);
  }, [prompt]);

  const missingRequired = useMemo(() => {
    if (!prompt) return [];
    return prompt.variables.filter((variable) => {
      if (!variable.required) return false;
      const value = prompt.values?.[variable.name];
      const fallback = variable.defaultValue;
      return value === undefined || value === "" ? fallback === "" : false;
    });
  }, [prompt]);

  const previewLines = useMemo(() => {
    if (!preview) return [];
    return preview.split("\n");
  }, [preview]);

  const handleCopy = async () => {
    if (!prompt || missingRequired.length) return;
    try {
      await navigator.clipboard.writeText(preview);
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1400);
    }
  };

  const handleOpen = () => {
    // Use the persisted selection; the main app hydrates from localStorage.
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[color:var(--pf-bg)] p-6 text-[color:var(--pf-text)]">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: brand }} />
                <div className="truncate text-sm font-semibold">
                  {prompt?.name || "PromptFill"}
                </div>
              </div>
              <div className="mt-1 text-xs text-[color:var(--pf-text-tertiary)]">
                {prompt?.description || "Prompt as a form — render once, reuse anywhere."}
              </div>
            </div>
            <button
              className="rounded-full border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--pf-text)] hover:bg-[color:rgba(13,13,13,0.05)]"
              onClick={handleOpen}
            >
              Expand
            </button>
          </div>

          {missingRequired.length ? (
            <div className="mt-4 rounded-[12px] border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600">
              Missing required fields:{" "}
              <span className="font-semibold">{missingRequired.map((v) => v.name).join(", ")}</span>
              . Use Expand to fill them.
            </div>
          ) : null}

          <div className="mt-4 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
              Rendered prompt
            </div>
            <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-5 text-[color:var(--pf-text)]">
              {previewLines.slice(0, 10).join("\n")}
              {previewLines.length > 10 ? "\n…" : ""}
            </pre>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--pf-text)] hover:bg-[color:rgba(13,13,13,0.05)]"
              onClick={handleOpen}
            >
              Open
            </button>
            <button
              className="rounded-[10px] bg-[#0d0d0d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d0d0dcc] active:bg-[#0d0d0de5] disabled:opacity-40"
              onClick={handleCopy}
              disabled={!prompt || missingRequired.length > 0}
            >
              {copyState === "success" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy"}
            </button>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-[color:var(--pf-text-tertiary)]">
          This page mimics the inline-card feel of a ChatGPT app (single-purpose, two actions).{" "}
          Open the fullscreen builder to edit variables.
        </div>
      </div>
    </div>
  );
}
