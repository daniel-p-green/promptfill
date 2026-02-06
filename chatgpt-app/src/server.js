import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import {
  createInMemoryTemplateStore,
  extractPromptFields,
  renderPromptTemplate,
} from "./lib/promptfill-core.js";
import {
  INLINE_WIDGET_URI,
  RESOURCE_MIME_TYPE,
  createToolTemplateMeta,
  createWidgetMeta,
} from "./lib/apps-metadata.js";

const PORT = Number(process.env.PORT ?? 8787);
const MCP_PATH = process.env.MCP_PATH ?? "/mcp";
const securitySchemes = [{ type: "noauth" }];

const templateStore = createInMemoryTemplateStore();
const inlineWidgetHtml = readFileSync(
  new URL("./widget/inline-card.html", import.meta.url),
  "utf8"
);

function createTemplateId() {
  return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildServer() {
  const server = new McpServer({
    name: "promptfill-mcp",
    version: "0.1.0",
  });

  registerAppResource(server, "promptfill-inline", INLINE_WIDGET_URI, {}, async () => ({
    contents: [
      {
        uri: INLINE_WIDGET_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: inlineWidgetHtml,
        _meta: createWidgetMeta({
          description: "Extract prompt fields, fill values, and render the final prompt inline.",
        }),
      },
    ],
  }));

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
        ...createToolTemplateMeta(),
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
        "Use this when the user has field values and wants the final rendered prompt text.",
      inputSchema: {
        template: z.string().min(1).describe("Prompt template containing {{variables}}."),
        variables: z
          .array(
            z.object({
              name: z.string(),
              type: z.enum(["string", "text", "number", "boolean", "enum"]).optional(),
              required: z.boolean().optional(),
              defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
              options: z.array(z.string()).optional(),
            })
          )
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
        ...createToolTemplateMeta(),
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
          .array(
            z.object({
              name: z.string(),
              type: z.enum(["string", "text", "number", "boolean", "enum"]).optional(),
              required: z.boolean().optional(),
              defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
              options: z.array(z.string()).optional(),
            })
          )
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

      templateStore.saveTemplate(record);

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
    "list_templates",
    {
      title: "List saved templates",
      description: "Use this when the user asks what PromptFill templates are already saved.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      securitySchemes,
      _meta: {
        securitySchemes,
        ...createToolTemplateMeta(),
        "openai/toolInvocation/invoking": "Loading templates...",
        "openai/toolInvocation/invoked": "Templates ready",
      },
    },
    async () => {
      const templates = templateStore.listTemplates().map((item) => ({
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

  return server;
}

export function createHttpServer() {
  return createServer(async (req, res) => {
    if (!req.url || !req.method) {
      res.writeHead(400, { "content-type": "text/plain" });
      res.end("Invalid request.");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, mcp-session-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(`PromptFill MCP server is running on ${MCP_PATH}`);
      return;
    }

    const allowedMethods = new Set(["GET", "POST", "DELETE"]);
    if (url.pathname === MCP_PATH && allowedMethods.has(req.method)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

      const mcpServer = buildServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on("close", () => {
        transport.close();
        mcpServer.close();
      });

      try {
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "content-type": "text/plain" });
        }
        res.end("Internal server error.");
      }
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found.");
  });
}

export function startServer() {
  const httpServer = createHttpServer();
  httpServer.listen(PORT, () => {
    console.log(`PromptFill MCP server listening at http://localhost:${PORT}${MCP_PATH}`);
  });
  return httpServer;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  startServer();
}
