import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixturePath = new URL("../../spec/tool-trigger-prompts.json", import.meta.url);

test("golden prompts contain direct, indirect, and negative buckets", async () => {
  const raw = await readFile(fixturePath, "utf8");
  const prompts = JSON.parse(raw);

  for (const bucket of ["direct", "indirect", "negative"]) {
    assert.ok(Array.isArray(prompts[bucket]), `${bucket} bucket must be an array`);
    assert.ok(prompts[bucket].length >= 3, `${bucket} bucket must have at least 3 prompts`);

    for (const item of prompts[bucket]) {
      assert.equal(typeof item.prompt, "string", `${bucket} prompt must be a string`);
      assert.ok(item.prompt.trim().length > 0, `${bucket} prompt must not be empty`);
    }
  }
});
