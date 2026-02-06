import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixturePath = new URL("../../spec/tool-trigger-prompts.json", import.meta.url);
const knownTools = new Set([
  "extract_prompt_fields",
  "render_prompt",
  "save_template",
  "list_templates",
  "get_template",
  "search_templates",
  "update_template",
  "delete_template",
  "suggest_templates",
]);

test("golden prompts contain direct, indirect, and negative buckets", async () => {
  const raw = await readFile(fixturePath, "utf8");
  const prompts = JSON.parse(raw);
  const seenExpectedTools = new Set();

  for (const bucket of ["direct", "indirect", "negative"]) {
    assert.ok(Array.isArray(prompts[bucket]), `${bucket} bucket must be an array`);
    assert.ok(prompts[bucket].length >= 3, `${bucket} bucket must have at least 3 prompts`);

    for (const item of prompts[bucket]) {
      assert.equal(typeof item.prompt, "string", `${bucket} prompt must be a string`);
      assert.ok(item.prompt.trim().length > 0, `${bucket} prompt must not be empty`);

      if (bucket === "negative") {
        assert.equal(item.expected_tool, null, "negative prompts must use null expected_tool");
        continue;
      }

      assert.equal(
        typeof item.expected_tool,
        "string",
        `${bucket} prompts must provide an expected_tool for routing evaluation`
      );
      assert.ok(
        knownTools.has(item.expected_tool),
        `${bucket} prompt expected_tool must be a known PromptFill tool`
      );
      seenExpectedTools.add(item.expected_tool);
    }
  }

  for (const toolName of knownTools) {
    assert.ok(
      seenExpectedTools.has(toolName),
      `golden prompts should include at least one direct/indirect expectation for ${toolName}`
    );
  }
});
