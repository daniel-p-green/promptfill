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
    fullscreenHtml.includes('id="template-name-input"'),
    "fullscreen editor should provide editable template name for library workflows"
  );
  assert.ok(
    fullscreenHtml.includes('id="template-search-input"'),
    "fullscreen editor should provide searchable template library input"
  );
  assert.ok(
    fullscreenHtml.includes('id="suggest-templates-button"'),
    "fullscreen editor should provide a starter-template action"
  );
  assert.ok(
    fullscreenHtml.includes("save_template"),
    "fullscreen editor should support saving templates from fullscreen"
  );
  assert.ok(
    fullscreenHtml.includes("update_template"),
    "fullscreen editor should support updating saved templates"
  );
  assert.ok(
    fullscreenHtml.includes("delete_template"),
    "fullscreen editor should support deleting saved templates"
  );
  assert.ok(
    fullscreenHtml.includes("search_templates"),
    "fullscreen editor should support template library search"
  );
  assert.ok(
    fullscreenHtml.includes("get_template"),
    "fullscreen editor should support loading selected template details"
  );
  assert.ok(
    fullscreenHtml.includes("suggest_templates"),
    "fullscreen editor should support curated starter template suggestions"
  );
  assert.ok(
    fullscreenHtml.includes('id="list-versions-button"'),
    "fullscreen editor should provide a version history action"
  );
  assert.ok(
    fullscreenHtml.includes('id="version-history"'),
    "fullscreen editor should render a visible version history list"
  );
  assert.ok(
    fullscreenHtml.includes("list_template_versions"),
    "fullscreen editor should support reading template version history"
  );
  assert.ok(
    fullscreenHtml.includes("restore_template_version"),
    "fullscreen editor should support restoring historical versions"
  );
  assert.ok(
    fullscreenHtml.includes("ui/message"),
    "fullscreen editor should support direct insert back into chat"
  );
});
