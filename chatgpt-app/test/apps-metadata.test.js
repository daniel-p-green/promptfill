import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_WIDGET_DOMAIN,
  INLINE_WIDGET_URI,
  RESOURCE_MIME_TYPE,
  createToolTemplateMeta,
  createWidgetMeta,
  getWidgetDomain,
  normalizeWidgetDomain,
} from "../src/lib/apps-metadata.js";

test("RESOURCE_MIME_TYPE matches MCP Apps MIME profile", () => {
  assert.equal(RESOURCE_MIME_TYPE, "text/html;profile=mcp-app");
});

test("createToolTemplateMeta mirrors resource URI for standard and compatibility keys", () => {
  const meta = createToolTemplateMeta();
  assert.equal(meta.ui.resourceUri, INLINE_WIDGET_URI);
  assert.equal(meta["openai/outputTemplate"], INLINE_WIDGET_URI);
});

test("createWidgetMeta provides standard ui metadata and ChatGPT compatibility aliases", () => {
  const description = "PromptFill inline card";
  const meta = createWidgetMeta({
    description,
    widgetDomain: "https://promptfill.example.com",
    prefersBorder: true,
  });

  assert.equal(meta.ui.prefersBorder, true);
  assert.equal(meta.ui.domain, "https://promptfill.example.com");
  assert.deepEqual(meta.ui.csp, {
    connectDomains: [],
    resourceDomains: ["https://persistent.oaistatic.com"],
  });

  assert.equal(meta["openai/widgetDescription"], description);
  assert.equal(meta["openai/widgetPrefersBorder"], true);
  assert.equal(meta["openai/widgetDomain"], "https://promptfill.example.com");
  assert.deepEqual(meta["openai/widgetCSP"], {
    connect_domains: [],
    resource_domains: ["https://persistent.oaistatic.com"],
  });
});

test("normalizeWidgetDomain returns origin when PROMPTFILL_WIDGET_DOMAIN includes a path", () => {
  const normalized = normalizeWidgetDomain("https://widgets.promptfill.dev/path/to/widget?mode=embed");
  assert.equal(normalized, "https://widgets.promptfill.dev");
});

test("normalizeWidgetDomain falls back to default for invalid values", () => {
  assert.equal(normalizeWidgetDomain("not-a-url"), DEFAULT_WIDGET_DOMAIN);
  assert.equal(normalizeWidgetDomain(""), DEFAULT_WIDGET_DOMAIN);
});

test("getWidgetDomain reads and normalizes PROMPTFILL_WIDGET_DOMAIN", () => {
  const original = process.env.PROMPTFILL_WIDGET_DOMAIN;
  process.env.PROMPTFILL_WIDGET_DOMAIN = "https://chat.promptfill.dev/embed/card";

  try {
    assert.equal(getWidgetDomain(), "https://chat.promptfill.dev");
  } finally {
    if (original === undefined) {
      delete process.env.PROMPTFILL_WIDGET_DOMAIN;
    } else {
      process.env.PROMPTFILL_WIDGET_DOMAIN = original;
    }
  }
});
