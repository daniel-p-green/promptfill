import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("inline widget is conversation-first and can insert rendered text", async () => {
  const html = await readFile(new URL("../src/widget/inline-card.html", import.meta.url), "utf8");

  assert.ok(!html.includes('id="prompt-input"'));
  assert.ok(!html.toLowerCase().includes("paste a rough prompt here"));
  assert.ok((html.match(/<button\b/g) ?? []).length <= 2, "widget should keep at most two actions");
  assert.ok(html.includes('id="insert-button"'), "widget should include an insert button");
  assert.ok(html.includes("ui/message"), "widget should use ui/message to insert text into chat");
});
