"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { renderTemplate } from "@/lib/templateRender";
import { createExtractionProposal, type ExtractionAssistResult } from "@/lib/extractionAssist";
import { createCapturedPromptDraft } from "@/lib/capturePrompt";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { cx } from "@/components/ui/cx";

const brand = "var(--pf-accent)";
const storageKey = "promptfill:library:v1";
const uiKey = "promptfill:ui:v1";
const onboardingKey = "promptfill:onboarding:v1";
const optionSetsKey = "promptfill:option-sets:v1";

type OnboardingStepId = "library" | "fill" | "build" | "share";

type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  description: string;
  target: "library-pane" | "copy-actions" | "build-template" | "share-actions";
  panel: "fill" | "build";
};

type StarterPrompt = {
  name: string;
  description: string;
  tags: string[];
  template: string;
  variables: Variable[];
  values: Record<string, string | number | boolean>;
};

type ExtractionProposal = ExtractionAssistResult;

type VariableType = "string" | "text" | "number" | "boolean" | "enum";

type Variable = {
  name: string;
  type: VariableType;
  required: boolean;
  defaultValue: string;
  options?: string[];
  optionSetName?: string;
};

type PromptItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  template: string;
  variables: Variable[];
  values: Record<string, string | number | boolean>;
};

type VariableDraft = {
  name: string;
  type: VariableType;
  required: boolean;
  defaultValue: string;
  options: string;
};

type OptionSet = {
  name: string;
  options: string[];
};

const defaultOptionSets: OptionSet[] = [
  { name: "Tone", options: ["concise", "friendly", "direct", "formal"] },
  { name: "Audience", options: ["execs", "engineering", "sales", "customers"] },
  { name: "Format", options: ["bullets", "paragraphs", "email", "slack_update"] },
];

const onboardingSteps: OnboardingStep[] = [
  {
    id: "library",
    title: "Save your reusable prompt",
    description: "Paste one from your notes or start from a starter so you can reuse it without rewriting.",
    target: "library-pane",
    panel: "fill",
  },
  {
    id: "fill",
    title: "Fill in just the changing details",
    description: "Update the few fields that change each time, like recipient, topic, tone, or context.",
    target: "copy-actions",
    panel: "fill",
  },
  {
    id: "build",
    title: "Improve once, reuse forever",
    description: "Refine your template and field suggestions so future edits take seconds.",
    target: "build-template",
    panel: "build",
  },
  {
    id: "share",
    title: "Share the same source of truth",
    description: "Send a link or payload so everyone starts from the same high-quality prompt.",
    target: "share-actions",
    panel: "fill",
  },
];

const defaultTemplate = `Write an email to {{recipient_name}} about {{topic}}.

Tone: {{tone}}

Context:
{{context}}

Close with a clear ask and include a short subject line.`;

const defaultPrompts = (): PromptItem[] => [
  {
    id: "prompt-email",
    name: "Client follow-up email",
    description: "Turn a rough ask into a polished client email.",
    tags: ["email", "sales"],
    template: defaultTemplate,
    variables: [
      { name: "recipient_name", type: "string", required: true, defaultValue: "Alex Chen" },
      { name: "topic", type: "string", required: true, defaultValue: "Q2 pricing update" },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: defaultOptionSets[0].options, optionSetName: "Tone" },
      { name: "context", type: "text", required: false, defaultValue: "" },
      { name: "cta", type: "string", required: false, defaultValue: "Book a 15-min call" },
    ],
    values: {
      recipient_name: "Alex Chen",
      topic: "Q2 pricing update",
      tone: "concise",
      context:
        "We are rolling out updated pricing on April 15. Existing customers keep current pricing for 12 months. New customers get the new tiers.",
      cta: "Book a 15-min call",
    },
  },
  {
    id: "prompt-exec-summary",
    name: "Executive summary",
    description: "Convert raw notes into a clear leadership update.",
    tags: ["summary", "exec"],
    template:
      "Summarize the following notes for {{audience}} in a {{tone}} tone. Limit to {{max_bullets}} bullets.\n\nNotes:\n{{notes}}",
    variables: [
      { name: "audience", type: "enum", required: true, defaultValue: "execs", options: defaultOptionSets[1].options, optionSetName: "Audience" },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: defaultOptionSets[0].options, optionSetName: "Tone" },
      { name: "max_bullets", type: "number", required: false, defaultValue: "5" },
      { name: "notes", type: "text", required: true, defaultValue: "" },
    ],
    values: { audience: "execs", tone: "concise", max_bullets: 5, notes: "" },
  },
  {
    id: "prompt-rewrite",
    name: "Rewrite for tone",
    description: "Adjust voice and keep the meaning intact.",
    tags: ["rewrite", "tone"],
    template: "Rewrite the following text to be {{tone}} while preserving meaning.\n\n{{input_text}}",
    variables: [
      { name: "tone", type: "enum", required: true, defaultValue: "friendly", options: defaultOptionSets[0].options, optionSetName: "Tone" },
      { name: "input_text", type: "text", required: true, defaultValue: "" },
    ],
    values: { tone: "friendly", input_text: "" },
  },
];

const starterPrompts: StarterPrompt[] = [
  {
    name: "Email outreach",
    description: "Reusable email with tone, relationship, and CTA controls.",
    tags: ["email", "starter"],
    template:
      "Write an email to {{recipient_name}} about {{topic}}.\n\nRelationship: {{relationship}}\nTone: {{tone}}\nLength: {{length}}\n\nContext:\n{{context}}\n\nClose with a clear {{cta}}.",
    variables: [
      { name: "recipient_name", type: "string", required: true, defaultValue: "" },
      { name: "relationship", type: "enum", required: false, defaultValue: "customer", options: ["customer", "investor", "coworker", "friend"] },
      { name: "topic", type: "string", required: true, defaultValue: "" },
      { name: "context", type: "text", required: false, defaultValue: "" },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: ["concise", "friendly", "direct", "formal"] },
      { name: "length", type: "enum", required: false, defaultValue: "medium", options: ["short", "medium", "long"] },
      { name: "cta", type: "string", required: false, defaultValue: "next step" },
    ],
    values: { relationship: "customer", tone: "concise", length: "medium", cta: "next step" },
  },
  {
    name: "Rewrite with constraints",
    description: "Reshape existing text while preserving voice and constraints.",
    tags: ["rewrite", "starter"],
    template:
      "Rewrite the following text in a {{style}} style.\n\nPreserve voice: {{preserve_voice}}\nConstraints:\n{{constraints}}\n\nInput:\n{{input_text}}",
    variables: [
      { name: "input_text", type: "text", required: true, defaultValue: "" },
      { name: "style", type: "enum", required: true, defaultValue: "friendly", options: ["friendly", "crisp", "executive", "casual"] },
      { name: "constraints", type: "text", required: false, defaultValue: "" },
      { name: "preserve_voice", type: "boolean", required: false, defaultValue: "true" },
    ],
    values: { style: "friendly", preserve_voice: true, constraints: "" },
  },
  {
    name: "Audience summary",
    description: "Turn notes into audience-aware summaries.",
    tags: ["summary", "starter"],
    template:
      "Summarize the notes below for {{audience}}.\n\nTone: {{tone}}\nFormat: {{format}}\nMax bullets: {{max_bullets}}\n\nNotes:\n{{notes}}",
    variables: [
      { name: "notes", type: "text", required: true, defaultValue: "" },
      { name: "audience", type: "enum", required: true, defaultValue: "execs", options: ["execs", "engineering", "sales", "customers"] },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: ["concise", "neutral", "persuasive"] },
      { name: "format", type: "enum", required: true, defaultValue: "bullets", options: ["bullets", "paragraphs", "email", "slack_update"] },
      { name: "max_bullets", type: "number", required: false, defaultValue: "5" },
    ],
    values: { audience: "execs", tone: "concise", format: "bullets", max_bullets: 5 },
  },
  {
    name: "Support reply",
    description: "Customer support response with policy and tone guardrails.",
    tags: ["support", "starter"],
    template:
      "Draft a support response.\n\nTone: {{tone}}\n\nCustomer message:\n{{customer_message}}\n\nPolicy context:\n{{policy_context}}\n\nResolution options:\n{{resolution_options}}",
    variables: [
      { name: "customer_message", type: "text", required: true, defaultValue: "" },
      { name: "policy_context", type: "text", required: false, defaultValue: "" },
      { name: "tone", type: "enum", required: true, defaultValue: "empathetic", options: ["empathetic", "neutral", "firm"] },
      { name: "resolution_options", type: "text", required: false, defaultValue: "" },
    ],
    values: { tone: "empathetic", policy_context: "", resolution_options: "" },
  },
  {
    name: "Action items extractor",
    description: "Pull clear action items from meeting notes or transcripts.",
    tags: ["actions", "starter"],
    template:
      "Extract action items from the text below.\n\nOwner style: {{owner_style}}\nFormat: {{format}}\n\nSource text:\n{{source_text}}",
    variables: [
      { name: "source_text", type: "text", required: true, defaultValue: "" },
      { name: "owner_style", type: "enum", required: true, defaultValue: "name_if_known", options: ["name_if_known", "role_if_unknown"] },
      { name: "format", type: "enum", required: true, defaultValue: "table", options: ["table", "bullets"] },
    ],
    values: { owner_style: "name_if_known", format: "table" },
  },
  {
    name: "PRD or brief draft",
    description: "Turn rough context into a structured one-pager, brief, or PRD.",
    tags: ["strategy", "starter"],
    template:
      "Create a {{doc_type}} for {{audience}}.\n\nContext:\n{{context}}\n\nScope:\n{{scope}}\n\nConstraints:\n{{constraints}}",
    variables: [
      { name: "context", type: "text", required: true, defaultValue: "" },
      { name: "audience", type: "enum", required: true, defaultValue: "stakeholders", options: ["engineering", "leadership", "stakeholders"] },
      { name: "doc_type", type: "enum", required: true, defaultValue: "brief", options: ["prd", "brief", "one_pager"] },
      { name: "scope", type: "text", required: false, defaultValue: "" },
      { name: "constraints", type: "text", required: false, defaultValue: "" },
    ],
    values: { audience: "stakeholders", doc_type: "brief", scope: "", constraints: "" },
  },
  {
    name: "Launch copy generator",
    description: "Generate launch copy variants with a consistent voice.",
    tags: ["marketing", "starter"],
    template:
      "Write launch copy for {{product_name}}.\n\nTarget customer: {{target_customer}}\nVoice: {{voice}}\nChannels: {{channels}}\n\nKey benefits:\n{{key_benefits}}",
    variables: [
      { name: "product_name", type: "string", required: true, defaultValue: "" },
      { name: "target_customer", type: "string", required: false, defaultValue: "" },
      { name: "voice", type: "enum", required: true, defaultValue: "openai_adjacent", options: ["openai_adjacent", "playful", "bold", "minimal"] },
      { name: "channels", type: "text", required: false, defaultValue: "twitter, linkedin, email" },
      { name: "key_benefits", type: "text", required: true, defaultValue: "" },
    ],
    values: { voice: "openai_adjacent", channels: "twitter, linkedin, email" },
  },
  {
    name: "Code review prompt",
    description: "Review diffs with configurable risk and focus areas.",
    tags: ["engineering", "starter"],
    template:
      "Review the following diff.\n\nRisk profile: {{risk_profile}}\nFocus areas: {{focus_areas}}\nOutput format: {{output_format}}\n\nDiff:\n{{diff}}",
    variables: [
      { name: "diff", type: "text", required: true, defaultValue: "" },
      { name: "risk_profile", type: "enum", required: true, defaultValue: "balanced", options: ["strict", "balanced", "fast"] },
      { name: "focus_areas", type: "text", required: false, defaultValue: "security, correctness, tests" },
      { name: "output_format", type: "enum", required: true, defaultValue: "bullets", options: ["bullets", "annotated"] },
    ],
    values: { risk_profile: "balanced", focus_areas: "security, correctness, tests", output_format: "bullets" },
  },
];

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const placeholderRegex = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

const normalizeTemplate = (template: string) => {
  const sentinel = "__PROMPTFILL__";
  const captured: string[] = [];
  let counter = 0;
  const preserved = template.replace(
    /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
    (_match, name: string) => {
      const token = `${sentinel}${counter}__`;
      captured.push(name);
      counter += 1;
      return token;
    }
  );
  const normalized = preserved
    .replace(/\[([a-zA-Z0-9_.-]+)\]/g, "{{ $1 }}")
    .replace(/<([a-zA-Z0-9_.-]+)>/g, "{{ $1 }}")
    .replace(/\{([a-zA-Z0-9_.-]+)\}/g, "{{ $1 }}");
  return normalized.replace(new RegExp(`${sentinel}(\\d+)__`, "g"), (_m, index) => {
    const name = captured[Number(index)];
    return `{{${name}}}`;
  });
};

