import test from "node:test";
import assert from "node:assert/strict";

import { withMcpServer } from "./helpers/mcp-runtime-client.js";

test("tool descriptions start with Use this when the user wants to", async () => {
  await withMcpServer(async ({ createClient }) => {
    const { client } = await createClient();

    const result = await client.listTools();
    const tools = Array.isArray(result?.tools) ? result.tools : [];
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    for (const toolName of [
      "extract_prompt_fields",
      "render_prompt",
      "save_template",
      "list_templates",
      "get_template",
      "search_templates",
      "update_template",
      "delete_template",
    ]) {
      const tool = byName.get(toolName);
      assert.ok(tool, `expected tool metadata for ${toolName}`);
      assert.equal(
        typeof tool.description,
        "string",
        `${toolName} should expose a string description in runtime metadata`
      );
      assert.ok(
        tool.description.startsWith("Use this when the user wants to"),
        `${toolName} description must start with "Use this when the user wants to"`
      );
    }
  });
});
