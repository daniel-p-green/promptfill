"use client";

import { useEffect, useMemo, useState } from "react";
import { renderTemplate } from "@/lib/templateRender";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { cx } from "@/components/ui/cx";

const brand = "var(--pf-accent)";
const storageKey = "promptfill:library:v1";
const uiKey = "promptfill:ui:v1";

type VariableType = "string" | "text" | "number" | "boolean" | "enum";

type Variable = {
  name: string;
  type: VariableType;
  required: boolean;
  defaultValue: string;
  options?: string[];
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

const optionSets = [
  { name: "Tone", options: ["concise", "friendly", "direct", "formal"] },
  { name: "Audience", options: ["execs", "engineering", "sales", "customers"] },
  { name: "Format", options: ["bullets", "paragraphs", "email", "slack_update"] },
];

const defaultTemplate = `Write an email to {{recipient_name}} about {{topic}}.

Tone: {{tone}}

Context:
{{context}}

Close with a clear ask and include a short subject line.`;

const defaultPrompts = (): PromptItem[] => [
  {
    id: "prompt-email",
    name: "Write a client email",
    description: "Reusable outbound email with tone + CTA options.",
    tags: ["email", "sales"],
    template: defaultTemplate,
    variables: [
      { name: "recipient_name", type: "string", required: true, defaultValue: "Alex Chen" },
      { name: "topic", type: "string", required: true, defaultValue: "Q2 pricing update" },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: optionSets[0].options },
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
    name: "Summarize for executives",
    description: "Turn notes into crisp exec brief.",
    tags: ["summary", "exec"],
    template:
      "Summarize the following notes for {{audience}} in a {{tone}} tone. Limit to {{max_bullets}} bullets.\n\nNotes:\n{{notes}}",
    variables: [
      { name: "audience", type: "enum", required: true, defaultValue: "execs", options: optionSets[1].options },
      { name: "tone", type: "enum", required: true, defaultValue: "concise", options: optionSets[0].options },
      { name: "max_bullets", type: "number", required: false, defaultValue: "5" },
      { name: "notes", type: "text", required: true, defaultValue: "" },
    ],
    values: { audience: "execs", tone: "concise", max_bullets: 5, notes: "" },
  },
  {
    id: "prompt-rewrite",
    name: "Rewrite in friendly tone",
    description: "Make any copy warmer without losing structure.",
    tags: ["rewrite", "tone"],
    template: "Rewrite the following text to be {{tone}} while preserving meaning.\n\n{{input_text}}",
    variables: [
      { name: "tone", type: "enum", required: true, defaultValue: "friendly", options: optionSets[0].options },
      { name: "input_text", type: "text", required: true, defaultValue: "" },
    ],
    values: { tone: "friendly", input_text: "" },
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
    const options = optionSets.find((set) => set.name.toLowerCase() === lower || set.name.toLowerCase().includes(lower));
    return {
      name,
      type: "enum",
      required: true,
      defaultValue: options?.options[0] || "concise",
      options: options?.options || optionSets[0].options,
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
  description: "New prompt",
  tags: [],
  template: "Write your prompt here and add {{variables}}.",
  variables: [{ name: "variables", type: "string", required: true, defaultValue: "" }],
  values: { variables: "" },
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
  };
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-xl rounded-[24px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-6 shadow-[var(--pf-shadow-elevated)]">
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
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/30"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-auto border-l border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-6 shadow-[var(--pf-shadow-elevated)]">
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
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export default function Home() {
  const [prompts, setPrompts] = useState<PromptItem[]>(defaultPrompts);
  const [selectedId, setSelectedId] = useState<string>(defaultPrompts()[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isFillDrawerOpen, setIsFillDrawerOpen] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [variableDraft, setVariableDraft] = useState<VariableDraft>(emptyDraft);
  const [pendingImport, setPendingImport] = useState<PromptItem[] | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");
  const [activePanel, setActivePanel] = useState<"fill" | "build">("fill");

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  /* eslint-disable react-hooks/set-state-in-effect -- One-time hydration from localStorage after mount is intentional for this MVP. */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- One-time UI state hydration from localStorage after mount is intentional. */
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(uiKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { libraryCollapsed?: unknown };
      if (typeof parsed.libraryCollapsed === "boolean") setIsLibraryCollapsed(parsed.libraryCollapsed);
    } catch {
      // ignore storage errors
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- URL-based imports are intentionally handled on mount for this MVP. */
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
    window.localStorage.setItem(uiKey, JSON.stringify({ libraryCollapsed: isLibraryCollapsed }));
  }, [isLibraryCollapsed]);

  const filteredPrompts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return prompts;
    return prompts.filter((prompt) => {
      const haystack = [prompt.name, prompt.description, prompt.tags.join(" ")].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [prompts, searchQuery]);

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

  const sharePayload = useMemo(() => {
    if (!selectedPrompt) return "";
    return JSON.stringify({ prompts: [selectedPrompt] }, null, 2);
  }, [selectedPrompt]);

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

  const handleCopy = async (format: "plain" | "markdown") => {
    if (!selectedPrompt || missingRequired.length > 0) return;
    try {
      const textToCopy = format === "markdown" ? toMarkdownCodeFence(preview) : preview;
      await navigator.clipboard.writeText(textToCopy);
      setNotice(format === "markdown" ? "Copied as Markdown." : "Copied.");
    } catch {
      setNotice("Copy failed. Your browser may be blocking clipboard access.");
    }
  };

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

  const handleExtract = () => {
    if (!selectedPrompt) return;
    const { names, normalized } = extractVariableNames(selectedPrompt.template);
    const existing = new Map(selectedPrompt.variables.map((variable) => [variable.name, variable]));
    const nextVariables = names.map((name) => existing.get(name) || inferVariable(name));
    updatePrompt((prompt) => ({
      ...prompt,
      template: normalized,
      variables: nextVariables,
      values: nextVariables.reduce<Record<string, string | number | boolean>>((acc, variable) => {
        acc[variable.name] = prompt.values[variable.name] ?? variable.defaultValue ?? "";
        return acc;
      }, {}),
    }));
    setNotice(`Found ${names.length} variables. Review the list.`);
  };

  const handleAddVariable = () => {
    setVariableDraft(emptyDraft());
    setIsVariableModalOpen(true);
  };

  const handleConfirmAddVariable = () => {
    const name = normalizeName(variableDraft.name);
    if (!name) {
      setNotice("Variable name is required.");
      return;
    }
    updatePrompt((prompt) => {
      if (prompt.variables.some((variable) => variable.name === name)) {
        setNotice("Variable already exists.");
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
        options: variableDraft.type === "enum" ? (options.length ? options : optionSets[0].options) : undefined,
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
    setIsShareOpen(true);
  };

  const handleCopySharePayload = async () => {
    if (!sharePayload) return;
    try {
      await navigator.clipboard.writeText(sharePayload);
      setNotice("Copied share payload. Send it to someone and they can Import it.");
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
    setActivePanel("build");
  };

  const handleToggleLibrary = () => {
    if (!isLibraryCollapsed) setSearchQuery("");
    setIsLibraryCollapsed((value) => !value);
  };

  const handleExport = () => {
    const payload = JSON.stringify({ prompts }, null, 2);
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
        const parsed = JSON.parse(String(reader.result)) as { prompts?: PromptItem[] };
        if (!parsed.prompts?.length) {
          setNotice("Import file did not contain any prompts.");
          return;
        }
        const { merged, imported } = mergePromptLibraries(prompts, parsed.prompts);
        if (!imported.length) {
          setNotice("Nothing to import.");
          return;
        }
        setPrompts(merged);
        setSelectedId(imported[0].id);
        setActivePanel("fill");
        setNotice(`Imported ${imported.length} prompt${imported.length === 1 ? "" : "s"}.`);
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
    <div className="min-h-screen bg-[color:var(--pf-bg)] text-[color:var(--pf-text)]">
      <header className="border-b border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]">
        <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: brand }} />
            <div>
              <div className="text-sm font-semibold tracking-tight">PromptFill</div>
              <div className="text-xs text-[color:var(--pf-text-tertiary)]">
                Shareable prompts, painless customization.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[color:var(--pf-interactive-secondary-border)] bg-[color:var(--pf-interactive-secondary-bg)] px-4 py-2 text-sm font-medium text-[color:var(--pf-interactive-secondary-label)] hover:border-[color:var(--pf-interactive-secondary-border-hover)] hover:bg-[color:var(--pf-interactive-secondary-bg-hover)] hover:text-[color:var(--pf-interactive-secondary-label-hover)] active:border-[color:var(--pf-interactive-secondary-border-press)] active:bg-[color:var(--pf-interactive-secondary-bg-press)] active:text-[color:var(--pf-interactive-secondary-label-press)]">
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button variant="secondary" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-none">
        <div
          className={cx(
            "grid min-h-[calc(100vh-56px)]",
            isLibraryCollapsed
              ? "lg:grid-cols-[72px_minmax(0,1fr)]"
              : "lg:grid-cols-[320px_minmax(0,1fr)]"
          )}
        >
          <aside
            className={cx(
              "border-b border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-4 lg:border-b-0 lg:border-r",
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
            <div className={cx(isLibraryCollapsed ? "lg:hidden" : "")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[color:var(--pf-text)]">Library</div>
                  <div className="text-xs text-[color:var(--pf-text-tertiary)]">{prompts.length} prompts</div>
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
              <div className="mt-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={handleNewPrompt}
                >
                  <IconPlus className="h-4 w-4" />
                  New prompt
                </Button>
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search prompts"
                  className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] placeholder:text-[color:var(--pf-text-tertiary)] focus:outline-none"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
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
                    <div className="truncate text-sm font-semibold text-[color:var(--pf-text)]">{item.name}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-[color:var(--pf-text-tertiary)]">
                      {item.description}
                    </div>
                    {item.tags.length ? (
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
                    No prompts match that search.
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
                    onChange={(event) =>
                      updatePrompt((prompt) => ({ ...prompt, name: event.target.value }))
                    }
                    className="w-full truncate text-lg font-semibold tracking-tight text-[color:var(--pf-text)] focus:outline-none"
                  />
                  <input
                    value={selectedPrompt.description}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({ ...prompt, description: event.target.value }))
                    }
                    className="mt-1 w-full text-sm text-[color:var(--pf-text-tertiary)] focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {selectedPrompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-1 text-[color:var(--pf-text-tertiary)]"
                      >
                        {tag}
                      </span>
                    ))}
                    {showTagInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={newTagValue}
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
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={handleSharePrompt}>
                    Share
                  </Button>
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
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <SegmentedControl
                  size="sm"
                  value={activePanel}
                  onChange={setActivePanel}
                  options={[
                    { label: "Fill", value: "fill" },
                    { label: "Build", value: "build" },
                  ]}
                />

                {activePanel === "build" ? (
                  <Button type="button" size="sm" variant="primary" onClick={handleExtract}>
                    Extract variables
                  </Button>
                ) : null}
              </div>
            </div>
            </div>

            <div className="mx-auto w-full max-w-[960px] px-4 py-5 md:px-6">
              {activePanel === "fill" ? (
                <div className="space-y-4">
                  <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[color:var(--pf-text)]">Rendered prompt</div>
                        <div className="mt-1 text-xs text-[color:var(--pf-text-tertiary)]">
                          Fill variables once, then copy anywhere.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setIsFillDrawerOpen(true)}>
                          Variables ({selectedPrompt.variables.length})
                          {missingRequired.length ? (
                            <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              {missingRequired.length} required
                            </span>
                          ) : null}
	                        </Button>
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
                    {missingRequired.length > 0 ? (
                      <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600">
                        Missing required fields:{" "}
                        <span className="font-semibold">
                          {missingRequired.map((item) => item.name).join(", ")}
                        </span>
                        .{" "}
                        <button
                          className="underline underline-offset-2"
                          onClick={() => setIsFillDrawerOpen(true)}
                        >
                          Fill them
                        </button>
                        .
                      </div>
                    ) : null}
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3 text-xs leading-5 text-[color:var(--pf-text)]">
                      {preview}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] p-4">
                    <div className="text-sm font-semibold text-[color:var(--pf-text)]">Template</div>
                    <textarea
                      className="mt-3 h-[240px] w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] p-3 font-mono text-[13px] leading-6 text-[color:var(--pf-text)] focus:outline-none"
                      value={selectedPrompt.template}
                      onChange={(event) =>
                        updatePrompt((prompt) => ({ ...prompt, template: event.target.value }))
                      }
                    />
                    <div className="mt-2 text-xs text-[color:var(--pf-text-tertiary)]">
                      Tip: Use placeholders like{" "}
                      <span className="font-mono">{"{{recipient_name}}"}</span>.
                    </div>
                  </div>

	                  <div className="overflow-hidden rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)]">
	                    <div className="flex items-center justify-between border-b border-[color:var(--pf-border)] px-4 py-3">
	                      <div className="text-sm font-semibold text-[color:var(--pf-text)]">Variables</div>
	                      <Button type="button" size="sm" variant="secondary" onClick={handleAddVariable}>
	                        Add variable
	                      </Button>
	                    </div>
                    <div className="grid grid-cols-[1fr_110px_90px_1fr] gap-2 border-b border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--pf-text-tertiary)]">
                      <div>Name</div>
                      <div>Type</div>
                      <div>Req</div>
                      <div>Default</div>
                    </div>
                    {selectedPrompt.variables.map((variable) => (
                      <div
                        key={variable.name}
                        className="border-b border-[color:var(--pf-border)] last:border-b-0"
                      >
                        <div className="grid grid-cols-[1fr_110px_90px_1fr] items-center gap-2 px-4 py-3 text-sm text-[color:var(--pf-text-secondary)]">
                          <input
                            className="w-full font-mono text-[12px] text-[color:var(--pf-text)] focus:outline-none"
                            value={variable.name}
                            onChange={(event) =>
                              handleRenameVariable(variable.name, event.target.value)
                            }
                          />
                          <select
                            className="text-xs uppercase tracking-wide text-[color:var(--pf-text-tertiary)] focus:outline-none"
                            value={variable.type}
                            onChange={(event) =>
                              updatePrompt((prompt) => ({
                                ...prompt,
                                variables: prompt.variables.map((item) =>
                                  item.name === variable.name
                                    ? {
                                        ...item,
                                        type: event.target.value as VariableType,
                                        options:
                                          event.target.value === "enum"
                                            ? item.options || optionSets[0].options
                                            : item.options,
                                      }
                                    : item
                                ),
                              }))
                            }
                          >
                            {["string", "text", "number", "boolean", "enum"].map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs">
                            <input
                              type="checkbox"
                              checked={variable.required}
                              onChange={(event) =>
                                updatePrompt((prompt) => ({
                                  ...prompt,
                                  variables: prompt.variables.map((item) =>
                                    item.name === variable.name
                                      ? { ...item, required: event.target.checked }
                                      : item
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <input
                              className="w-full text-xs text-[color:var(--pf-text-tertiary)] focus:outline-none"
                              value={variable.defaultValue}
                              onChange={(event) =>
                                updatePrompt((prompt) => ({
                                  ...prompt,
                                  variables: prompt.variables.map((item) =>
                                    item.name === variable.name
                                      ? { ...item, defaultValue: event.target.value }
                                      : item
                                  ),
                                }))
                              }
                            />
                            <button
                              className="text-[10px] text-red-600"
                              onClick={() => handleDeleteVariable(variable.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {variable.type === "enum" ? (
                          <div className="px-4 pb-3 text-xs text-[color:var(--pf-text-tertiary)]">
                            <div className="mb-1 font-semibold uppercase tracking-wide text-[10px]">
                              Options
                            </div>
                            <input
                              className="w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-xs text-[color:var(--pf-text)] focus:outline-none"
                              value={(variable.options || optionSets[0].options).join(", ")}
                              onChange={(event) =>
                                updatePrompt((prompt) => ({
                                  ...prompt,
                                  variables: prompt.variables.map((item) =>
                                    item.name === variable.name
                                      ? {
                                          ...item,
                                          options: event.target.value
                                            .split(",")
                                            .map((option) => option.trim())
                                            .filter(Boolean),
                                        }
                                      : item
                                  ),
                                }))
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {notice && (
        <div className="fixed bottom-6 right-6 rounded-[16px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-4 py-3 text-sm text-[color:var(--pf-text)] shadow-[var(--pf-shadow-elevated)]">
          {notice}
        </div>
      )}

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
            <div className="mt-2 flex items-center gap-2">
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
                  <div className="text-xs text-[color:var(--pf-text-tertiary)]">...and {pendingImport.length - 5} more</div>
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
        title="Add variable"
        description="Define a new variable and how it should render in the variables drawer."
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
	              Add variable
	            </Button>
	          </div>
	        </div>
	      </Modal>

      <Drawer
        open={isFillDrawerOpen}
        title="Variables"
        description="Fill in values for this prompt."
        onClose={() => setIsFillDrawerOpen(false)}
      >
        <div className="flex items-center justify-between gap-3">
	          <div className="min-w-0">
	            <div className="truncate text-sm font-semibold text-[color:var(--pf-text)]">
	              {selectedPrompt.name}
	            </div>
            <div className="mt-1 text-xs text-[color:var(--pf-text-tertiary)]">
              {selectedPrompt.variables.length} variables
	            </div>
	          </div>
	          <Button type="button" size="sm" variant="secondary" onClick={handleResetValues}>
	            Reset
	          </Button>
	        </div>

        <div className="mt-4 space-y-3">
          {selectedPrompt.variables.map((variable) => {
            const value = selectedPrompt.values[variable.name];
            const common = {
              className:
                "mt-1 w-full rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface)] px-3 py-2 text-sm text-[color:var(--pf-text)] focus:outline-none",
            };
            if (variable.type === "text") {
              return (
                <label key={variable.name} className="block text-xs text-[color:var(--pf-text-tertiary)]">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                        required
                      </span>
                    ) : null}
                  </span>
                  <textarea
                    {...common}
                    value={String(value ?? "")}
                    className={`${common.className} min-h-28`}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({
                        ...prompt,
                        values: { ...prompt.values, [variable.name]: event.target.value },
                      }))
                    }
                  />
                </label>
              );
            }
            if (variable.type === "enum") {
              const options = variable.options || optionSets[0].options;
              const selectedValue =
                value === undefined || value === "" ? variable.defaultValue : value;
              return (
                <label key={variable.name} className="block text-xs text-[color:var(--pf-text-tertiary)]">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                        required
                      </span>
                    ) : null}
                  </span>
                  <select
                    {...common}
                    value={String(selectedValue)}
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
            if (variable.type === "boolean") {
              const boolValue =
                value === undefined ? variable.defaultValue === "true" : Boolean(value);
              return (
                <label
                  key={variable.name}
                  className="flex items-center justify-between gap-2 rounded-[12px] border border-[color:var(--pf-border)] bg-[color:var(--pf-surface-muted)] px-3 py-2 text-sm text-[color:var(--pf-text-secondary)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                        required
                      </span>
                    ) : null}
                  </span>
                  <Toggle
                    checked={boolValue}
                    aria-label={variable.name}
                    onCheckedChange={(checked) =>
                      updatePrompt((prompt) => ({
                        ...prompt,
                        values: { ...prompt.values, [variable.name]: checked },
                      }))
                    }
                  />
                </label>
              );
            }
            if (variable.type === "number") {
              return (
                <label key={variable.name} className="block text-xs text-[color:var(--pf-text-tertiary)]">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                        required
                      </span>
                    ) : null}
                  </span>
                  <input
                    {...common}
                    type="number"
                    value={String(value ?? "")}
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
            return (
              <label key={variable.name} className="block text-xs text-[color:var(--pf-text-tertiary)]">
                <span className="flex items-center gap-2">
                  <span>{variable.name}</span>
                  {variable.required ? (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--pf-text-tertiary)]">
                      required
                    </span>
                  ) : null}
                </span>
                <input
                  {...common}
                  type="text"
                  value={String(value ?? "")}
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
    </div>
  );
}
