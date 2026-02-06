import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import {
  extractPromptFields,
  renderPromptTemplate,
} from "./lib/promptfill-core.js";
import { suggestStarterTemplates } from "./lib/starter-templates.js";
import { createTemplateStoreAdapter } from "./lib/template-store-adapter.js";

const PORT = Number(process.env.PORT ?? 8787);
const MCP_PATH = process.env.MCP_PATH ?? "/mcp";
const INLINE_WIDGET_URI = "ui://widget/promptfill-inline-v1.html";
const FULLSCREEN_EDITOR_URI = "ui://widget/promptfill-fullscreen-v1.html";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://chat.openai.com",
  "https://chatgpt.com",
  "http://localhost:*",
  "http://127.0.0.1:*",
];
const DEFAULT_SINGLE_TENANT_USER_ID = "promptfill_single_tenant";
const DEFAULT_WIDGET_DOMAIN = "https://web-sandbox.oaiusercontent.com";

const inlineWidgetHtml = readFileSync(
  new URL("./widget/inline-card.html", import.meta.url),
  "utf8"
);
const fullscreenEditorHtml = readFileSync(
  new URL("./widget/fullscreen-editor.html", import.meta.url),
  "utf8"
);
const fullscreenEditorActions = [
  {
    type: "open_resource",
    resourceUri: FULLSCREEN_EDITOR_URI,
    label: "Open advanced editor",
  },
];

function createTemplateId() {
  return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseAllowedOrigins(value) {
  if (!value || !value.trim()) return DEFAULT_ALLOWED_ORIGINS;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBooleanFlag(value, defaultValue = false) {
  if (typeof value !== "string" || !value.trim()) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

function assertSecurityGuardrails({
  templateStoreKind,
  allowedOrigins,
  authToken,
  allowUserIdHeader,
  allowBearerTokenOwnerHash,
}) {
  if (allowUserIdHeader && !authToken) {
    throw new Error(
      "PROMPTFILL_ALLOW_USER_ID_HEADER requires PROMPTFILL_AUTH_TOKEN to avoid unauthenticated user spoofing."
    );
  }

  if (allowBearerTokenOwnerHash && !authToken) {
    throw new Error(
      "PROMPTFILL_ALLOW_BEARER_OWNER_HASH requires PROMPTFILL_AUTH_TOKEN so caller identity is verified."
    );
  }

  if (templateStoreKind !== "supabase") return;

  if (!authToken) {
    throw new Error(
      "PROMPTFILL_AUTH_TOKEN is required when PROMPTFILL_TEMPLATE_STORE_KIND=supabase."
    );
  }

  if (allowedOrigins.includes("*")) {
    throw new Error(
      "PROMPTFILL_ALLOWED_ORIGINS cannot include '*' when PROMPTFILL_TEMPLATE_STORE_KIND=supabase."
    );
  }
}

function normalizeWidgetDomain(value) {
  if (!value || !value.trim()) return DEFAULT_WIDGET_DOMAIN;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_WIDGET_DOMAIN;
  }
}

function toOpenAiWidgetCsp(csp) {
  const widgetCsp = {
    connect_domains: csp.connectDomains,
    resource_domains: csp.resourceDomains,
  };

  if (Array.isArray(csp.frameDomains) && csp.frameDomains.length > 0) {
    widgetCsp.frame_domains = csp.frameDomains;
  }

  return widgetCsp;
}

function createWidgetResourceMeta({
  prefersBorder,
  widgetDomain,
  csp,
  description,
}) {
  return {
    ui: {
      prefersBorder,
      domain: widgetDomain,
      csp,
    },
    "openai/widgetDescription": description,
    "openai/widgetPrefersBorder": prefersBorder,
    "openai/widgetDomain": widgetDomain,
    "openai/widgetCSP": toOpenAiWidgetCsp(csp),
  };
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.includes("*")) return true;

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.endsWith("*")) {
      return origin.startsWith(allowedOrigin.slice(0, -1));
    }
    return origin === allowedOrigin;
  });
}

function applyCorsHeaders({ req, res, allowedOrigins, mcpPath }) {
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (url.pathname !== mcpPath || !origin) {
    return true;
  }

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return false;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  res.setHeader("Vary", "Origin");
  return true;
}

function createSessionId() {
  return `sess_${randomUUID().replace(/-/g, "")}`;
}

function readSessionIdFromHeader(req) {
  const rawValue = req.headers["mcp-session-id"];
  if (typeof rawValue === "string" && rawValue.trim()) return rawValue.trim();
  if (Array.isArray(rawValue)) {
    const first = rawValue.find((value) => typeof value === "string" && value.trim());
    if (first) return first.trim();
  }
  return "";
}

