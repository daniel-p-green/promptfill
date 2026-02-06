import { createServer } from "node:http";
import { readFileSync } from "node:fs";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

import {
  createInMemoryTemplateStore,
  extractPromptFields,
  renderPromptTemplate,
} from "./lib/promptfill-core.js";

const PORT = Number(process.env.PORT ?? 8787);
const MCP_PATH = process.env.MCP_PATH ?? "/mcp";
const INLINE_WIDGET_URI = "ui://widget/promptfill-inline-v1.html";
const FULLSCREEN_EDITOR_URI = "ui://widget/promptfill-fullscreen-v1.html";
const securitySchemes = [{ type: "noauth" }];

const templateStore = createInMemoryTemplateStore();
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

function buildServer() {
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
        _meta: {
          ui: {
            prefersBorder: true,
            domain: "https://promptfill.example.com",
            csp: {
              connectDomains: [],
              resourceDomains: ["https://persistent.oaistatic.com"],
            },
          },
          "openai/widgetDescription":
            "Extract prompt fields, fill values, and render the final prompt inline.",
        },
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
          _meta: {
            ui: {
              prefersBorder: false,
              domain: "https://promptfill.example.com",
              csp: {
                connectDomains: [],
                resourceDomains: ["https://persistent.oaistatic.com"],
              },
            },
            "openai/widgetDescription":
              "Advanced PromptFill editor for larger template edits and variable adjustments.",
          },
        },
      ],
    })
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

const httpServer = createServer(async (req, res) => {
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

httpServer.listen(PORT, () => {
  console.log(`PromptFill MCP server listening at http://localhost:${PORT}${MCP_PATH}`);
});
