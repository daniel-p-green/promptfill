"use client";

import { useEffect, useMemo, useState } from "react";
import { renderTemplate } from "@/lib/templateRender";

const accent = "#10a37f";
const storageKey = "promptfill:library:v1";

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

const randomPromptId = () => `prompt-${Math.random().toString(36).slice(2, 10)}`;

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
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-zinc-900">{title}</div>
            {description ? <div className="mt-1 text-sm text-zinc-500">{description}</div> : null}
          </div>
          <button
            className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-500"
            onClick={onClose}
          >
            Close
          </button>
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
      <div className="absolute right-0 top-0 h-full w-full max-w-[440px] overflow-auto border-l border-black/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-zinc-900">{title}</div>
            {description ? <div className="mt-1 text-sm text-zinc-500">{description}</div> : null}
          </div>
          <button
            className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-500"
            onClick={onClose}
          >
            Close
          </button>
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
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isFillDrawerOpen, setIsFillDrawerOpen] = useState(false);
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
    return `${window.location.origin}${window.location.pathname}?import=${encodeBase64Url(sharePayload)}`;
  }, [sharePayload]);

  const updatePrompt = (updater: (prompt: PromptItem) => PromptItem) => {
    setPrompts((items) =>
      items.map((item) => (item.id === activePromptId ? updater(item) : item))
    );
  };

  const handleCopy = async () => {
    if (!selectedPrompt || missingRequired.length > 0) return;
    try {
      await navigator.clipboard.writeText(preview);
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1600);
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
    return <div className="min-h-screen bg-[#f7f7f8]" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-900">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
            <div>
              <div className="text-sm font-semibold tracking-tight">PromptFill</div>
              <div className="text-xs text-zinc-500">
                Shareable prompts, painless customization.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
              />
            </label>
            <button
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white"
              style={{ background: accent }}
              onClick={handleNewPrompt}
            >
              New
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-800">Library</div>
              <div className="text-xs text-zinc-500">{prompts.length} prompts</div>
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search prompts"
                className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm focus:outline-none"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="mt-4 space-y-2">
              {filteredPrompts.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 transition hover:bg-[#fafafa] ${
                    item.id === activePromptId
                      ? "border-black/20 bg-[#fafafa]"
                      : "border-black/10 bg-white"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedId(item.id);
                  }}
                >
                  <div className="truncate text-sm font-semibold text-zinc-900">{item.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{item.description}</div>
                  {item.tags.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#fafafa] px-2 py-[2px] text-[10px] text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="border-b border-black/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    value={selectedPrompt.name}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({ ...prompt, name: event.target.value }))
                    }
                    className="w-full truncate text-xl font-semibold tracking-tight text-zinc-900 focus:outline-none"
                  />
                  <input
                    value={selectedPrompt.description}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({ ...prompt, description: event.target.value }))
                    }
                    className="mt-1 w-full text-sm text-zinc-500 focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {selectedPrompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/10 bg-white px-3 py-1 text-zinc-500"
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
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-zinc-600 focus:outline-none"
                        />
                        <button
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-zinc-600"
                          onClick={handleAddTag}
                        >
                          Add
                        </button>
                        <button
                          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-zinc-500"
                          onClick={() => {
                            setNewTagValue("");
                            setShowTagInput(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="rounded-full border border-dashed border-black/10 bg-white px-3 py-1 text-zinc-500"
                        onClick={() => setShowTagInput(true)}
                      >
                        + tag
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold"
                    onClick={handleSharePrompt}
                  >
                    Share
                  </button>
                  <button
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold"
                    onClick={handleDuplicate}
                  >
                    Duplicate
                  </button>
                  <button
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-red-500"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex rounded-xl border border-black/10 bg-[#fafafa] p-1 text-xs font-semibold text-zinc-600">
                  <button
                    className={`rounded-lg px-3 py-1.5 ${
                      activePanel === "fill" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"
                    }`}
                    onClick={() => setActivePanel("fill")}
                  >
                    Fill
                  </button>
                  <button
                    className={`rounded-lg px-3 py-1.5 ${
                      activePanel === "build" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"
                    }`}
                    onClick={() => setActivePanel("build")}
                  >
                    Build
                  </button>
                </div>

                {activePanel === "build" ? (
                  <button
                    className="rounded-xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: accent }}
                    onClick={handleExtract}
                  >
                    Extract variables
                  </button>
                ) : null}
              </div>
            </div>

            <div className="p-5">
              {activePanel === "fill" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-800">Rendered prompt</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Fill variables once, then copy anywhere.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                          onClick={() => setIsFillDrawerOpen(true)}
                        >
                          Variables ({selectedPrompt.variables.length})
                          {missingRequired.length ? (
                            <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              {missingRequired.length} required
                            </span>
                          ) : null}
                        </button>
                        <button
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          style={{ background: accent }}
                          onClick={handleCopy}
                          disabled={missingRequired.length > 0}
                        >
                          {copyState === "success"
                            ? "Copied"
                            : copyState === "error"
                              ? "Copy failed"
                              : "Copy"}
                        </button>
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
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-black/10 bg-white p-3 text-xs leading-5 text-zinc-800">
                      {preview}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-4">
                    <div className="text-sm font-semibold text-zinc-800">Template</div>
                    <textarea
                      className="mt-3 h-[240px] w-full rounded-xl border border-black/10 bg-white p-3 font-mono text-[13px] leading-6 text-zinc-800 focus:outline-none"
                      value={selectedPrompt.template}
                      onChange={(event) =>
                        updatePrompt((prompt) => ({ ...prompt, template: event.target.value }))
                      }
                    />
                    <div className="mt-2 text-xs text-zinc-500">
                      Tip: Use placeholders like{" "}
                      <span className="font-mono">{"{{recipient_name}}"}</span>.
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                      <div className="text-sm font-semibold text-zinc-800">Variables</div>
                      <button
                        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                        onClick={handleAddVariable}
                      >
                        Add variable
                      </button>
                    </div>
                    <div className="grid grid-cols-[1fr_110px_90px_1fr] gap-2 border-b border-black/10 bg-[#fafafa] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      <div>Name</div>
                      <div>Type</div>
                      <div>Req</div>
                      <div>Default</div>
                    </div>
                    {selectedPrompt.variables.map((variable) => (
                      <div key={variable.name} className="border-b border-black/5 last:border-b-0">
                        <div className="grid grid-cols-[1fr_110px_90px_1fr] items-center gap-2 px-4 py-3 text-sm text-zinc-700">
                          <input
                            className="w-full font-mono text-[12px] text-zinc-800 focus:outline-none"
                            value={variable.name}
                            onChange={(event) =>
                              handleRenameVariable(variable.name, event.target.value)
                            }
                          />
                          <select
                            className="text-xs uppercase tracking-wide text-zinc-500 focus:outline-none"
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
                              className="w-full text-xs text-zinc-500 focus:outline-none"
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
                              className="text-[10px] text-red-500"
                              onClick={() => handleDeleteVariable(variable.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {variable.type === "enum" ? (
                          <div className="px-4 pb-3 text-xs text-zinc-500">
                            <div className="mb-1 font-semibold uppercase tracking-wide text-[10px]">
                              Options
                            </div>
                            <input
                              className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-xs text-zinc-600 focus:outline-none"
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
        <div className="fixed bottom-6 right-6 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-lg">
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
          <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Share link
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-zinc-700 focus:outline-none"
              />
              <button
                className="rounded-xl px-3 py-2 text-xs font-semibold text-white"
                style={{ background: accent }}
                onClick={handleCopyShareLink}
              >
                Copy
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Best for small prompts. Very long templates may not fit in a URL.
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Share payload
              </div>
              <button
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                onClick={handleCopySharePayload}
              >
                Copy payload
              </button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto rounded-xl border border-black/10 bg-white p-3 text-xs text-zinc-700">
              {sharePayload}
            </pre>
            <div className="mt-2 text-xs text-zinc-500">
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
          <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-3 text-sm text-zinc-700">
            {pendingImport?.length ? (
              <div className="space-y-1">
                {pendingImport.slice(0, 5).map((prompt) => (
                  <div key={prompt.id} className="truncate">
                    {prompt.name}
                  </div>
                ))}
                {pendingImport.length > 5 ? (
                  <div className="text-xs text-zinc-500">...and {pendingImport.length - 5} more</div>
                ) : null}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">No prompts found.</div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-600"
              onClick={() => {
                setIsImportOpen(false);
                setPendingImport(null);
              }}
            >
              Cancel
            </button>
            <button
              className="rounded-full px-4 py-2 text-xs font-semibold text-white"
              style={{ background: accent }}
              onClick={handleConfirmImport}
              disabled={!pendingImport?.length}
            >
              Import
            </button>
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
          <label className="block text-xs text-zinc-500">
            Name
            <input
              value={variableDraft.name}
              onChange={(event) =>
                setVariableDraft((draft) => ({ ...draft, name: event.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
              placeholder="e.g. recipient_name"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-zinc-500">
              Type
              <select
                value={variableDraft.type}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    type: event.target.value as VariableType,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
              >
                {["string", "text", "number", "boolean", "enum"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-zinc-500">
              Default
              <input
                value={variableDraft.defaultValue}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    defaultValue: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
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
            <label className="block text-xs text-zinc-500">
              Options (comma-separated)
              <input
                value={variableDraft.options}
                onChange={(event) =>
                  setVariableDraft((draft) => ({
                    ...draft,
                    options: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none"
                placeholder="concise, friendly, direct"
              />
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-600"
              onClick={() => setIsVariableModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-full px-4 py-2 text-xs font-semibold text-white"
              style={{ background: accent }}
              onClick={handleConfirmAddVariable}
            >
              Add variable
            </button>
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
            <div className="truncate text-sm font-semibold text-zinc-900">
              {selectedPrompt.name}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {selectedPrompt.variables.length} variables
            </div>
          </div>
          <button
            className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-zinc-600"
            onClick={handleResetValues}
          >
            Reset
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {selectedPrompt.variables.map((variable) => {
            const value = selectedPrompt.values[variable.name];
            const common = {
              className:
                "mt-1 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-800 focus:outline-none",
            };
            if (variable.type === "text") {
              return (
                <label key={variable.name} className="block text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
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
                <label key={variable.name} className="block text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
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
                  className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-zinc-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                        required
                      </span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={boolValue}
                    onChange={(event) =>
                      updatePrompt((prompt) => ({
                        ...prompt,
                        values: { ...prompt.values, [variable.name]: event.target.checked },
                      }))
                    }
                  />
                </label>
              );
            }
            if (variable.type === "number") {
              return (
                <label key={variable.name} className="block text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span>{variable.name}</span>
                    {variable.required ? (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
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
              <label key={variable.name} className="block text-xs text-zinc-500">
                <span className="flex items-center gap-2">
                  <span>{variable.name}</span>
                  {variable.required ? (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
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
          <div className="text-sm text-zinc-600">
            Are you sure you want to delete {selectedPrompt.name}?
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-600"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-full px-4 py-2 text-xs font-semibold text-white"
              style={{ background: "#ef4444" }}
              onClick={() => {
                handleDeletePrompt();
                setIsDeleteOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