function secureTokenMatch(expected, actual) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function isRequestAuthorized(req, authToken) {
  if (!authToken) return true;
  const header = typeof req.headers.authorization === "string" ? req.headers.authorization.trim() : "";
  if (!header.startsWith("Bearer ")) return false;
  const providedToken = header.slice("Bearer ".length).trim();
  if (!providedToken) return false;
  return secureTokenMatch(authToken, providedToken);
}

function resolveSecuritySchemes(authToken) {
  if (authToken) {
    return [{ type: "http", scheme: "bearer" }];
  }
  return [{ type: "noauth" }];
}

function sanitizeOwnerId(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
  return normalized || DEFAULT_SINGLE_TENANT_USER_ID;
}

function getBearerToken(req) {
  const header = typeof req.headers.authorization === "string" ? req.headers.authorization.trim() : "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

function hashTokenToOwnerId(token) {
  const digest = createHash("sha256").update(token).digest("hex").slice(0, 24);
  return `token_${digest}`;
}

export function resolveOwnerIdForRequest(req, fallbackOwnerId, options = {}) {
  const allowUserIdHeader = options.allowUserIdHeader === true;
  const allowBearerTokenOwnerHash = options.allowBearerTokenOwnerHash === true;

  if (allowUserIdHeader) {
    const headerUserId = req.headers["x-promptfill-user-id"];
    if (typeof headerUserId === "string" && headerUserId.trim()) {
      return sanitizeOwnerId(headerUserId);
    }
    if (Array.isArray(headerUserId)) {
      const first = headerUserId.find((item) => typeof item === "string" && item.trim());
      if (first) return sanitizeOwnerId(first);
    }
  }

  if (allowBearerTokenOwnerHash) {
    const bearerToken = getBearerToken(req);
    if (bearerToken) {
      return sanitizeOwnerId(hashTokenToOwnerId(bearerToken));
    }
  }

  return sanitizeOwnerId(fallbackOwnerId);
}

function isInitializeRequest(body) {
  if (!body || typeof body !== "object") return false;
  if (Array.isArray(body)) {
    return body.some((message) => message && typeof message === "object" && message.method === "initialize");
  }
  return body.method === "initialize";
}

async function readJsonRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body is too large."));
      }
    });

    req.on("end", () => {
      if (!raw.trim()) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function buildServer({ templateStore, securitySchemes, widgetDomain }) {
  const server = new McpServer({
    name: "promptfill-mcp",
    version: "0.1.0",
  });
  const templateVariableSchema = z.object({
    name: z.string(),
    type: z.enum(["string", "text", "number", "boolean", "enum"]).optional(),
    required: z.boolean().optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    options: z.array(z.string()).optional(),
  });
  const widgetCsp = {
    connectDomains: [],
    resourceDomains: ["https://persistent.oaistatic.com"],
  };

  registerAppResource(server, "promptfill-inline", INLINE_WIDGET_URI, {}, async () => ({
    contents: [
      {
        uri: INLINE_WIDGET_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: inlineWidgetHtml,
        _meta: createWidgetResourceMeta({
          prefersBorder: true,
          widgetDomain,
          csp: widgetCsp,
          description: "Extract prompt fields, fill values, and render the final prompt inline.",
        }),
      },
    ],
  }));

  registerAppResource(
    server,
    "promptfill-fullscreen",
    FULLSCREEN_EDITOR_URI,
    {},
    async () => ({
      contents: [
        {
          uri: FULLSCREEN_EDITOR_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: fullscreenEditorHtml,
          _meta: createWidgetResourceMeta({
            prefersBorder: false,
            widgetDomain,
            csp: widgetCsp,
            description: "Advanced PromptFill editor for larger template edits and variable adjustments.",
          }),
        },
      ],
    })
  );

  registerAppTool(
    server,
    "suggest_templates",
    {
      title: "Suggest starter templates",
      description: "Use this when the user wants to start from high-quality PromptFill templates.",
      inputSchema: {
        use_case: z.string().optional().describe("Optional use case filter like email, summary, support, or prd."),
        query: z.string().optional().describe("Optional free-text filter for starter template names."),
        limit: z.number().int().min(1).max(12).optional().describe("Maximum number of starter templates."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Finding starter templates...",
        "openai/toolInvocation/invoked": "Starter templates ready",
      },
    },
    async ({ use_case = "", query = "", limit = 6 }) => {
      const templates = suggestStarterTemplates({
        useCase: use_case,
        query,
        limit,
      }).map((item) => ({
        id: item.id,
        name: item.name,
        use_case: item.use_case,
        template: item.template,
        variables: item.variables,
        variable_count: Array.isArray(item.variables) ? item.variables.length : 0,
      }));

      return {
        structuredContent: {
          kind: "suggest",
          use_case,
          templates,
        },
        content: [
          {
            type: "text",
            text: templates.length
              ? `Suggested ${templates.length} starter template${templates.length === 1 ? "" : "s"}.`
              : "No starter templates matched that request.",
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "extract_prompt_fields",
    {
      title: "Extract prompt fields",
      description:
        "Use this when the user wants to turn raw prompt text into fillable fields.",
      inputSchema: {
        prompt_text: z.string().min(1).describe("Raw prompt text to structure."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Extracting fields...",
        "openai/toolInvocation/invoked": "Fields ready",
      },
    },
    async ({ prompt_text }) => {
      const extraction = extractPromptFields(prompt_text);

      return {
        structuredContent: {
          kind: "extraction",
          source_prompt: prompt_text,
          template: extraction.template,
          variables: extraction.variables,
          summary: {
            variable_count: extraction.variables.length,
          },
        },
        content: [
          {
            type: "text",
            text: `Found ${extraction.variables.length} field${extraction.variables.length === 1 ? "" : "s"}.`,
          },
        ],
        _meta: {
          extraction,
        },
      };
    }
  );

  registerAppTool(
    server,
    "render_prompt",
    {
      title: "Render final prompt",
      description:
        "Use this when the user wants to render their filled template into final prompt text.",
      inputSchema: {
        template: z.string().min(1).describe("Prompt template containing {{variables}}."),
        variables: z
          .array(templateVariableSchema)
          .optional()
          .describe("Variable schema for validation and defaults."),
        values: z
          .record(z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe("Current user-provided values keyed by variable name."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Rendering prompt...",
        "openai/toolInvocation/invoked": "Rendered",
      },
    },
    async ({ template, variables = [], values = {} }) => {
      const rendered = renderPromptTemplate({
        template,
        variables,
        values,
      });

      return {
        structuredContent: {
          kind: "render",
          rendered_prompt: rendered.rendered,
          missing_required: rendered.missingRequired,
        },
        content: [
          {
            type: "text",
            text:
              rendered.missingRequired.length > 0
                ? `Still missing required fields: ${rendered.missingRequired.join(", ")}.`
                : "Rendered prompt is ready.",
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "save_template",
    {
      title: "Save prompt template",
      description:
        "Use this when the user wants to save a reusable prompt template for later use.",
      inputSchema: {
        name: z.string().min(1).describe("Template display name."),
        template: z.string().min(1).describe("Prompt template text."),
        variables: z
          .array(templateVariableSchema)
          .optional()
          .describe("Optional variable schema."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        "openai/toolInvocation/invoking": "Saving template...",
        "openai/toolInvocation/invoked": "Saved",
      },
    },
    async ({ name, template, variables = [] }) => {
      const record = {
        id: createTemplateId(),
        name,
        template,
        variables,
        createdAt: new Date().toISOString(),
      };

      await templateStore.saveTemplate(record);

      return {
        structuredContent: {
          kind: "save",
          template: {
            id: record.id,
            name: record.name,
            variable_count: record.variables.length,
            created_at: record.createdAt,
          },
        },
        content: [{ type: "text", text: `Saved template "${record.name}".` }],
      };
    }
  );

  registerAppTool(
    server,
    "get_template",
    {
      title: "Get saved template details",
      description: "Use this when the user wants to open one saved PromptFill template by id.",
      inputSchema: {
        id: z.string().min(1).describe("Template id to load."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Loading template...",
        "openai/toolInvocation/invoked": "Template loaded",
      },
    },
    async ({ id }) => {
      const template = await templateStore.getTemplate(id);
      return {
        structuredContent: {
          kind: "get",
          template: template
            ? {
                id: template.id,
                name: template.name,
                template: template.template,
                variables: template.variables ?? [],
                created_at: template.createdAt,
                updated_at: template.updatedAt ?? null,
              }
            : null,
        },
        content: [
          {
            type: "text",
            text: template ? `Loaded template "${template.name}".` : `No template found for id "${id}".`,
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "search_templates",
    {
      title: "Search saved templates",
      description: "Use this when the user wants to quickly find saved PromptFill templates.",
      inputSchema: {
        query: z.string().optional().describe("Search text to match template names and content."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matches."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Searching templates...",
        "openai/toolInvocation/invoked": "Search complete",
      },
    },
    async ({ query = "", limit = 10 }) => {
      const searched = await templateStore.searchTemplates(query, { limit });
      const templates = searched.map((item) => ({
        id: item.id,
        name: item.name,
        variable_count: Array.isArray(item.variables) ? item.variables.length : 0,
        created_at: item.createdAt,
      }));

      return {
        structuredContent: {
          kind: "search",
          query,
          templates,
        },
        content: [
          {
            type: "text",
            text: templates.length
              ? `Found ${templates.length} template match${templates.length === 1 ? "" : "es"}.`
              : "No matching templates found.",
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "list_templates",
    {
      title: "List saved templates",
      description: "Use this when the user wants to see which PromptFill templates are already saved.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ui: { resourceUri: INLINE_WIDGET_URI },
        "openai/outputTemplate": INLINE_WIDGET_URI,
        "openai/widgetActions": fullscreenEditorActions,
        "openai/toolInvocation/invoking": "Loading templates...",
        "openai/toolInvocation/invoked": "Templates ready",
      },
    },
    async () => {
      const listedTemplates = await templateStore.listTemplates();
      const templates = listedTemplates.map((item) => ({
        id: item.id,
        name: item.name,
        variable_count: Array.isArray(item.variables) ? item.variables.length : 0,
        created_at: item.createdAt,
      }));

      return {
        structuredContent: {
          kind: "list",
          templates,
        },
        content: [
          {
            type: "text",
            text: templates.length
              ? `Found ${templates.length} saved template${templates.length === 1 ? "" : "s"}.`
              : "No saved templates yet.",
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "update_template",
    {
      title: "Update a saved template",
      description: "Use this when the user wants to change an existing saved PromptFill template.",
      inputSchema: {
        id: z.string().min(1).describe("Template id to update."),
        name: z.string().optional().describe("Updated display name."),
        template: z.string().optional().describe("Updated template text."),
        variables: z.array(templateVariableSchema).optional().describe("Updated variable schema."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        "openai/toolInvocation/invoking": "Updating template...",
        "openai/toolInvocation/invoked": "Updated",
      },
    },
    async ({ id, name, template, variables }) => {
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (template !== undefined) updates.template = template;
      if (variables !== undefined) updates.variables = variables;

      if (Object.keys(updates).length === 0) {
        return {
          structuredContent: {
            kind: "update",
            updated: false,
            template: null,
            reason: "missing_updates",
          },
          content: [{ type: "text", text: "No updates provided." }],
        };
      }

      const updated = await templateStore.updateTemplate(id, updates);

      return {
        structuredContent: {
          kind: "update",
          updated: Boolean(updated),
          template: updated
            ? {
                id: updated.id,
                name: updated.name,
                variable_count: Array.isArray(updated.variables) ? updated.variables.length : 0,
                created_at: updated.createdAt,
                updated_at: updated.updatedAt ?? null,
              }
            : null,
        },
        content: [
          {
            type: "text",
            text: updated ? `Updated template "${updated.name}".` : `No template found for id "${id}".`,
          },
        ],
      };
    }
  );

  registerAppTool(
    server,
    "delete_template",
    {
      title: "Delete a saved template",
      description: "Use this when the user wants to remove a saved PromptFill template.",
      inputSchema: {
        id: z.string().min(1).describe("Template id to delete."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        "openai/toolInvocation/invoking": "Deleting template...",
        "openai/toolInvocation/invoked": "Deleted",
      },
    },
    async ({ id }) => {
      const deleted = await templateStore.deleteTemplate(id);

      return {
        structuredContent: {
          kind: "delete",
          id,
          deleted,
        },
        content: [
          {
            type: "text",
            text: deleted ? `Deleted template "${id}".` : `No template found for id "${id}".`,
          },
        ],
      };
    }
  );

  return server;
}

export function createPromptFillHttpServer({
  mcpPath = MCP_PATH,
  templateStoreKind = process.env.PROMPTFILL_TEMPLATE_STORE_KIND ?? "memory",
  allowedOrigins = parseAllowedOrigins(process.env.PROMPTFILL_ALLOWED_ORIGINS ?? ""),
  authToken = (process.env.PROMPTFILL_AUTH_TOKEN ?? "").trim(),
  singleTenantUserId = process.env.PROMPTFILL_SINGLE_TENANT_USER_ID ?? DEFAULT_SINGLE_TENANT_USER_ID,
  widgetDomain = normalizeWidgetDomain(process.env.PROMPTFILL_WIDGET_DOMAIN ?? ""),
  allowUserIdHeader = parseBooleanFlag(process.env.PROMPTFILL_ALLOW_USER_ID_HEADER ?? "", false),
  allowBearerTokenOwnerHash = parseBooleanFlag(
    process.env.PROMPTFILL_ALLOW_BEARER_OWNER_HASH ?? "",
    false
  ),
} = {}) {
  assertSecurityGuardrails({
    templateStoreKind,
    allowedOrigins,
    authToken,
    allowUserIdHeader,
    allowBearerTokenOwnerHash,
  });

  const securitySchemes = resolveSecuritySchemes(authToken);
  const normalizedWidgetDomain = normalizeWidgetDomain(widgetDomain);
  const sessionsById = new Map();

  function clearSession(sessionId) {
    const session = sessionsById.get(sessionId);
    if (!session) return;
    sessionsById.delete(sessionId);
    try {
      session.transport.close();
    } catch {
      // no-op
    }
    try {
      session.mcpServer.close();
    } catch {
      // no-op
    }
  }

  return createServer(async (req, res) => {
    if (!req.url || !req.method) {
      res.writeHead(400, { "content-type": "text/plain" });
      res.end("Invalid request.");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const corsAllowed = applyCorsHeaders({ req, res, allowedOrigins, mcpPath });

    if (!corsAllowed) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("Origin is not allowed.");
      return;
    }

    if (req.method === "OPTIONS" && url.pathname === mcpPath) {
      const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
      const headers = {
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
      };
      if (origin) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Vary"] = "Origin";
      }
      res.writeHead(204, headers);
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(`PromptFill MCP server is running on ${mcpPath}`);
      return;
    }

    const allowedMethods = new Set(["GET", "POST", "DELETE"]);
    if (url.pathname === mcpPath && allowedMethods.has(req.method)) {
      if (!isRequestAuthorized(req, authToken)) {
        res.writeHead(401, { "content-type": "text/plain" });
        res.end("Unauthorized.");
        return;
      }

      const sessionId = readSessionIdFromHeader(req);

      if (req.method === "GET") {
        if (!sessionId || !sessionsById.has(sessionId)) {
          res.writeHead(405, { "content-type": "text/plain" });
          res.end("Method not allowed.");
          return;
        }
        const session = sessionsById.get(sessionId);
        await session.transport.handleRequest(req, res);
        return;
      }

      if (req.method === "DELETE") {
        if (!sessionId || !sessionsById.has(sessionId)) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("Invalid or missing session id.");
          return;
        }
        const session = sessionsById.get(sessionId);
        await session.transport.handleRequest(req, res);
        clearSession(sessionId);
        return;
      }

      let parsedBody;
      try {
        parsedBody = await readJsonRequestBody(req);
      } catch (error) {
        res.writeHead(400, { "content-type": "text/plain" });
        res.end(error instanceof Error ? error.message : "Invalid request body.");
        return;
      }

      try {
        if (sessionId && sessionsById.has(sessionId)) {
          const session = sessionsById.get(sessionId);
          await session.transport.handleRequest(req, res, parsedBody);
          return;
        }

        if (sessionId && !sessionsById.has(sessionId)) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("No active session for provided session id.");
          return;
        }

        if (!isInitializeRequest(parsedBody)) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("No valid session id provided.");
          return;
        }

        const ownerId = resolveOwnerIdForRequest(req, singleTenantUserId, {
          allowUserIdHeader,
          allowBearerTokenOwnerHash,
        });
        const templateStore = createTemplateStoreAdapter(templateStoreKind, {
          ownerId,
          url: process.env.PROMPTFILL_SUPABASE_URL,
          key: process.env.PROMPTFILL_SUPABASE_KEY,
          table: process.env.PROMPTFILL_SUPABASE_TABLE,
        });
        const mcpServer = buildServer({
          templateStore,
          securitySchemes,
          widgetDomain: normalizedWidgetDomain,
        });
        const session = {
          sessionId: "",
          transport: null,
          mcpServer,
        };

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: createSessionId,
          enableJsonResponse: true,
          onsessioninitialized: (initializedSessionId) => {
            session.sessionId = initializedSessionId;
            sessionsById.set(initializedSessionId, session);
          },
        });

        session.transport = transport;
        transport.onclose = () => {
          if (session.sessionId) {
            sessionsById.delete(session.sessionId);
          }
          mcpServer.close();
        };

        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, parsedBody);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "content-type": "text/plain" });
          res.end("Internal server error.");
        }
      }
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found.");
  });
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMainModule()) {
  const httpServer = createPromptFillHttpServer();
  httpServer.listen(PORT, () => {
    console.log(`PromptFill MCP server listening at http://localhost:${PORT}${MCP_PATH}`);
  });
}