const extractVariableNames = (template: string) => {
  const names = new Set<string>();
  const normalized = normalizeTemplate(template);
  let match: RegExpExecArray | null = null;
  while ((match = placeholderRegex.exec(normalized)) !== null) {
    names.add(normalizeName(match[1]));
  }
  return { names: Array.from(names), normalized };
};

const inferVariable = (name: string): Variable => {
  const lower = name.toLowerCase();
  if (/(tone|audience|format|length|language)/.test(lower)) {
    const options = defaultOptionSets.find((set) => set.name.toLowerCase() === lower || set.name.toLowerCase().includes(lower));
    return {
      name,
      type: "enum",
      required: true,
      defaultValue: options?.options[0] || "concise",
      options: options?.options || defaultOptionSets[0].options,
      optionSetName: options?.name,
    };
  }
  if (/(notes|context|transcript|thread|body|input)/.test(lower)) {
    return { name, type: "text", required: false, defaultValue: "" };
  }
  if (/(include|exclude|is_|has_)/.test(lower)) {
    return { name, type: "boolean", required: false, defaultValue: "false" };
  }
  return { name, type: "string", required: true, defaultValue: "" };
};

const createPrompt = (name: string): PromptItem => ({
  id: `prompt-${Math.random().toString(36).slice(2, 8)}`,
  name,
  description: "Saved prompt",
  tags: [],
  template: "Paste your prompt here.",
  variables: [],
  values: {},
});

const encodeBase64Url = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const decodeBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

const toMarkdownCodeFence = (text: string) => {
  const matches = text.match(/`+/g) || [];
  const longest = matches.reduce((max, run) => Math.max(max, run.length), 0);
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}text\n${text}\n${fence}`;
};

const randomPromptId = () => `prompt-${Math.random().toString(36).slice(2, 10)}`;

const getPromptInitials = (name: string) => {
  const cleaned = name.trim();
  if (!cleaned) return "P";
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const humanizeVariableName = (name: string) => {
  const words = name
    .trim()
    .split(/_+/)
    .filter(Boolean);
  if (!words.length) return "Variable";
  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === "cta") return "CTA";
      if (lower === "id") return "ID";
      if (lower === "url") return "URL";
      if (lower === "ai") return "AI";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

const IconChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12.5 4.5L7 10l5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7.5 4.5L13 10l-5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPlus = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10 4.5v11M4.5 10h11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconSpark = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M10 2.5l1.6 4.2 4.2 1.6-4.2 1.6L10 14.1l-1.6-4.2-4.2-1.6 4.2-1.6L10 2.5zM15.3 12.9l.8 2 .9.3-.9.3-.8 2-.8-2-.9-.3.9-.3.8-2z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.8 10.6l3.2 3.2 7.2-7.2"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClose = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5.5 5.5l9 9m0-9l-9 9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const normalizeImportedType = (value: unknown): VariableType =>
  value === "string" || value === "text" || value === "number" || value === "boolean" || value === "enum"
    ? value
    : "string";

const cloneVariable = (variable: unknown): Variable => {
  const record =
    variable && typeof variable === "object"
      ? (variable as Record<string, unknown>)
      : {};
  const options = Array.isArray(record.options)
    ? record.options.filter((option) => typeof option === "string")
    : undefined;
  return {
    name: typeof record.name === "string" ? record.name : "variable",
    type: normalizeImportedType(record.type),
    required: Boolean(record.required),
    defaultValue: typeof record.defaultValue === "string" ? record.defaultValue : "",
    options,
    optionSetName: typeof record.optionSetName === "string" ? record.optionSetName : undefined,
  };
};

const cloneOptionSet = (value: unknown): OptionSet | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") return null;
  if (!Array.isArray(record.options)) return null;
  const options = record.options.filter((item): item is string => typeof item === "string");
  if (!options.length) return null;
  return { name: record.name, options };
};

const clonePrompt = (prompt: unknown): PromptItem | null => {
  if (!prompt || typeof prompt !== "object") return null;
  const record = prompt as Record<string, unknown>;
  if (typeof record.template !== "string") return null;
  const variables = Array.isArray(record.variables) ? record.variables.map(cloneVariable) : [];
  const values: Record<string, string | number | boolean> = {};
  if (record.values && typeof record.values === "object") {
    Object.entries(record.values as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        values[key] = value;
      }
    });
  }
  return {
    id: typeof record.id === "string" ? record.id : randomPromptId(),
    name: typeof record.name === "string" ? record.name : "Imported prompt",
    description: typeof record.description === "string" ? record.description : "",
    tags: Array.isArray(record.tags) ? record.tags.filter((tag) => typeof tag === "string") : [],
    template: record.template,
    variables,
    values,
  };
};

const mergePromptLibraries = (existing: PromptItem[], incoming: PromptItem[]) => {
  const existingIds = new Set(existing.map((prompt) => prompt.id));
  const existingNames = new Set(existing.map((prompt) => prompt.name));

  const imported: PromptItem[] = [];

  for (const raw of incoming) {
    const cloned = clonePrompt(raw);
    if (!cloned) continue;

    let id = cloned.id;
    while (existingIds.has(id)) id = randomPromptId();

    let name = cloned.name;
    if (existingNames.has(name)) name = `${name} (imported)`;

    existingIds.add(id);
    existingNames.add(name);

    imported.push({
      ...cloned,
      id,
      name,
      tags: [...cloned.tags],
      variables: cloned.variables.map((variable) => ({
        ...variable,
        options: variable.options ? [...variable.options] : undefined,
      })),
      values: { ...cloned.values },
    });
  }

  return {
    imported,
    merged: imported.length ? [...imported, ...existing] : existing,
  };
};

const emptyDraft = (): VariableDraft => ({
  name: "",
  type: "string",
  required: true,
  defaultValue: "",
  options: "",
});

