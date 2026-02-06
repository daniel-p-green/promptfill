const PLACEHOLDER_PATTERN = /\{\{\s*([^{}<>\[\]]+?)\s*\}\}|\{\s*([^{}<>\[\]]+?)\s*\}|\[\s*([^{}<>\[\]]+?)\s*\]|<\s*([^{}<>\[\]]+?)\s*>/g;

const ENUM_OPTION_SETS = {
  tone: ["concise", "friendly", "direct", "formal"],
  audience: ["execs", "engineering", "sales", "customers"],
  format: ["bullets", "paragraphs", "email", "slack_update"],
  length: ["short", "medium", "long"],
  style: ["friendly", "crisp", "executive", "casual"],
  language: ["english", "spanish", "french", "german"],
};

const TEXT_HINTS = ["context", "notes", "transcript", "thread", "paste", "input", "source"];
const BOOLEAN_HINTS = ["include", "exclude", "enabled", "disabled", "allow", "deny", "true", "false"];

function toSnakeCase(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function inferVariableType(name) {
  const lower = name.toLowerCase();

  for (const key of Object.keys(ENUM_OPTION_SETS)) {
    if (lower.includes(key)) {
      return { type: "enum", options: ENUM_OPTION_SETS[key], defaultValue: ENUM_OPTION_SETS[key][0] };
    }
  }

  if (TEXT_HINTS.some((hint) => lower.includes(hint))) {
    return { type: "text", defaultValue: "" };
  }

  if (BOOLEAN_HINTS.some((hint) => lower.includes(hint))) {
    return { type: "boolean", defaultValue: false };
  }

  return { type: "string", defaultValue: "" };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createVersionId() {
  return `ver_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function hasTemplateStoreInterface(store) {
  return (
    Boolean(store) &&
    typeof store.saveTemplate === "function" &&
    typeof store.listTemplates === "function" &&
    typeof store.getTemplate === "function" &&
    typeof store.updateTemplate === "function" &&
    typeof store.deleteTemplate === "function" &&
    typeof store.searchTemplates === "function" &&
    typeof store.listTemplateVersions === "function" &&
    typeof store.restoreTemplateVersion === "function"
  );
}

function normalizeSearchQuery(query) {
  return String(query ?? "")
    .trim()
    .toLowerCase();
}

function getSearchableText(template) {
  if (!template || typeof template !== "object") return "";
  const variableNames = Array.isArray(template.variables)
    ? template.variables.map((item) => item?.name ?? "").join(" ")
    : "";
  return [template.name ?? "", template.template ?? "", variableNames].join(" ").toLowerCase();
}

export function extractPromptFields(rawPrompt) {
  const seen = new Set();
  const variables = [];

  const template = String(rawPrompt).replace(PLACEHOLDER_PATTERN, (_full, a, b, c, d) => {
    const rawName = a ?? b ?? c ?? d ?? "";
    const name = toSnakeCase(rawName);
    if (!name) return _full;

    if (!seen.has(name)) {
      seen.add(name);
      const inferred = inferVariableType(name);
      variables.push({
        name,
        type: inferred.type,
        required: true,
        defaultValue: inferred.defaultValue,
        ...(inferred.options ? { options: inferred.options } : {}),
      });
    }

    return `{{${name}}}`;
  });

  return { template, variables };
}

function valueToString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function renderPromptTemplate({ template, variables, values }) {
  const safeTemplate = String(template ?? "");
  const safeVariables = Array.isArray(variables) ? variables : [];
  const safeValues = values && typeof values === "object" ? values : {};
  const missingRequired = [];
  const resolved = {};

  for (const variable of safeVariables) {
    const name = variable?.name;
    if (!name) continue;

    const fromValues = safeValues[name];
    const value = fromValues !== undefined && fromValues !== "" ? fromValues : variable.defaultValue;
    const stringValue = valueToString(value);

    if (variable.required && stringValue === "") {
      missingRequired.push(name);
      continue;
    }

    resolved[name] = stringValue;
  }

  const rendered = safeTemplate.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, rawName) => {
    const name = toSnakeCase(rawName);
    if (!name) return match;
    if (Object.prototype.hasOwnProperty.call(resolved, name)) {
      return resolved[name];
    }
    return match;
  });

  return { rendered, missingRequired };
}

export function createInMemoryTemplateStore() {
  const templates = new Map();
  const versionsByTemplateId = new Map();

  function appendVersion(templateRecord) {
    const snapshotAt = new Date().toISOString();
    const existing = versionsByTemplateId.get(templateRecord.id) ?? [];
    const version = {
      version_id: createVersionId(),
      version_number: existing.length + 1,
      template_id: templateRecord.id,
      name: templateRecord.name,
      template: templateRecord.template,
      variables: Array.isArray(templateRecord.variables) ? templateRecord.variables : [],
      created_at: templateRecord.createdAt,
      updated_at: templateRecord.updatedAt ?? null,
      snapshot_at: snapshotAt,
    };
    existing.push(version);
    versionsByTemplateId.set(templateRecord.id, existing);
    return version;
  }

  return {
    saveTemplate(template) {
      if (!template || !template.id) {
        throw new Error("Template id is required.");
      }
      const existing = templates.get(template.id);
      const nowIso = new Date().toISOString();
      const record = {
        ...(existing ?? {}),
        ...clone(template),
        id: template.id,
        createdAt: existing?.createdAt ?? template.createdAt ?? nowIso,
        updatedAt: existing ? nowIso : template.updatedAt ?? null,
      };

      templates.set(record.id, clone(record));
      appendVersion(record);
      return clone(record);
    },

    listTemplates() {
      return Array.from(templates.values()).map((item) => clone(item));
    },

    getTemplate(id) {
      if (!templates.has(id)) return null;
      return clone(templates.get(id));
    },

    updateTemplate(id, updates = {}) {
      if (!id || !templates.has(id)) return null;

      const existing = templates.get(id);
      const next = {
        ...existing,
        ...updates,
        id: existing.id,
      };

      if (updates.variables !== undefined) {
        next.variables = Array.isArray(updates.variables) ? updates.variables : [];
      }

      if (updates.template !== undefined) {
        next.template = String(updates.template);
      }

      if (updates.name !== undefined) {
        next.name = String(updates.name);
      }

      return this.saveTemplate(next);
    },

    deleteTemplate(id) {
      if (!id) return false;
      versionsByTemplateId.delete(id);
      return templates.delete(id);
    },

    searchTemplates(query, options = {}) {
      const normalized = normalizeSearchQuery(query);
      const limit = Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : 25;
      const all = Array.from(templates.values());

      const filtered = normalized
        ? all.filter((template) => getSearchableText(template).includes(normalized))
        : all;

      return filtered.slice(0, limit).map((item) => clone(item));
    },

    listTemplateVersions(templateId, options = {}) {
      const limit = Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : 20;
      const versions = versionsByTemplateId.get(templateId) ?? [];
      return versions
        .slice()
        .sort((a, b) => b.version_number - a.version_number)
        .slice(0, limit)
        .map((item) => clone(item));
    },

    restoreTemplateVersion(templateId, versionId) {
      if (!templateId || !versionId) return null;
      const versions = versionsByTemplateId.get(templateId) ?? [];
      const version = versions.find((item) => item.version_id === versionId);
      if (!version) return null;

      const existing = templates.get(templateId);
      return this.saveTemplate({
        id: templateId,
        name: version.name,
        template: version.template,
        variables: Array.isArray(version.variables) ? version.variables : [],
        createdAt: existing?.createdAt ?? version.created_at ?? new Date().toISOString(),
      });
    },
  };
}
