import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("inline card offers fullscreen handoff action for advanced edits", async () => {
  const source = await readFile(new URL("../src/server.js", import.meta.url), "utf8");
  const fullscreenHtml = await readFile(
    new URL("../src/widget/fullscreen-editor.html", import.meta.url),
    "utf8"
  );

  assert.ok(
    source.includes('const FULLSCREEN_EDITOR_URI = "ui://widget/promptfill-fullscreen-v1.html";'),
    "server should define fullscreen resource URI"
  );
  assert.ok(
    /registerAppResource\(\s*server,\s*"promptfill-fullscreen",\s*FULLSCREEN_EDITOR_URI/.test(source),
    "server should register fullscreen widget resource"
  );
  assert.ok(
    source.includes('"openai/widgetActions"'),
    "tool metadata should include a fullscreen handoff action list"
  );
  assert.ok(
    source.includes('label: "Open advanced editor"'),
    "fullscreen handoff should expose clear action label"
  );
  assert.ok(
    fullscreenHtml.includes('id="template-input"'),
    "fullscreen editor should expose editable template input"
  );
  assert.ok(
    fullscreenHtml.includes("tools/call"),
    "fullscreen editor should call render_prompt through the MCP bridge"
  );
  assert.ok(
    fullscreenHtml.includes("ui/message"),
    "fullscreen editor should support direct insert back into chat"
  );
});