const Modal = ({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-[24px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-6 shadow-[var(--pf-shadow-elevated)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-[color:var(--pf-text)]">{title}</div>
            {description ? (
              <div className="mt-1 text-sm text-[color:var(--pf-text-tertiary)]">{description}</div>
            ) : null}
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const Drawer = ({
  open,
  title,
  description,
  actions,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55]">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-full max-w-[620px] border-l border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] shadow-[var(--pf-shadow-elevated)]"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[color:var(--pf-border)] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-[color:var(--pf-text)]">{title}</div>
                {description ? (
                  <div className="mt-1 text-sm text-[color:var(--pf-text-tertiary)]">{description}</div>
                ) : null}
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
            {actions ? <div className="mt-3 flex items-center justify-end">{actions}</div> : null}
          </div>
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-5 py-4">{children}</div>
          {footer ? (
            <div className="border-t border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const TourCoachmark = ({
  open,
  step,
  index,
  total,
  onBack,
  onNext,
  onSkip,
}: {
  open: boolean;
  step: OnboardingStep;
  index: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) => {
  if (!open) return null;
  const isLast = index === total - 1;
  return (
    <div className="pf-fade-lift fixed bottom-4 left-1/2 z-[56] max-h-[72vh] w-[min(420px,calc(100vw-1.25rem))] -translate-x-1/2 overflow-auto rounded-[20px] border border-[color:var(--pf-border-strong)] pf-glass p-4 shadow-[var(--pf-shadow-elevated)] md:bottom-5 md:left-5 md:w-[min(420px,calc(100vw-2.5rem))] md:translate-x-0">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pf-surface-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
          <IconSpark className="h-3.5 w-3.5" />
          Guided walkthrough
        </div>
        <div className="text-xs text-[color:var(--pf-text-tertiary)]">
          Step {index + 1} / {total}
        </div>
      </div>
      <div className="mt-3 text-base font-semibold text-[color:var(--pf-text)]">{step.title}</div>
      <p className="mt-1 text-sm leading-6 text-[color:var(--pf-text-secondary)]">{step.description}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="pf-focusable rounded-full px-3 py-1.5 text-xs font-medium text-[color:var(--pf-text-tertiary)]"
        >
          Skip tutorial
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onBack} disabled={index === 0}>
            Back
          </Button>
          <Button type="button" size="sm" variant="primary" onClick={onNext}>
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [prompts, setPrompts] = useState<PromptItem[]>(defaultPrompts);
  const [selectedId, setSelectedId] = useState<string>(defaultPrompts()[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isStarterOpen, setIsStarterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingVariableDeleteName, setPendingVariableDeleteName] = useState<string | null>(null);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isExtractProposalOpen, setIsExtractProposalOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFillDrawerOpen, setIsFillDrawerOpen] = useState(false);
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [variableDraft, setVariableDraft] = useState<VariableDraft>(emptyDraft);
  const [optionSetsState, setOptionSetsState] = useState<OptionSet[]>(defaultOptionSets);
  const [optionSetDrafts, setOptionSetDrafts] = useState<OptionSet[]>(defaultOptionSets);
  const [variableNameDrafts, setVariableNameDrafts] = useState<Record<string, string>>({});
  const [extractionProposal, setExtractionProposal] = useState<ExtractionProposal | null>(null);
  const [selectedAddedVariableNames, setSelectedAddedVariableNames] = useState<string[]>([]);
  const [keepUnreferencedVariables, setKeepUnreferencedVariables] = useState(true);
  const [normalizeExtractedSyntax, setNormalizeExtractedSyntax] = useState(true);
  const [pendingImport, setPendingImport] = useState<PromptItem[] | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");
  const [activePanel, setActivePanel] = useState<"fill" | "build">("fill");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [tourComplete, setTourComplete] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(false);
  const [completedOnboardingSteps, setCompletedOnboardingSteps] = useState<OnboardingStepId[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { prompts: PromptItem[]; selectedId?: string };
      if (parsed.prompts?.length) {
        setPrompts(parsed.prompts);
        setSelectedId(parsed.selectedId || parsed.prompts[0].id);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(uiKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { libraryCollapsed?: unknown; advancedMode?: unknown };
      if (typeof parsed.libraryCollapsed === "boolean") setIsLibraryCollapsed(parsed.libraryCollapsed);
      if (typeof parsed.advancedMode === "boolean") setIsAdvancedMode(parsed.advancedMode);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(optionSetsKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { optionSets?: unknown };
      if (!Array.isArray(parsed.optionSets)) return;
      const optionSets = parsed.optionSets
        .map(cloneOptionSet)
        .filter((item): item is OptionSet => Boolean(item));
      if (!optionSets.length) return;
      setOptionSetsState(optionSets);
      setOptionSetDrafts(optionSets);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(onboardingKey) : null;
    if (!stored) {
      setShowWelcome(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as {
        complete?: unknown;
        dismissed?: unknown;
        completedSteps?: unknown;
      };
      if (typeof parsed.complete === "boolean") setTourComplete(parsed.complete);
      if (typeof parsed.dismissed === "boolean") setTourDismissed(parsed.dismissed);
      if (Array.isArray(parsed.completedSteps)) {
        const steps = parsed.completedSteps.filter((step): step is OnboardingStepId =>
          onboardingSteps.some((item) => item.id === step)
        );
        setCompletedOnboardingSteps(steps);
      }
    } catch {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("import");
    if (!encoded) return;

    // Remove the param immediately so refresh doesn't re-trigger an import.
    url.searchParams.delete("import");
    window.history.replaceState({}, "", url.toString());

    try {
      const decoded = decodeBase64Url(encoded);
      const parsed = JSON.parse(decoded) as { prompts?: PromptItem[] };
      if (!parsed.prompts?.length) {
        setNotice("Share link did not contain any prompts.");
        return;
      }
      const incoming = parsed.prompts.map(clonePrompt).filter(Boolean) as PromptItem[];
      if (!incoming.length) {
        setNotice("Share link did not contain any valid prompts.");
        return;
      }
      setPendingImport(incoming);
      setIsImportOpen(true);
    } catch {
      setNotice("Invalid share link.");
    }
  }, []);

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedId) || prompts[0] || null,
    [prompts, selectedId]
  );
  const activePromptId = selectedPrompt?.id ?? selectedId;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ prompts, selectedId: activePromptId });
    window.localStorage.setItem(storageKey, payload);
  }, [prompts, activePromptId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      uiKey,
      JSON.stringify({ libraryCollapsed: isLibraryCollapsed, advancedMode: isAdvancedMode })
    );
  }, [isLibraryCollapsed, isAdvancedMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(optionSetsKey, JSON.stringify({ optionSets: optionSetsState }));
  }, [optionSetsState]);

  useEffect(() => {
    setPrompts((items) =>
      items.map((prompt) => {
        let changed = false;
        const nextVariables = prompt.variables.map((variable) => {
          if (variable.type !== "enum" || !variable.optionSetName) return variable;
          const boundSet = optionSetsState.find((set) => set.name === variable.optionSetName);
          if (!boundSet) {
            changed = true;
            return { ...variable, optionSetName: undefined };
          }
          const sameOptions =
            variable.options?.length === boundSet.options.length &&
            variable.options.every((option, index) => option === boundSet.options[index]);
          const nextDefault = boundSet.options.includes(variable.defaultValue)
            ? variable.defaultValue
            : boundSet.options[0] || "";
          if (sameOptions && nextDefault === variable.defaultValue) return variable;
          changed = true;
          return { ...variable, options: [...boundSet.options], defaultValue: nextDefault };
        });
        if (!changed) return prompt;
        const nextValues = { ...prompt.values };
        nextVariables.forEach((variable) => {
          if (variable.type !== "enum") return;
          const current = nextValues[variable.name];
          const options = variable.options || [];
          if (!options.length) return;
          if (typeof current === "string" && options.includes(current)) return;
          if (current === undefined || current === "" || typeof current === "string") {
            nextValues[variable.name] = variable.defaultValue || options[0];
          }
        });
        return { ...prompt, variables: nextVariables, values: nextValues };
      })
    );
  }, [optionSetsState]);

  useEffect(() => {
    if (isAdvancedMode) return;
    setActiveTagFilter(null);
    setShowTagInput(false);
    setNewTagValue("");
  }, [isAdvancedMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      onboardingKey,
      JSON.stringify({
        complete: tourComplete,
        dismissed: tourDismissed,
        completedSteps: completedOnboardingSteps,
      })
    );
  }, [tourComplete, tourDismissed, completedOnboardingSteps]);

  const filteredPrompts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return prompts.filter((prompt) => {
      if (activeTagFilter && !prompt.tags.includes(activeTagFilter)) return false;
      if (!query) return true;
      const haystack = [
        prompt.name,
        prompt.description,
        prompt.tags.join(" "),
        prompt.template,
        prompt.variables.map((item) => item.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [prompts, searchQuery, activeTagFilter]);

  const preview = useMemo(() => {
    if (!selectedPrompt) return "";
    const values: Record<string, unknown> = {};
    selectedPrompt.variables.forEach((variable) => {
      const value = selectedPrompt.values[variable.name];
      if (value !== undefined && value !== "") {
        values[variable.name] = value;
      } else if (variable.defaultValue !== "") {
        values[variable.name] = variable.defaultValue;
      }
    });
    return renderTemplate(selectedPrompt.template, values);
  }, [selectedPrompt]);

  const missingRequired = useMemo(() => {
    if (!selectedPrompt) return [];
    return selectedPrompt.variables.filter((variable) => {
      if (!variable.required) return false;
      const value = selectedPrompt.values[variable.name];
      const fallback = variable.defaultValue;
      return value === undefined || value === "" ? fallback === "" : false;
    });
  }, [selectedPrompt]);

  const missingRequiredNames = useMemo(() => {
    return new Set(missingRequired.map((variable) => variable.name));
  }, [missingRequired]);

  const defaultEnumOptions = useMemo(
    () =>
      optionSetsState[0]?.options?.length
        ? optionSetsState[0].options
        : defaultOptionSets[0].options,
    [optionSetsState]
  );

  const resolveEnumOptions = useCallback(
    (variable: Variable) => {
      if (variable.optionSetName) {
        const boundSet = optionSetsState.find((set) => set.name === variable.optionSetName);
        if (boundSet?.options?.length) return boundSet.options;
      }
      if (variable.options?.length) return variable.options;
      return defaultEnumOptions;
    },
    [defaultEnumOptions, optionSetsState]
  );

  const sortedFillVariables = useMemo(() => {
    if (!selectedPrompt) return [];
    return [...selectedPrompt.variables].sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedPrompt]);

  const sharePayload = useMemo(() => {
    if (!selectedPrompt) return "";
    return JSON.stringify({ prompts: [selectedPrompt] }, null, 2);
  }, [selectedPrompt]);
  const templateVariableNames = useMemo(() => {
    if (!selectedPrompt) return [];
    return extractVariableNames(selectedPrompt.template).names;
  }, [selectedPrompt]);

  const missingSchemaVariables = useMemo(() => {
    if (!selectedPrompt) return [];
    const schemaSet = new Set(selectedPrompt.variables.map((variable) => variable.name));
    return templateVariableNames.filter((name) => !schemaSet.has(name));
  }, [selectedPrompt, templateVariableNames]);

  const unboundSchemaVariables = useMemo(() => {
    if (!selectedPrompt) return [];
    const templateSet = new Set(templateVariableNames);
    return selectedPrompt.variables.filter((variable) => !templateSet.has(variable.name));
  }, [selectedPrompt, templateVariableNames]);
  const isVariablesExpanded = isVariablesOpen || missingRequired.length > 0;
  const activeTourStep = isTourOpen ? onboardingSteps[tourStepIndex] : null;
  const activeTourTarget = activeTourStep?.target;
  const onboardingProgress = Math.round((completedOnboardingSteps.length / onboardingSteps.length) * 100);
  const isReadyToCopy = missingRequired.length === 0 && preview.trim().length > 0;
  const completedFillFields = useMemo(() => {
    if (!selectedPrompt) return 0;
    return selectedPrompt.variables.reduce((count, variable) => {
      const value = selectedPrompt.values[variable.name];
      if (value === undefined || value === null || value === "") {
        return variable.defaultValue !== "" ? count + 1 : count;
      }
      return count + 1;
    }, 0);
  }, [selectedPrompt]);
  const remainingFillFields = selectedPrompt
    ? Math.max(0, selectedPrompt.variables.length - completedFillFields)
    : 0;
  const selectedAddedVariableNameSet = useMemo(
    () => new Set(selectedAddedVariableNames),
    [selectedAddedVariableNames]
  );
  const selectedAddedVariableCount = extractionProposal
    ? extractionProposal.addedVariables.filter((variable) =>
        selectedAddedVariableNameSet.has(variable.name)
      ).length
    : 0;

  const focusFirstMissingField = useCallback(() => {
    if (missingRequired.length === 0) return;
    const firstMissingName = missingRequired[0].name;
    const selector = [
      `[data-pf-fill-fields] [name="${firstMissingName}"]`,
      `[data-pf-fill-fields] [aria-label="${firstMissingName}"]`,
    ].join(", ");
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.focus();
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [missingRequired]);

  const completeOnboardingStep = useCallback((stepId: OnboardingStepId) => {
    setCompletedOnboardingSteps((steps) => (steps.includes(stepId) ? steps : [...steps, stepId]));
  }, []);

  const applyTourStepContext = (step: OnboardingStep) => {
    setIsLibraryCollapsed(false);
    setActivePanel(step.panel);
    if (step.target === "copy-actions") setIsVariablesOpen(true);
  };

  const openTourAtStep = (stepIndex: number) => {
    const bounded = Math.max(0, Math.min(stepIndex, onboardingSteps.length - 1));
    applyTourStepContext(onboardingSteps[bounded]);
    setTourStepIndex(bounded);
    setIsTourOpen(true);
    setTourDismissed(false);
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    openTourAtStep(0);
  };

  const handleTourNext = () => {
    const step = onboardingSteps[tourStepIndex];
    completeOnboardingStep(step.id);
    if (tourStepIndex >= onboardingSteps.length - 1) {
      setTourComplete(true);
      setTourDismissed(false);
      setIsTourOpen(false);
      setNotice("Tutorial complete. You can replay it any time.");
      return;
    }
    openTourAtStep(tourStepIndex + 1);
  };

  const handleTourBack = () => {
    if (tourStepIndex === 0) return;
    openTourAtStep(tourStepIndex - 1);
  };

  const handleTourSkip = () => {
    setTourDismissed(true);
    setIsTourOpen(false);
  };

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    if (!sharePayload) return "";
    const configuredOrigin = process.env.NEXT_PUBLIC_SHARE_ORIGIN?.trim();
    const origin = configuredOrigin || window.location.origin;
    return `${origin}${window.location.pathname}?import=${encodeBase64Url(sharePayload)}`;
  }, [sharePayload]);

  const updatePrompt = (updater: (prompt: PromptItem) => PromptItem) => {
    setPrompts((items) =>
      items.map((item) => (item.id === activePromptId ? updater(item) : item))
    );
  };

  const handleCopy = useCallback(async (format: "plain" | "markdown") => {
    if (!selectedPrompt || missingRequired.length > 0) return;
    try {
      const textToCopy = format === "markdown" ? toMarkdownCodeFence(preview) : preview;
      await navigator.clipboard.writeText(textToCopy);
      completeOnboardingStep("fill");
      setNotice(format === "markdown" ? "Copied as Markdown." : "Copied.");
    } catch {
      setNotice("Copy failed. Your browser may be blocking clipboard access.");
    }
  }, [completeOnboardingStep, missingRequired.length, preview, selectedPrompt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      if (activePanel !== "fill") return;
      if (isShareOpen || isImportOpen || isDeleteOpen || isVariableModalOpen || isStarterOpen || isExtractProposalOpen || isSettingsOpen) return;
      if (missingRequired.length > 0) return;
      event.preventDefault();
      void handleCopy("plain");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activePanel,
    handleCopy,
    isShareOpen,
    isImportOpen,
    isDeleteOpen,
    isVariableModalOpen,
    isStarterOpen,
    isExtractProposalOpen,
    isSettingsOpen,
    missingRequired.length,
  ]);

  const handleResetValues = () => {
    if (!selectedPrompt) return;
    updatePrompt((prompt) => ({
      ...prompt,
      values: prompt.variables.reduce<Record<string, string | number | boolean>>((acc, variable) => {
        if (variable.type === "boolean") {
          acc[variable.name] = variable.defaultValue === "true";
          return acc;
        }
        if (variable.type === "number") {
          acc[variable.name] =
            variable.defaultValue === "" ? "" : Number(variable.defaultValue);
          return acc;
        }
        acc[variable.name] = variable.defaultValue || "";
        return acc;
      }, {}),
    }));
    setNotice("Reset values to defaults.");
  };

  const handleExtract = async () => {
    if (!selectedPrompt) return;
    setIsExtracting(true);
    try {
      const proposal = await createExtractionProposal({
        template: selectedPrompt.template,
        existingVariables: selectedPrompt.variables,
      });
      setExtractionProposal(proposal);
      setSelectedAddedVariableNames(proposal.addedVariables.map((variable) => variable.name));
      setKeepUnreferencedVariables(true);
      setNormalizeExtractedSyntax(proposal.normalizedTemplate !== selectedPrompt.template);
      setIsExtractProposalOpen(true);
    } catch {
      setNotice("Extraction assist failed. Try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtraction = () => {
    if (!selectedPrompt || !extractionProposal) return;
    const acceptedSet = new Set(selectedAddedVariableNames);
    const rejectedAdded = new Set(
      extractionProposal.addedVariables
        .map((variable) => variable.name)
        .filter((name) => !acceptedSet.has(name))
    );
    const referencedVariables = extractionProposal.referencedVariables.filter(
      (variable) => !rejectedAdded.has(variable.name)
    );
    const variables = keepUnreferencedVariables
      ? [...referencedVariables, ...extractionProposal.unreferencedVariables]
      : referencedVariables;

    const template = normalizeExtractedSyntax
      ? extractionProposal.normalizedTemplate
      : extractionProposal.currentTemplate;

    updatePrompt((prompt) => ({
      ...prompt,
      template,
      variables,
      values: variables.reduce<Record<string, string | number | boolean>>((acc, variable) => {
        acc[variable.name] = prompt.values[variable.name] ?? variable.defaultValue ?? "";
        return acc;
      }, {}),
    }));
    completeOnboardingStep("build");
    setIsExtractProposalOpen(false);
    setExtractionProposal(null);
    setSelectedAddedVariableNames([]);
    const acceptedCount = extractionProposal.addedVariables.filter((variable) =>
      acceptedSet.has(variable.name)
    ).length;
    setNotice(
      `Applied suggestions. Added ${acceptedCount} new field${acceptedCount === 1 ? "" : "s"}.`
    );
  };

  const handleAddMissingTemplateVariables = () => {
    if (!selectedPrompt || missingSchemaVariables.length === 0) return;
    updatePrompt((prompt) => {
      const existing = new Set(prompt.variables.map((variable) => variable.name));
      const additions = missingSchemaVariables
        .filter((name) => !existing.has(name))
        .map((name) => inferVariable(name));
      if (!additions.length) return prompt;
      return {
        ...prompt,
        variables: [...prompt.variables, ...additions],
        values: {
          ...prompt.values,
          ...additions.reduce<Record<string, string | number | boolean>>((acc, variable) => {
            acc[variable.name] = variable.defaultValue || "";
            return acc;
          }, {}),
        },
      };
    });
    setNotice(`Added ${missingSchemaVariables.length} field${missingSchemaVariables.length === 1 ? "" : "s"} from placeholders.`);
  };

  const handleAddVariable = () => {
    setVariableDraft(emptyDraft());
    setIsVariableModalOpen(true);
  };

  const handleConfirmAddVariable = () => {
    const name = normalizeName(variableDraft.name);
    if (!name) {
      setNotice("Field name is required.");
      return;
    }
    updatePrompt((prompt) => {
      if (prompt.variables.some((variable) => variable.name === name)) {
        setNotice("Field already exists.");
        return prompt;
      }
      const options = variableDraft.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      const next: Variable = {
        name,
        type: variableDraft.type,
        required: variableDraft.required,
        defaultValue: variableDraft.defaultValue,
        options: variableDraft.type === "enum" ? (options.length ? options : defaultEnumOptions) : undefined,
      };
      return {
        ...prompt,
        variables: [...prompt.variables, next],
        values: { ...prompt.values, [name]: next.defaultValue || "" },
      };
    });
    setIsVariableModalOpen(false);
  };

  const handleRenameVariable = (oldName: string, newNameRaw: string) => {
    const newName = normalizeName(newNameRaw);
    if (!newName || oldName === newName) return;
    updatePrompt((prompt) => {
      if (prompt.variables.some((variable) => variable.name === newName)) {
        return prompt;
      }
      const updatedTemplate = prompt.template.replace(
        new RegExp(`\\{\\{\\s*${oldName}\\s*\\}\\}`, "g"),
        `{{${newName}}}`
      );
      const updatedVariables = prompt.variables.map((variable) =>
        variable.name === oldName ? { ...variable, name: newName } : variable
      );
      const nextValues = { ...prompt.values };
      if (oldName in nextValues) {
        nextValues[newName] = nextValues[oldName];
        delete nextValues[oldName];
      }
      return { ...prompt, template: updatedTemplate, variables: updatedVariables, values: nextValues };
    });
  };

  const handleDeleteVariable = (name: string) => {
    updatePrompt((prompt) => {
      const updatedTemplate = prompt.template.replace(
        new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, "g"),
        ""
      );
      const updatedVariables = prompt.variables.filter((variable) => variable.name !== name);
      const nextValues = { ...prompt.values };
      delete nextValues[name];
      return { ...prompt, template: updatedTemplate, variables: updatedVariables, values: nextValues };
    });
  };

  const handleConfirmDeleteVariable = () => {
    if (!pendingVariableDeleteName) return;
    handleDeleteVariable(pendingVariableDeleteName);
    setPendingVariableDeleteName(null);
    setNotice(`Deleted field "${pendingVariableDeleteName}".`);
  };

  const handleDuplicate = () => {
    if (!selectedPrompt) return;
    const copy: PromptItem = {
      ...selectedPrompt,
      id: `prompt-${Math.random().toString(36).slice(2, 8)}`,
      name: `${selectedPrompt.name} (copy)`,
      values: { ...selectedPrompt.values },
      variables: selectedPrompt.variables.map((variable) => ({ ...variable })),
      tags: [...selectedPrompt.tags],
    };
    setPrompts((items) => [copy, ...items]);
    setSelectedId(copy.id);
  };

  const handleSharePrompt = async () => {
    if (!selectedPrompt) return;
    completeOnboardingStep("share");
    setIsShareOpen(true);
  };

  const handleCopySharePayload = async () => {
    if (!sharePayload) return;
    try {
      await navigator.clipboard.writeText(sharePayload);
      setNotice("Copied share package.");
    } catch {
      setNotice("Share failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setNotice("Copied share link.");
    } catch {
      setNotice("Copy link failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleAddTag = () => {
    const tag = normalizeName(newTagValue).replace(/_/g, "-");
    if (!tag) {
      setNotice("Tag name is required.");
      return;
    }
    updatePrompt((prompt) =>
      prompt.tags.includes(tag)
        ? prompt
        : { ...prompt, tags: [...prompt.tags, tag] }
    );
    setNewTagValue("");
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    updatePrompt((prompt) => ({
      ...prompt,
      tags: prompt.tags.filter((item) => item !== tag),
    }));
    if (activeTagFilter === tag) setActiveTagFilter(null);
  };

  const handleOpenSettings = () => {
    setOptionSetDrafts(optionSetsState.map((set) => ({ ...set, options: [...set.options] })));
    setIsSettingsOpen(true);
  };

  const handleAddOptionSetDraft = () => {
    const nextIndex = optionSetDrafts.length + 1;
    setOptionSetDrafts((sets) => [...sets, { name: `Option set ${nextIndex}`, options: ["option_1", "option_2"] }]);
  };

  const handleSaveOptionSets = () => {
    const renameMap = new Map<string, string>();
    optionSetDrafts.forEach((set, index) => {
      const previous = optionSetsState[index];
      const nextName = set.name.trim();
      if (!previous || !nextName || previous.name === nextName) return;
      renameMap.set(previous.name, nextName);
    });

    const sanitized = optionSetDrafts
      .map((set) => ({
        name: set.name.trim(),
        options: set.options.map((option) => option.trim()).filter(Boolean),
      }))
      .filter((set) => set.name && set.options.length);

    if (!sanitized.length) {
      setNotice("Add at least one option set with a name and options.");
      return;
    }

    const seen = new Set<string>();
    for (const set of sanitized) {
      const key = set.name.toLowerCase();
      if (seen.has(key)) {
        setNotice(`Option set "${set.name}" appears more than once.`);
        return;
      }
      seen.add(key);
    }

    setOptionSetsState(sanitized);
    if (renameMap.size) {
      setPrompts((items) =>
        items.map((prompt) => ({
          ...prompt,
          variables: prompt.variables.map((variable) =>
            variable.optionSetName && renameMap.has(variable.optionSetName)
              ? { ...variable, optionSetName: renameMap.get(variable.optionSetName) }
              : variable
          ),
        }))
      );
    }
    setIsSettingsOpen(false);
    setNotice(`Saved ${sanitized.length} reusable option set${sanitized.length === 1 ? "" : "s"}.`);
  };

  const handleDeletePrompt = () => {
    if (!selectedPrompt) return;
    const remaining = prompts.filter((item) => item.id !== selectedPrompt.id);
    if (remaining.length === 0) {
      const fresh = createPrompt("New prompt");
      setPrompts([fresh]);
      setSelectedId(fresh.id);
      return;
    }
    setPrompts(remaining);
    setSelectedId(remaining[0].id);
  };

  const handleNewPrompt = () => {
    const promptItem = createPrompt("New prompt");
    setPrompts((items) => [promptItem, ...items]);
    setSelectedId(promptItem.id);
    setActivePanel("fill");
    completeOnboardingStep("library");
  };

  const handleQuickCapture = async () => {
    if (!quickCaptureText.trim()) {
      setNotice("Paste a prompt to save it.");
      return;
    }
    setIsCapturing(true);
    try {
      const draft = await createCapturedPromptDraft(quickCaptureText);
      if (!draft) {
        setNotice("Paste a prompt to save it.");
        return;
      }
      const promptItem: PromptItem = {
        id: randomPromptId(),
        name: draft.name,
        description: draft.description,
        tags: draft.tags,
        template: draft.template,
        variables: draft.variables.map((variable) => ({
          ...variable,
          options: variable.options ? [...variable.options] : undefined,
        })),
        values: { ...draft.values },
      };
      setPrompts((items) => [promptItem, ...items]);
      setSelectedId(promptItem.id);
      setActivePanel("fill");
      setQuickCaptureText("");
      setNotice("Saved. Fill in the details, then copy.");
      completeOnboardingStep("library");
    } catch {
      setNotice("Could not save that prompt. Try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCreateStarterPrompt = (starter: StarterPrompt) => {
    const promptItem: PromptItem = {
      id: randomPromptId(),
      name: starter.name,
      description: starter.description,
      tags: [...starter.tags],
      template: starter.template,
      variables: starter.variables.map((variable) => ({
        ...variable,
        options: variable.options ? [...variable.options] : undefined,
      })),
      values: { ...starter.values },
    };
    setPrompts((items) => [promptItem, ...items]);
    setSelectedId(promptItem.id);
    setActivePanel("fill");
    setIsStarterOpen(false);
    completeOnboardingStep("library");
    setNotice(`Created starter: ${starter.name}.`);
  };

  const handleToggleLibrary = () => {
    if (!isLibraryCollapsed) setSearchQuery("");
    setIsLibraryCollapsed((value) => !value);
  };

  const handleExport = () => {
    const payload = JSON.stringify({ prompts, optionSets: optionSetsState }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promptfill-library.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (!pendingImport?.length) {
      setIsImportOpen(false);
      return;
    }
    const { merged, imported } = mergePromptLibraries(prompts, pendingImport);
    if (!imported.length) {
      setNotice("Nothing to import.");
      setIsImportOpen(false);
      setPendingImport(null);
      return;
    }
    setPrompts(merged);
    setSelectedId(imported[0].id);
    setActivePanel("fill");
    setNotice(`Imported ${imported.length} prompt${imported.length === 1 ? "" : "s"}.`);
    setIsImportOpen(false);
    setPendingImport(null);
  };

  const handleImport = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          prompts?: PromptItem[];
          optionSets?: unknown;
        };

        const importedOptionSets = Array.isArray(parsed.optionSets)
          ? parsed.optionSets
              .map(cloneOptionSet)
              .filter((item): item is OptionSet => Boolean(item))
          : [];

        if (!parsed.prompts?.length && !importedOptionSets.length) {
          setNotice("Import file did not contain any prompts or option sets.");
          return;
        }

        let importedSetCount = 0;
        if (importedOptionSets.length) {
          const existingNames = new Set(optionSetsState.map((set) => set.name.toLowerCase()));
          const additions = importedOptionSets.filter((set) => !existingNames.has(set.name.toLowerCase()));
          importedSetCount = additions.length;
          if (additions.length) setOptionSetsState((existing) => [...existing, ...additions]);
        }

        if (!parsed.prompts?.length) {
          setNotice(
            importedSetCount > 0
              ? `Imported ${importedSetCount} option set${importedSetCount === 1 ? "" : "s"}.`
              : "No new option sets to import."
          );
          return;
        }

        const { merged, imported } = mergePromptLibraries(prompts, parsed.prompts);
        setPrompts(merged);
        if (imported.length) {
          setSelectedId(imported[0].id);
          setActivePanel("fill");
        }
        const promptMessage =
          imported.length > 0
            ? `Imported ${imported.length} prompt${imported.length === 1 ? "" : "s"}`
            : "No new prompts";
        const setMessage =
          importedSetCount > 0
            ? `${importedSetCount} option set${importedSetCount === 1 ? "" : "s"}`
            : "no new option sets";
        setNotice(`${promptMessage}; ${setMessage}.`);
      } catch {
        setNotice("Import failed. Please check the JSON file.");
      }
    };
    reader.readAsText(file);
  };

  if (!selectedPrompt) {
    return <div className="min-h-screen bg-[color:var(--pf-bg)]" />;
  }

  return (
    <div className="pf-shell min-h-screen bg-[color:var(--pf-bg)] text-[color:var(--pf-text)]">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-full bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] shadow-sm focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>
      <header className="pf-glass sticky top-0 z-30 border-b border-[color:var(--pf-border)]">
        <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: brand }} />
            <div>
              <div className="text-sm font-semibold tracking-tight md:text-base">PromptFill</div>
              <div className="hidden text-xs text-[color:var(--pf-text-tertiary)] sm:block">
                Save your best prompts, then adapt and copy in seconds.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <label className="hidden items-center gap-2 rounded-full border border-[color:var(--pf-interactive-secondary-border)] bg-[color:var(--pf-interactive-secondary-bg)] px-3 py-1.5 text-xs text-[color:var(--pf-interactive-secondary-label)] md:inline-flex">
              <span>Advanced tools</span>
              <Toggle checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} aria-label="Toggle advanced controls" />
            </label>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[color:var(--pf-interactive-secondary-border)] bg-[color:var(--pf-interactive-secondary-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--pf-interactive-secondary-label)] hover:border-[color:var(--pf-interactive-secondary-border-hover)] hover:bg-[color:var(--pf-interactive-secondary-bg-hover)] hover:text-[color:var(--pf-interactive-secondary-label-hover)] active:border-[color:var(--pf-interactive-secondary-border-press)] active:bg-[color:var(--pf-interactive-secondary-bg-press)] active:text-[color:var(--pf-interactive-secondary-label-press)]">
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button size="sm" variant="secondary" onClick={handleExport}>
              Export
            </Button>
            <Button size="sm" variant="secondary" onClick={handleOpenSettings}>
              Settings
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowWelcome(false);
                openTourAtStep(0);
              }}
            >
              Tutorial
            </Button>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className={cx("mx-auto w-full max-w-none", activePanel === "fill" ? "pb-24 md:pb-0" : "")}
      >
        <div
          className={cx(
            "grid min-h-[calc(100vh-56px)]",
            isLibraryCollapsed
              ? "lg:grid-cols-[72px_minmax(0,1fr)]"
              : "lg:grid-cols-[320px_minmax(0,1fr)]"
          )}
        >
          <aside
            data-pf-video="library"
            className={cx(
              "border-b border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3 md:p-4 lg:border-b-0 lg:border-r",
              isLibraryCollapsed ? "lg:p-2" : ""
            )}
          >
            {/* Collapsed rail (desktop only). */}
            <div
              className={cx(
                "hidden flex-col items-center gap-2",
                isLibraryCollapsed ? "lg:flex" : "lg:hidden"
              )}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 w-9 justify-center p-0"
                aria-label="Expand library"
                onClick={handleToggleLibrary}
              >
                <IconChevronRight className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="h-9 w-9 justify-center p-0"
                aria-label="New prompt"
                onClick={handleNewPrompt}
              >
                <IconPlus className="h-5 w-5" />
              </Button>
              <div className="my-3 h-px w-full bg-[color:var(--pf-border)]" />
              <div className="flex flex-col items-center gap-2">
                {filteredPrompts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.name}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition",
                      item.id === activePromptId
                        ? "border-[color:rgba(13,13,13,0.2)] bg-[color:var(--pf-surface-muted)] text-[color:var(--pf-text)]"
                        : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] text-[color:var(--pf-text-tertiary)] hover:bg-[color:var(--pf-surface-muted)]"
                    )}
                    onClick={() => setSelectedId(item.id)}
                  >
                    {getPromptInitials(item.name)}
                  </button>
                ))}
              </div>
            </div>

            {/* Full sidebar (always on mobile, optional on desktop). */}
            <div
              data-pf-video="library-pane"
              data-pf-onboarding-target="library-pane"
              className={cx(
                isLibraryCollapsed ? "lg:hidden" : "",
                activeTourTarget === "library-pane" ? "pf-tour-focus rounded-[16px] p-2" : ""
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[color:var(--pf-text)]">Prompt library</div>
                  <div className="text-sm text-[color:var(--pf-text-tertiary)]">{prompts.length} saved prompt{prompts.length === 1 ? "" : "s"}</div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="hidden h-9 w-9 justify-center p-0 lg:inline-flex"
                  aria-label="Collapse library"
                  onClick={handleToggleLibrary}
                >
                  <IconChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
                <div className="text-sm font-semibold text-[color:var(--pf-text)]">Paste from Apple Notes</div>
                <div className="mt-1 text-sm leading-6 text-[color:var(--pf-text-secondary)]">
                  Paste any prompt draft. We save it and suggest reusable fill-in fields automatically.
                </div>
                <textarea
                  className="mt-2 min-h-[104px] w-full resize-y rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2.5 text-sm leading-6 text-[color:var(--pf-text)] placeholder:text-[color:var(--pf-text-tertiary)] focus:outline-none"
                  name="quick_capture"
                  autoComplete="off"
                  placeholder="Example: Write an email to Alex about Q2 pricing update."
                  aria-label="Paste a prompt from notes"
                  value={quickCaptureText}
                  onChange={(event) => setQuickCaptureText(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className="mt-2 w-full justify-center"
                  onClick={handleQuickCapture}
                  disabled={isCapturing}
                >
                  {isCapturing ? "Saving…" : "Save to library"}
                </Button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={handleNewPrompt}
                >
                  <IconPlus className="h-4 w-4" />
                  Start from scratch
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={() => setIsStarterOpen(true)}
                >
                  <IconSpark className="h-4 w-4" />
                  Use a starter
                </Button>
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  name="prompt_search"
                  autoComplete="off"
                  placeholder="Search saved prompts"
                  aria-label="Search saved prompts"
                  className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] placeholder:text-[color:var(--pf-text-tertiary)] focus:outline-none"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              {isAdvancedMode && activeTagFilter ? (
                <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-2.5 py-1.5 text-xs">
                  <span className="text-[color:var(--pf-text-secondary)]">
                    Filter: <span className="font-semibold">{activeTagFilter}</span>
                  </span>
                  <button
                    type="button"
                    className="pf-focusable inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[color:var(--pf-text-tertiary)]"
                    onClick={() => setActiveTagFilter(null)}
                  >
                    <IconClose className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              ) : null}
              <div className="mt-4 space-y-2">
                {filteredPrompts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cx(
                      "w-full rounded-[12px] border px-3 py-3 text-left transition hover:bg-[color:var(--pf-surface-muted)]",
                      item.id === activePromptId
                        ? "border-[color:rgba(13,13,13,0.2)] bg-[color:var(--pf-surface-muted)]"
                        : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]"
                    )}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="truncate text-sm font-semibold leading-5 text-[color:var(--pf-text)]">{item.name}</div>
                    <div className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--pf-text-secondary)]">
                      {item.description}
                    </div>
                    {isAdvancedMode && item.tags.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[color:var(--pf-surface-muted)] px-2 py-[2px] text-[10px] text-[color:var(--pf-text-tertiary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                ))}
                {filteredPrompts.length === 0 ? (
                  <div className="rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-3 text-xs text-[color:var(--pf-text-tertiary)]">
                    No prompts match your filters.
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <section className="bg-[color:var(--pf-surface)]">
            <div className="border-b border-[color:var(--pf-border)]">
              <div className="mx-auto w-full max-w-[960px] px-4 py-5 md:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <input
                      value={selectedPrompt.name}
                      name="prompt_name"
                      autoComplete="off"
                      onChange={(event) =>
                        updatePrompt((prompt) => ({ ...prompt, name: event.target.value }))
                      }
                      aria-label="Prompt name"
                      className="w-full truncate text-lg font-semibold tracking-tight text-[color:var(--pf-text)] focus:outline-none md:text-xl"
                    />
                    <input
                      value={selectedPrompt.description}
                      name="prompt_description"
                      autoComplete="off"
                      onChange={(event) =>
                        updatePrompt((prompt) => ({ ...prompt, description: event.target.value }))
                      }
                      aria-label="Prompt description"
                      className="mt-1 w-full text-sm leading-6 text-[color:var(--pf-text-secondary)] focus:outline-none"
                    />
                    {isAdvancedMode ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {selectedPrompt.tags.map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-2 py-1 text-[color:var(--pf-text-tertiary)]"
                          >
                            <button
                              type="button"
                              className="pf-focusable rounded-full px-1 py-0.5"
                              onClick={() => setActiveTagFilter(tag)}
                            >
                              {tag}
                            </button>
                            <button
                              type="button"
                              className="pf-focusable inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/5"
                              onClick={() => handleRemoveTag(tag)}
                              aria-label={`Remove tag ${tag}`}
                            >
                              <IconClose className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {showTagInput ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={newTagValue}
                              name="new_tag"
                              autoComplete="off"
                              onChange={(event) => setNewTagValue(event.target.value)}
                              placeholder="tag-name"
                              className="rounded-full border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-1 text-xs text-[color:var(--pf-text)] placeholder:text-[color:var(--pf-text-tertiary)] focus:outline-none"
                            />
                            <Button type="button" size="sm" variant="secondary" onClick={handleAddTag}>
                              Add
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setNewTagValue("");
                                setShowTagInput(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="border-dashed text-[color:var(--pf-text-tertiary)]"
                            onClick={() => setShowTagInput(true)}
                          >
                            + tag
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div
                    data-pf-onboarding-target="share-actions"
                    className={cx(
                      "flex shrink-0 items-center gap-2",
                      activeTourTarget === "share-actions" ? "pf-tour-focus rounded-full px-2 py-1" : ""
                    )}
                  >
                    <Button type="button" size="sm" variant="secondary" onClick={handleSharePrompt}>
                      Share
                    </Button>
                    {isAdvancedMode ? (
                      <>
                        <Button type="button" size="sm" variant="secondary" onClick={handleDuplicate}>
                          Duplicate
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="dangerSecondary"
                          onClick={() => setIsDeleteOpen(true)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <SegmentedControl
                  size="sm"
                  value={activePanel}
                  onChange={setActivePanel}
                  ariaLabel="Prompt mode"
                  options={[
                    { label: "Use prompt", value: "fill" },
                    { label: "Edit prompt", value: "build" },
                  ]}
                />

                {activePanel === "build" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleExtract}
                    disabled={isExtracting}
                  >
                    {isExtracting ? "Finding fields…" : "Suggest fields (AI)"}
                  </Button>
                ) : null}
              </div>

                {!isAdvancedMode ? (
                  <div className="mt-4 rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4">
                    <div className="text-sm font-semibold text-[color:var(--pf-text)]">Simple loop: save, fill, copy</div>
                    <div className="mt-1 text-sm leading-6 text-[color:var(--pf-text-secondary)]">
                      PromptFill keeps one reusable version, so you stop rewriting the same prompt every time.
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                          1. Save
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-[color:var(--pf-text)]">Keep one reusable prompt</div>
                      </div>
                      <div className="rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                          2. Fill
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-[color:var(--pf-text)]">Update just what changes</div>
                        <div className="mt-0.5 text-xs text-[color:var(--pf-text-tertiary)]">
                          {missingRequired.length > 0
                            ? `${missingRequired.length} required field${missingRequired.length === 1 ? "" : "s"} left`
                            : "All required fields complete"}
                        </div>
                      </div>
                      <div className="rounded-[10px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                          3. Copy
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-[color:var(--pf-text)]">Paste into ChatGPT or anywhere</div>
                        <div className="mt-0.5 text-xs text-[color:var(--pf-text-tertiary)]">
                          {isReadyToCopy ? "Ready to copy now" : "Finish step 2 first"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

              {isAdvancedMode ? (
                <div className="mt-4 rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--pf-text)]">
                        <IconSpark className="h-4 w-4" />
                        Onboarding
                      </div>
                      <div className="mt-1 text-xs text-[color:var(--pf-text-tertiary)]">
                        {tourComplete
                          ? "Tutorial complete. Replay it any time for a quick refresher."
                          : "Follow this guided setup to get productive in under two minutes."}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                        Progress
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[color:var(--pf-text)]">{onboardingProgress}%</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--pf-segmented-bg)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--pf-accent)] transition-[width] duration-300"
                      style={{ width: `${onboardingProgress}%` }}
                    />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {onboardingSteps.map((step) => {
                      const complete = completedOnboardingSteps.includes(step.id);
                      return (
                        <div
                          key={step.id}
                          className={cx(
                            "flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs",
                            complete
                              ? "border-[color:color-mix(in_srgb,var(--pf-accent)_36%,transparent)] bg-[color:color-mix(in_srgb,var(--pf-accent)_14%,transparent)] text-[color:var(--pf-text)]"
                              : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] text-[color:var(--pf-text-secondary)]"
                          )}
                        >
                          <span
                            className={cx(
                              "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                              complete
                                ? "border-[color:var(--pf-accent)] bg-[color:var(--pf-accent)] text-white"
                                : "border-[color:var(--pf-border)] bg-transparent text-transparent"
                            )}
                          >
                            <IconCheck className="h-3 w-3" />
                          </span>
                          <span>{step.title}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setTourDismissed(true)}>
                      Dismiss
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setShowWelcome(false);
                        openTourAtStep(0);
                      }}
                    >
                      {tourComplete ? "Replay tutorial" : "Start tutorial"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--pf-text)]">Need a quick walkthrough?</div>
                    <div className="mt-1 text-sm text-[color:var(--pf-text-tertiary)]">
                      Learn the core loop in under 90 seconds.
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowWelcome(false);
                      openTourAtStep(0);
                    }}
                  >
                    Start tour
                  </Button>
                </div>
              )}
            </div>
            </div>

            <div className="mx-auto w-full max-w-[960px] px-4 py-5 md:px-6">
              {activePanel === "fill" ? (
                <div className="space-y-4">
                  <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[color:var(--pf-text)]">Ready-to-copy prompt</div>
                        <div className="mt-1 text-sm leading-6 text-[color:var(--pf-text-secondary)]">
                          {remainingFillFields > 0
                            ? `${remainingFillFields} field${remainingFillFields === 1 ? "" : "s"} left before copy`
                            : "All fields complete. Copy and paste it anywhere."}
                        </div>
                        <div className="mt-1 text-[11px] text-[color:var(--pf-text-tertiary)]">
                          {completedFillFields}/{selectedPrompt.variables.length} fields complete
                        </div>
                      </div>
                      <div
                        data-pf-video="copy-actions"
                        data-pf-onboarding-target="copy-actions"
                        className={cx(
                          "flex flex-wrap items-center gap-2",
                          activeTourTarget === "copy-actions" ? "pf-tour-focus rounded-[12px] p-2" : ""
                        )}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => handleCopy("plain")}
                          disabled={missingRequired.length > 0}
                        >
                          Copy prompt
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-expanded={isVariablesExpanded}
                          onClick={() => setIsVariablesOpen((open) => !open)}
                        >
                          {isVariablesExpanded ? "Hide fields" : "Edit fields"} ({selectedPrompt.variables.length})
                          {missingRequired.length ? (
                            <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              {missingRequired.length} required
                            </span>
                          ) : null}
                        </Button>
                        {isAdvancedMode ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCopy("markdown")}
                              disabled={missingRequired.length > 0}
                            >
                              Copy Markdown
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => setIsFillDrawerOpen(true)}>
                              Quick fill panel
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
                      Shortcut: <span className="font-mono">Ctrl/Cmd + Enter</span> copies your prompt.
                    </div>
                    {isVariablesExpanded ? (
                      <div
                        data-pf-video="variables-fields"
                        data-pf-fill-fields
                        className="mt-3 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[color:var(--pf-text)]">
                            Fill-in fields
                          </div>
                          <Button type="button" size="sm" variant="secondary" onClick={handleResetValues}>
                            Reset fields
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {sortedFillVariables.map((variable) => {
                            const value = selectedPrompt.values[variable.name];
                            const isMissing = missingRequiredNames.has(variable.name);
                            const label = (
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="truncate">
                                  {humanizeVariableName(variable.name)}
                                  {variable.required ? (
                                    <span className="ml-1 text-red-600">*</span>
                                  ) : null}
                                </span>
                                <span className="truncate font-mono text-[10px] font-normal text-[color:var(--pf-text-tertiary)]">
                                  {"{{"}
                                  {variable.name}
                                  {"}}"}
                                </span>
                              </span>
                            );

                            const fieldClass = cx(
                              "mt-1 w-full rounded-[12px] border px-3 py-2 text-sm leading-6 text-[color:var(--pf-text)] focus:outline-none",
                              isMissing ? "border-red-500/40 bg-red-500/5" : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]"
                            );

                            if (variable.type === "boolean") {
                              const checked =
                                value === undefined ? variable.defaultValue === "true" : Boolean(value);
                              return (
                                <div
                                  key={variable.name}
                                  className={cx(
                                    "flex items-center justify-between gap-3 rounded-[12px] border px-3 py-2 sm:col-span-2",
                                    isMissing ? "border-red-500/40 bg-red-500/5" : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]"
                                  )}
                                >
                                  <div className="min-w-0 text-xs font-semibold text-[color:var(--pf-text)]">
                                    {label}
                                  </div>
                                  <Toggle
                                    checked={checked}
                                    aria-label={variable.name}
                                    className="shrink-0"
                                    onCheckedChange={(nextChecked) =>
                                      updatePrompt((prompt) => ({
                                        ...prompt,
                                        values: { ...prompt.values, [variable.name]: nextChecked },
                                      }))
                                    }
                                  />
                                </div>
                              );
                            }

                            if (variable.type === "text") {
                              const resolved =
                                value === undefined || value === "" ? variable.defaultValue : String(value);
                              return (
                                <label key={variable.name} className="block sm:col-span-2">
                                  <span className="text-xs font-semibold text-[color:var(--pf-text)]">
                                    {label}
                                  </span>
                                  <textarea
                                    className={cx(fieldClass, "min-h-24 resize-y")}
                                    name={variable.name}
                                    value={resolved}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => ({
                                        ...prompt,
                                        values: { ...prompt.values, [variable.name]: event.target.value },
                                      }))
                                    }
                                    placeholder="Type here…"
                                  />
                                </label>
                              );
                            }

                            if (variable.type === "enum") {
                              const options = resolveEnumOptions(variable);
                              const resolved =
                                value === undefined || value === "" ? variable.defaultValue : String(value);
                              const selectedValue = options.includes(resolved) ? resolved : options[0] || "";
                              return (
                                <label key={variable.name} className="block">
                                  <span className="text-xs font-semibold text-[color:var(--pf-text)]">
                                    {label}
                                  </span>
                                  <select
                                    className={fieldClass}
                                    name={variable.name}
                                    value={selectedValue}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => ({
                                        ...prompt,
                                        values: { ...prompt.values, [variable.name]: event.target.value },
                                      }))
                                    }
                                  >
                                    {options.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              );
                            }

                            if (variable.type === "number") {
                              const resolved =
                                value === undefined || value === "" ? variable.defaultValue : value;
                              return (
                                <label key={variable.name} className="block">
                                  <span className="text-xs font-semibold text-[color:var(--pf-text)]">
                                    {label}
                                  </span>
                                  <input
                                    className={fieldClass}
                                    type="number"
                                    name={variable.name}
                                    value={String(resolved ?? "")}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => ({
                                        ...prompt,
                                        values: {
                                          ...prompt.values,
                                          [variable.name]:
                                            event.target.value === "" ? "" : Number(event.target.value),
                                        },
                                      }))
                                    }
                                  />
                                </label>
                              );
                            }

                            const resolved =
                              value === undefined || value === "" ? variable.defaultValue : String(value);
                            return (
                              <label key={variable.name} className="block">
                                <span className="text-xs font-semibold text-[color:var(--pf-text)]">
                                  {label}
                                </span>
                                <input
                                  className={fieldClass}
                                  type="text"
                                  name={variable.name}
                                  value={resolved}
                                  onChange={(event) =>
                                    updatePrompt((prompt) => ({
                                      ...prompt,
                                      values: { ...prompt.values, [variable.name]: event.target.value },
                                    }))
                                  }
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {missingRequired.length > 0 ? (
                      <div
                        role="status"
                        aria-live="polite"
                        className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600"
                      >
                        Please fill these required fields:{" "}
                        <span className="font-semibold">
                          {missingRequired.map((item) => humanizeVariableName(item.name)).join(", ")}
                        </span>
                        .{" "}
                        <button
                          className="underline underline-offset-2"
                          onClick={() => {
                            setIsVariablesOpen(true);
                            window.setTimeout(() => focusFirstMissingField(), 0);
                          }}
                        >
                          Fill them
                        </button>
                        .
                      </div>
                    ) : null}
                    <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                      Preview (what gets copied)
                    </div>
                    <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-4 text-sm leading-7 text-[color:var(--pf-text)]">
                      {preview}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    data-pf-onboarding-target="build-template"
                    className={cx(
                      "rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4",
                      activeTourTarget === "build-template" ? "pf-tour-focus" : ""
                    )}
                  >
                    <div className="text-sm font-semibold text-[color:var(--pf-text)]">Template</div>
                    <textarea
                      className="mt-3 h-[240px] w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3 font-mono text-[13px] leading-6 text-[color:var(--pf-text)] focus:outline-none"
                      name="template_editor"
                      autoComplete="off"
                      value={selectedPrompt.template}
                      onChange={(event) =>
                        updatePrompt((prompt) => ({ ...prompt, template: event.target.value }))
                      }
                    />
                    <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
                      Tip: Use placeholders like{" "}
                      <span className="font-mono">{"{{recipient_name}}"}</span>.
                    </div>
                    {isAdvancedMode ? (
                      <div className="mt-3 space-y-2 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                            Detected placeholders ({templateVariableNames.length})
                          </div>
                          {missingSchemaVariables.length > 0 ? (
                            <Button type="button" size="sm" variant="secondary" onClick={handleAddMissingTemplateVariables}>
                              Add missing vars
                            </Button>
                          ) : null}
                        </div>
                        {templateVariableNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {templateVariableNames.map((name) => (
                              <span
                                key={name}
                                className={cx(
                                  "rounded-full border px-2 py-[2px] font-mono text-[10px]",
                                  missingSchemaVariables.includes(name)
                                    ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                                    : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] text-[color:var(--pf-text-tertiary)]"
                                )}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-[color:var(--pf-text-tertiary)]">
                            No placeholders detected yet.
                          </div>
                        )}
                        {unboundSchemaVariables.length > 0 ? (
                          <div className="text-[11px] text-[color:var(--pf-text-tertiary)]">
                            Unused schema variables:{" "}
                            <span className="font-mono">
                              {unboundSchemaVariables.map((item) => item.name).join(", ")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-xs text-[color:var(--pf-text-tertiary)]">
                        Tip: Keep it simple. Add placeholders only for parts you change often, like{" "}
                        <span className="font-mono">{"{{recipient_name}}"}</span> or{" "}
                        <span className="font-mono">{"{{topic}}"}</span>.
                      </div>
                    )}
                  </div>

                  {isAdvancedMode ? (
                    <div className="overflow-hidden rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]">
                      <div className="flex items-center justify-between border-b border-[color:var(--pf-border)] px-4 py-3">
                        <div className="text-sm font-semibold text-[color:var(--pf-text)]">Variables</div>
                        <Button type="button" size="sm" variant="secondary" onClick={handleAddVariable}>
                          Add field
                        </Button>
                      </div>
                    <div className="space-y-3 p-4">
                      {selectedPrompt.variables.length ? (
                        selectedPrompt.variables.map((variable) => {
                          const nameDraft = variableNameDrafts[variable.name] ?? variable.name;
                          const normalizedDraft = normalizeName(nameDraft);
                          const enumOptions = resolveEnumOptions(variable);
                          const enumDefault = enumOptions.includes(variable.defaultValue)
                            ? variable.defaultValue
                            : enumOptions[0] || "";

                          const commitRename = () => {
                            const trimmed = nameDraft.trim();
                            if (!trimmed) {
                              setVariableNameDrafts((drafts) => {
                                const next = { ...drafts };
                                delete next[variable.name];
                                return next;
                              });
                              return;
                            }
                            if (!normalizedDraft || normalizedDraft === variable.name) {
                              setVariableNameDrafts((drafts) => {
                                const next = { ...drafts };
                                delete next[variable.name];
                                return next;
                              });
                              return;
                            }
                            if (selectedPrompt.variables.some((item) => item.name === normalizedDraft)) {
                              setNotice("Field already exists.");
                              return;
                            }
                            handleRenameVariable(variable.name, normalizedDraft);
                            setVariableNameDrafts((drafts) => {
                              const next = { ...drafts };
                              delete next[variable.name];
                              return next;
                            });
                          };

                          const requiredDot = variable.required ? (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-[color:var(--pf-accent)]"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-transparent" aria-hidden="true" />
                          );

                          return (
                            <div
                              key={variable.name}
                              className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    {requiredDot}
                                    <div className="truncate text-sm font-semibold text-[color:var(--pf-text)]">
                                      {humanizeVariableName(variable.name)}
                                    </div>
                                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                                      {variable.type}
                                    </span>
                                  </div>
                                  <div className="mt-1 truncate font-mono text-[11px] text-[color:var(--pf-text-tertiary)]">
                                    {"{{"}
                                    {variable.name}
                                    {"}}"}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="dangerSecondary"
                                  onClick={() => setPendingVariableDeleteName(variable.name)}
                                >
                                  Delete
                                </Button>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
                                  Name
                                  <input
                                    className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 font-mono text-[12px] text-[color:var(--pf-text)] focus:outline-none"
                                    value={nameDraft}
                                    onChange={(event) =>
                                      setVariableNameDrafts((drafts) => ({
                                        ...drafts,
                                        [variable.name]: event.target.value,
                                      }))
                                    }
                                    onBlur={commitRename}
                                    onKeyDown={(event) => {
                                      if (event.key !== "Enter") return;
                                      event.preventDefault();
                                      event.currentTarget.blur();
                                    }}
                                  />
                                  {normalizedDraft && normalizedDraft !== variable.name ? (
                                    <div className="mt-1 text-[11px] text-[color:var(--pf-text-tertiary)]">
                                      Saves as{" "}
                                      <span className="font-mono text-[color:var(--pf-text-secondary)]">
                                        {normalizedDraft}
                                      </span>
                                      .
                                    </div>
                                  ) : null}
                                </label>

                                <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
                                  Type
                                  <select
                                    className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    value={variable.type}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => {
                                        const nextType = event.target.value as VariableType;
                                        return {
                                          ...prompt,
                                          variables: prompt.variables.map((item) => {
                                            if (item.name !== variable.name) return item;
                                            if (nextType !== "enum") {
                                              return {
                                                ...item,
                                                type: nextType,
                                                options: undefined,
                                                optionSetName: undefined,
                                              };
                                            }
                                            const fallbackOptions =
                                              optionSetsState[0]?.options?.length
                                                ? optionSetsState[0].options
                                                : defaultEnumOptions;
                                            const nextOptions = item.options?.length ? item.options : fallbackOptions;
                                            const nextDefault = nextOptions.includes(item.defaultValue)
                                              ? item.defaultValue
                                              : nextOptions[0] || "";
                                            return {
                                              ...item,
                                              type: nextType,
                                              options: nextOptions,
                                              defaultValue: nextDefault,
                                            };
                                          }),
                                        };
                                      })
                                    }
                                  >
                                    {["string", "text", "number", "boolean", "enum"].map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2">
                                <div className="text-xs text-[color:var(--pf-text-tertiary)]">Required</div>
                                <Toggle
                                  checked={variable.required}
                                  aria-label={`Required: ${variable.name}`}
                                  onCheckedChange={(checked) =>
                                    updatePrompt((prompt) => ({
                                      ...prompt,
                                      variables: prompt.variables.map((item) =>
                                        item.name === variable.name ? { ...item, required: checked } : item
                                      ),
                                    }))
                                  }
                                />
                              </div>

                              <div className="mt-3 space-y-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                                  Default
                                </div>

                                {variable.type === "boolean" ? (
                                  <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2">
                                    <div className="text-xs text-[color:var(--pf-text-tertiary)]">False / True</div>
                                    <Toggle
                                      checked={variable.defaultValue === "true"}
                                      aria-label={`Default: ${variable.name}`}
                                      onCheckedChange={(checked) =>
                                        updatePrompt((prompt) => {
                                          const current = prompt.values[variable.name];
                                          const oldDefault = variable.defaultValue === "true";
                                          const shouldUpdateValue =
                                            current === undefined || current === "" || Boolean(current) === oldDefault;
                                          return {
                                            ...prompt,
                                            variables: prompt.variables.map((item) =>
                                              item.name === variable.name
                                                ? { ...item, defaultValue: checked ? "true" : "false" }
                                                : item
                                            ),
                                            values: shouldUpdateValue
                                              ? { ...prompt.values, [variable.name]: checked }
                                              : prompt.values,
                                          };
                                        })
                                      }
                                    />
                                  </div>
                                ) : variable.type === "enum" ? (
                                  <select
                                    className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    value={enumDefault}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => {
                                        const current = prompt.values[variable.name];
                                        const shouldUpdateValue =
                                          current === undefined ||
                                          current === "" ||
                                          String(current) === variable.defaultValue;
                                        return {
                                          ...prompt,
                                          variables: prompt.variables.map((item) =>
                                            item.name === variable.name
                                              ? { ...item, defaultValue: event.target.value }
                                              : item
                                          ),
                                          values: shouldUpdateValue
                                            ? { ...prompt.values, [variable.name]: event.target.value }
                                            : prompt.values,
                                        };
                                      })
                                    }
                                  >
                                    {enumOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : variable.type === "number" ? (
                                  <input
                                    className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    type="number"
                                    value={variable.defaultValue}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => {
                                        const current = prompt.values[variable.name];
                                        const oldDefault =
                                          variable.defaultValue === "" ? null : Number(variable.defaultValue);
                                        const currentNum =
                                          current === undefined || current === ""
                                            ? null
                                            : typeof current === "number"
                                              ? current
                                              : Number(current);
                                        const shouldUpdateValue =
                                          current === undefined ||
                                          current === "" ||
                                          (oldDefault !== null && currentNum === oldDefault);
                                        return {
                                          ...prompt,
                                          variables: prompt.variables.map((item) =>
                                            item.name === variable.name
                                              ? { ...item, defaultValue: event.target.value }
                                              : item
                                          ),
                                          values: shouldUpdateValue
                                            ? {
                                                ...prompt.values,
                                                [variable.name]:
                                                  event.target.value === "" ? "" : Number(event.target.value),
                                              }
                                            : prompt.values,
                                        };
                                      })
                                    }
                                  />
                                ) : (
                                  <input
                                    className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    value={variable.defaultValue}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => {
                                        const current = prompt.values[variable.name];
                                        const shouldUpdateValue =
                                          current === undefined ||
                                          current === "" ||
                                          String(current) === variable.defaultValue;
                                        return {
                                          ...prompt,
                                          variables: prompt.variables.map((item) =>
                                            item.name === variable.name
                                              ? { ...item, defaultValue: event.target.value }
                                              : item
                                          ),
                                          values: shouldUpdateValue
                                            ? { ...prompt.values, [variable.name]: event.target.value }
                                            : prompt.values,
                                        };
                                      })
                                    }
                                  />
                                )}
                              </div>

                              {variable.type === "enum" ? (
                                <div className="mt-3 space-y-2">
                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                                    Option set
                                  </div>
                                  <select
                                    className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    value={variable.optionSetName ?? ""}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => {
                                        const selectedSetName = event.target.value;
                                        const selectedSet = optionSetsState.find((set) => set.name === selectedSetName);
                                        return {
                                          ...prompt,
                                          variables: prompt.variables.map((item) => {
                                            if (item.name !== variable.name) return item;
                                            if (!selectedSetName || !selectedSet) {
                                              return { ...item, optionSetName: undefined };
                                            }
                                            const nextDefault = selectedSet.options.includes(item.defaultValue)
                                              ? item.defaultValue
                                              : selectedSet.options[0] || "";
                                            return {
                                              ...item,
                                              optionSetName: selectedSetName,
                                              options: [...selectedSet.options],
                                              defaultValue: nextDefault,
                                            };
                                          }),
                                        };
                                      })
                                    }
                                  >
                                    <option value="">Custom options</option>
                                    {optionSetsState.map((set) => (
                                      <option key={set.name} value={set.name}>
                                        {set.name}
                                      </option>
                                    ))}
                                  </select>

                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                                    Options
                                  </div>
                                  <input
                                    className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                                    value={enumOptions.join(", ")}
                                    disabled={Boolean(variable.optionSetName)}
                                    onChange={(event) =>
                                      updatePrompt((prompt) => ({
                                        ...prompt,
                                        variables: prompt.variables.map((item) =>
                                          item.name === variable.name
                                            ? {
                                                ...item,
                                                optionSetName: undefined,
                                                options: event.target.value
                                                  .split(",")
                                                  .map((option) => option.trim())
                                                  .filter(Boolean),
                                              }
                                            : item
                                        ),
                                      }))
                                    }
                                    placeholder="concise, friendly, direct"
                                  />
                                  {variable.optionSetName ? (
                                    <div className="text-xs text-[color:var(--pf-text-tertiary)]">
                                      This field is bound to <span className="font-medium">{variable.optionSetName}</span>. Edit that set in Settings.
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[16px] border border-dashed border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-4 py-3 text-xs text-[color:var(--pf-text-tertiary)]">
                          No fields yet. Use Suggest fields (AI) or Add field.
                        </div>
                      )}
                    </div>
                    </div>
                  ) : (
                    <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-4 py-3 text-sm text-[color:var(--pf-text-secondary)]">
                      Keep this simple: write your reusable prompt first, then click{" "}
                      <span className="font-medium text-[color:var(--pf-text)]">Suggest fields (AI)</span> when you
                      want help turning changing parts into fill-in fields.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {activePanel === "fill" && !isTourOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--pf-border)] bg-[color:color-mix(in_srgb,var(--pf-surface)_96%,transparent)] backdrop-blur md:hidden">
          <div className="mx-auto flex w-full max-w-[960px] items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[color:var(--pf-text)]">
                {missingRequired.length > 0
                  ? `${missingRequired.length} required field${missingRequired.length === 1 ? "" : "s"} left`
                  : "Ready to copy"}
              </div>
              <div className="truncate text-xs text-[color:var(--pf-text-tertiary)]">
                {missingRequired.length > 0
                  ? "Open fields and complete the required details."
                  : "Copies the exact preview text."}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="shrink-0"
              onClick={() => {
                if (missingRequired.length > 0) {
                  setIsVariablesOpen(true);
                  window.setTimeout(() => focusFirstMissingField(), 0);
                  return;
                }
                void handleCopy("plain");
              }}
            >
              {missingRequired.length > 0 ? "Fill required" : "Copy prompt"}
            </Button>
          </div>
        </div>
      ) : null}

      <TourCoachmark
        open={isTourOpen}
        step={activeTourStep ?? onboardingSteps[0]}
        index={tourStepIndex}
        total={onboardingSteps.length}
        onBack={handleTourBack}
        onNext={handleTourNext}
        onSkip={handleTourSkip}
      />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[60] w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-4 py-3 text-sm text-[color:var(--pf-text)] shadow-[var(--pf-shadow-elevated)] md:bottom-6 md:left-auto md:right-6 md:w-auto md:-translate-x-0"
        >
          {notice}
        </div>
      )}

      <Modal
        open={showWelcome && !tourDismissed && !tourComplete}
        title="Welcome to PromptFill"
        description="Want a quick 90-second walkthrough?"
        onClose={() => {
          setShowWelcome(false);
          setTourDismissed(true);
        }}
      >
        <div className="space-y-4">
          <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3 text-sm text-[color:var(--pf-text-secondary)]">
            We will show you the core loop: save one reusable prompt, fill changing details, and copy in seconds.
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowWelcome(false);
                setTourDismissed(true);
              }}
            >
              Not now
            </Button>
            <Button type="button" size="sm" variant="primary" onClick={handleStartTour}>
              Start tutorial
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isStarterOpen}
        title="Starter examples"
        description="Pick a ready-to-use prompt and tailor it for your situation."
        onClose={() => setIsStarterOpen(false)}
      >
        <div className="space-y-3">
          {starterPrompts.map((starter) => (
            <div
              key={starter.name}
              className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[color:var(--pf-text)]">{starter.name}</div>
                  <div className="mt-1 text-xs text-[color:var(--pf-text-tertiary)]">{starter.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {starter.tags.map((tag) => (
                      <span
                        key={`${starter.name}-${tag}`}
                        className="rounded-full border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-2 py-[2px] text-[10px] text-[color:var(--pf-text-tertiary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Button type="button" size="sm" variant="primary" onClick={() => handleCreateStarterPrompt(starter)}>
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={isSettingsOpen}
        title="Reusable option sets"
        description="Create shared dropdown options once, then bind them to enum fields."
        onClose={() => setIsSettingsOpen(false)}
      >
        <div className="space-y-3">
          {optionSetDrafts.map((set, index) => (
            <div
              key={`${set.name}-${index}`}
              className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
                  Name
                  <input
                    value={set.name}
                    onChange={(event) =>
                      setOptionSetDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                    placeholder="Tone"
                  />
                </label>
                <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
                  Options (comma-separated)
                  <input
                    value={set.options.join(", ")}
                    onChange={(event) =>
                      setOptionSetDrafts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                options: event.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean),
                              }
                            : item
                        )
                      )
                    }
                    className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                    placeholder="concise, friendly, direct"
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="dangerSecondary"
                    onClick={() =>
                      setOptionSetDrafts((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                    disabled={optionSetDrafts.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={handleAddOptionSetDraft}>
              Add option set
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" variant="primary" onClick={handleSaveOptionSets}>
                Save sets
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isExtractProposalOpen}
        title="Review AI suggestions"
        description="We found reusable fill-in fields. Nothing changes until you confirm."
        onClose={() => {
          setIsExtractProposalOpen(false);
          setExtractionProposal(null);
          setSelectedAddedVariableNames([]);
        }}
      >
        {extractionProposal ? (
          <div className="space-y-4">
            <div className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3 text-sm text-[color:var(--pf-text-secondary)]">
              Found{" "}
              <span className="font-semibold text-[color:var(--pf-text)]">
                {extractionProposal.detectedNames.length}
              </span>{" "}
              fill-in field{extractionProposal.detectedNames.length === 1 ? "" : "s"}.{" "}
              <span className="font-semibold text-[color:var(--pf-text)]">
                {extractionProposal.addedVariables.length}
              </span>{" "}
              suggested new field{extractionProposal.addedVariables.length === 1 ? "" : "s"}.{" "}
              <span className="font-semibold text-[color:var(--pf-text)]">
                {selectedAddedVariableCount}
              </span>{" "}
              currently selected to apply, and your existing fields stay safe unless you change them.
              {isAdvancedMode ? (
                <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
                  Generated by: {extractionProposal.source}
                </div>
              ) : null}
            </div>

            {extractionProposal.inferenceNotes.length ? (
              <div className="rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                  Suggestion notes
                </div>
                <ul className="mt-2 space-y-1 text-xs text-[color:var(--pf-text-secondary)]">
                  {extractionProposal.inferenceNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                    Suggested new fields
                  </div>
                  {extractionProposal.addedVariables.length ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="pf-focusable text-[11px] font-medium text-[color:var(--pf-text-secondary)]"
                        onClick={() =>
                          setSelectedAddedVariableNames(
                            extractionProposal.addedVariables.map((variable) => variable.name)
                          )
                        }
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        className="pf-focusable text-[11px] font-medium text-[color:var(--pf-text-secondary)]"
                        onClick={() => setSelectedAddedVariableNames([])}
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                </div>
                {extractionProposal.addedVariables.length ? (
                  <div className="mt-2 space-y-2">
                    {extractionProposal.addedVariables.map((variable) => {
                      const selected = selectedAddedVariableNameSet.has(variable.name);
                      return (
                        <label
                          key={variable.name}
                          className={cx(
                            "flex items-center justify-between gap-3 rounded-[10px] border px-2.5 py-2 text-xs",
                            selected
                              ? "border-emerald-500/30 bg-emerald-500/10 text-[color:var(--pf-text)]"
                              : "border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] text-[color:var(--pf-text-secondary)]"
                          )}
                        >
                          <span className="min-w-0">
                            <span className="font-mono">{variable.name}</span>
                            <span className="ml-2 text-[color:var(--pf-text-tertiary)]">{variable.type}</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) =>
                              setSelectedAddedVariableNames((current) =>
                                event.target.checked
                                  ? [...new Set([...current, variable.name])]
                                  : current.filter((name) => name !== variable.name)
                              )
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">No new variables.</div>
                )}
              </div>

              <div className="rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                  Not used in current prompt
                </div>
                {extractionProposal.unreferencedVariables.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {extractionProposal.unreferencedVariables.map((variable) => (
                      <span
                        key={variable.name}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-[2px] font-mono text-[10px] text-amber-700"
                      >
                        {variable.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">All existing variables are referenced.</div>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3">
              <label className="flex items-center gap-2 text-sm text-[color:var(--pf-text-secondary)]">
                <input
                  type="checkbox"
                  checked={keepUnreferencedVariables}
                  onChange={(event) => setKeepUnreferencedVariables(event.target.checked)}
                />
                Keep fields that are not currently used (recommended).
              </label>
              <label className="flex items-center gap-2 text-sm text-[color:var(--pf-text-secondary)]">
                <input
                  type="checkbox"
                  checked={normalizeExtractedSyntax}
                  onChange={(event) => setNormalizeExtractedSyntax(event.target.checked)}
                />
                Format placeholders as <span className="font-mono text-xs">{"{{snake_case}}"}</span>.
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsExtractProposalOpen(false);
                  setExtractionProposal(null);
                  setSelectedAddedVariableNames([]);
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" variant="primary" onClick={handleApplyExtraction}>
                Apply changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isShareOpen}
        title="Share this prompt"
        description="Copy a link or payload. Recipients can import it into PromptFill."
        onClose={() => setIsShareOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
              Share link
            </div>
            <div data-pf-video="share-link-row" className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-xs text-[color:var(--pf-text)] focus:outline-none"
              />
              <Button type="button" size="sm" variant="primary" onClick={handleCopyShareLink}>
                Copy
              </Button>
            </div>
            <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
              Best for small prompts. Very long templates may not fit in a URL.
            </div>
          </div>

          <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                Share payload
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={handleCopySharePayload}>
                Copy payload
              </Button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3 text-xs text-[color:var(--pf-text)]">
              {sharePayload}
            </pre>
            <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
              Includes template, variables, and defaults.
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isImportOpen}
        title="Import shared prompt"
        description="Review what you're importing before it is added to your library."
        onClose={() => {
          setIsImportOpen(false);
          setPendingImport(null);
        }}
      >
        <div className="space-y-3">
          <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-3 text-sm text-[color:var(--pf-text)]">
            {pendingImport?.length ? (
              <div className="space-y-1">
                {pendingImport.slice(0, 5).map((prompt) => (
                  <div key={prompt.id} className="truncate">
                    {prompt.name}
                  </div>
                ))}
                {pendingImport.length > 5 ? (
                  <div className="text-xs text-[color:var(--pf-text-tertiary)]">…and {pendingImport.length - 5} more</div>
                ) : null}
              </div>
            ) : (
              <div className="text-xs text-[color:var(--pf-text-tertiary)]">No prompts found.</div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsImportOpen(false);
                setPendingImport(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleConfirmImport}
              disabled={!pendingImport?.length}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isVariableModalOpen}
        title="Add field"
        description="Add a fill-in field and choose how it appears."
        onClose={() => setIsVariableModalOpen(false)}
      >
        <div className="space-y-3">
          <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
            Name
            <input
              value={variableDraft.name}
              onChange={(event) =>
                setVariableDraft((draft) => ({ ...draft, name: event.target.value }))
              }
              className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
              placeholder="e.g. recipient_name"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
              Type
              <select
                value={variableDraft.type}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    type: event.target.value as VariableType,
                  }))
                }
                className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
              >
                {["string", "text", "number", "boolean", "enum"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
              Default
              <input
                value={variableDraft.defaultValue}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    defaultValue: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs text-[color:var(--pf-text-tertiary)]">
            <input
              type="checkbox"
              checked={variableDraft.required}
              onChange={(event) =>
                setVariableDraft((draft) => ({
                  ...draft,
                  required: event.target.checked,
                }))
              }
            />
            Required field
          </label>
          {variableDraft.type === "enum" && (
            <label className="block text-xs text-[color:var(--pf-text-tertiary)]">
              Options (comma-separated)
              <input
                value={variableDraft.options}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    options: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none"
                placeholder="concise, friendly, direct"
              />
            </label>
	          )}
	          <div className="flex justify-end gap-2">
	            <Button type="button" size="sm" variant="secondary" onClick={() => setIsVariableModalOpen(false)}>
	              Cancel
	            </Button>
	            <Button type="button" size="sm" variant="primary" onClick={handleConfirmAddVariable}>
	              Add field
	            </Button>
	          </div>
	        </div>
      </Modal>

      <Drawer
        open={isFillDrawerOpen}
        title={selectedPrompt.name}
        description={`Fill ${selectedPrompt.variables.length} variable${
          selectedPrompt.variables.length === 1 ? "" : "s"
        }, then copy.`}
        actions={
          <Button type="button" size="sm" variant="secondary" onClick={handleResetValues}>
            Reset
          </Button>
        }
        footer={
          <div className="flex flex-col gap-3">
            {missingRequired.length ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600">
                Missing required:{" "}
                <span className="font-semibold">
                  {missingRequired.map((item) => humanizeVariableName(item.name)).join(", ")}
                </span>
                .
              </div>
            ) : (
              <div className="text-xs text-[color:var(--pf-text-tertiary)]">Ready to copy.</div>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleCopy("plain")}
                disabled={missingRequired.length > 0}
              >
                Copy
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleCopy("markdown")}
                disabled={missingRequired.length > 0}
              >
                Copy Markdown
              </Button>
            </div>
          </div>
        }
        onClose={() => setIsFillDrawerOpen(false)}
      >
        <div data-pf-video="drawer-fields" className="space-y-2">
          {sortedFillVariables.map((variable) => {
            const value = selectedPrompt.values[variable.name];
            const fieldLabelText = humanizeVariableName(variable.name);
            const commonClassName =
              "w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none";
            const header = (
              <div className="flex min-w-0 items-center gap-2">
                {variable.required ? (
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-red-500" aria-hidden="true" />
                ) : (
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-transparent" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[color:var(--pf-text)]">
                    {fieldLabelText}
                  </div>
                  <div className="truncate font-mono text-[11px] text-[color:var(--pf-text-tertiary)]">
                    {"{{"}
                    {variable.name}
                    {"}}"}
                  </div>
                </div>
              </div>
            );
            if (variable.type === "enum") {
              const options = resolveEnumOptions(variable);
              const resolved = String(value ?? variable.defaultValue ?? "");
              const selectedValue = options.includes(resolved) ? resolved : options[0] || "";
              return (
                <div
                  key={variable.name}
                  className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    {header}
                    <div className="w-[210px] flex-none">
                      <select
                        className={commonClassName}
                        name={variable.name}
                        autoComplete="off"
                        aria-label={`Fill ${fieldLabelText}`}
                        value={selectedValue}
                        onChange={(event) =>
                          updatePrompt((prompt) => ({
                            ...prompt,
                            values: { ...prompt.values, [variable.name]: event.target.value },
                          }))
                        }
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            }
            if (variable.type === "boolean") {
              const boolValue =
                value === undefined ? variable.defaultValue === "true" : Boolean(value);
              return (
                <div
                  key={variable.name}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2"
                >
                  {header}
                  <Toggle
                    checked={boolValue}
                    aria-label={`Fill ${fieldLabelText}`}
                    onCheckedChange={(checked) =>
                      updatePrompt((prompt) => ({
                        ...prompt,
                        values: { ...prompt.values, [variable.name]: checked },
                      }))
                    }
                  />
                </div>
              );
            }
            if (variable.type === "number") {
              const resolved = value ?? variable.defaultValue ?? "";
              return (
                <div
                  key={variable.name}
                  className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    {header}
                    <div className="w-[210px] flex-none">
                      <input
                        className={commonClassName}
                        type="number"
                        name={variable.name}
                        autoComplete="off"
                        aria-label={`Fill ${fieldLabelText}`}
                        value={String(resolved)}
                        onChange={(event) =>
                          updatePrompt((prompt) => ({
                            ...prompt,
                            values: {
                              ...prompt.values,
                              [variable.name]:
                                event.target.value === "" ? "" : Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            }
            if (variable.type === "text") {
              const resolved = String(value ?? variable.defaultValue ?? "");
              return (
                <div
                  key={variable.name}
                  className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2"
                >
                  {header}
                  <textarea
                    className={cx(commonClassName, "mt-2 min-h-[92px] resize-y")}
                    name={variable.name}
                    autoComplete="off"
                    aria-label={`Fill ${fieldLabelText}`}
                    value={resolved}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({
                        ...prompt,
                        values: { ...prompt.values, [variable.name]: event.target.value },
                      }))
                    }
                    placeholder="Type here…"
                  />
                </div>
              );
            }
            const resolved = String(value ?? variable.defaultValue ?? "");
            return (
              <div
                key={variable.name}
                className="rounded-[14px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  {header}
                  <div className="w-[210px] flex-none">
                    <input
                      className={commonClassName}
                      type="text"
                      name={variable.name}
                      autoComplete="off"
                      aria-label={`Fill ${fieldLabelText}`}
                      value={resolved}
                      onChange={(event) =>
                        updatePrompt((prompt) => ({
                          ...prompt,
                          values: { ...prompt.values, [variable.name]: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>

      <Modal
        open={isDeleteOpen}
        title="Delete prompt"
        description="This will permanently remove the prompt from your library."
        onClose={() => setIsDeleteOpen(false)}
      >
        <div className="flex items-center justify-between gap-3">
	          <div className="text-sm text-[color:var(--pf-text-secondary)]">
	            Are you sure you want to delete {selectedPrompt.name}?
	          </div>
	          <div className="flex items-center gap-2">
	            <Button type="button" size="sm" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
	              Cancel
	            </Button>
	            <Button
	              type="button"
	              size="sm"
	              variant="danger"
	              onClick={() => {
	                handleDeletePrompt();
	                setIsDeleteOpen(false);
	              }}
	            >
	              Delete
	            </Button>
	          </div>
	        </div>
	      </Modal>

      <Modal
        open={Boolean(pendingVariableDeleteName)}
        title="Delete field"
        description="This removes the field and its related values from this prompt."
        onClose={() => setPendingVariableDeleteName(null)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[color:var(--pf-text-secondary)]">
            Are you sure you want to delete{" "}
            <span className="font-mono text-[color:var(--pf-text)]">
              {pendingVariableDeleteName ?? ""}
            </span>
            ?
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setPendingVariableDeleteName(null)}>
              Cancel
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={handleConfirmDeleteVariable}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
