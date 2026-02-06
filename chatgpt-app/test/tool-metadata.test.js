import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function getToolDescription(source, toolName) {
  const expression = new RegExp(
    `registerAppTool\\(\\s*server,\\s*"${toolName}",\\s*\\{[\\s\\S]*?description:\\s*"([^"]+)"`,
    "m"
  );
  const match = source.match(expression);
  assert.ok(match, `could not find description for ${toolName}`);
  return match[1];
}

test("tool descriptions start with Use this when the user wants to", async () => {
  const source = await readFile(new URL("../src/server.js", import.meta.url), "utf8");
  const toolNames = ["extract_prompt_fields", "render_prompt", "save_template", "list_templates"];

  for (const toolName of toolNames) {
    const description = getToolDescription(source, toolName);
    assert.ok(
      description.startsWith("Use this when the user wants to"),
      `${toolName} description must start with "Use this when the user wants to"`
    );
  }
});
