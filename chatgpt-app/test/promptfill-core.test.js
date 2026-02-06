import test from "node:test";
import assert from "node:assert/strict";

import {
  extractPromptFields,
  renderPromptTemplate,
  createInMemoryTemplateStore,
} from "../src/lib/promptfill-core.js";

test("extractPromptFields normalizes placeholders and infers field types", () => {
  const input = `Write an email to [recipient name] about {topic}.\nTone: {{tone}}\nContext: <context>`;

  const result = extractPromptFields(input);

  assert.equal(
    result.template,
    "Write an email to {{recipient_name}} about {{topic}}.\nTone: {{tone}}\nContext: {{context}}"
  );

  const byName = Object.fromEntries(result.variables.map((item) => [item.name, item]));

  assert.equal(byName.recipient_name.type, "string");
  assert.equal(byName.topic.type, "string");
  assert.equal(byName.tone.type, "enum");
  assert.deepEqual(byName.tone.options, ["concise", "friendly", "direct", "formal"]);
  assert.equal(byName.context.type, "text");
});

test("renderPromptTemplate reports missing required fields and renders when complete", () => {
  const template = "Write to {{recipient_name}} about {{topic}} in a {{tone}} tone.";
  const variables = [
    { name: "recipient_name", type: "string", required: true, defaultValue: "" },
    { name: "topic", type: "string", required: true, defaultValue: "" },
    { name: "tone", type: "enum", required: true, defaultValue: "concise", options: ["concise", "friendly"] },
  ];

  const missing = renderPromptTemplate({
    template,
    variables,
    values: { recipient_name: "Alex" },
  });

  assert.deepEqual(missing.missingRequired, ["topic"]);

  const complete = renderPromptTemplate({
    template,
    variables,
    values: { recipient_name: "Alex", topic: "Q2 pricing", tone: "friendly" },
  });

  assert.deepEqual(complete.missingRequired, []);
  assert.equal(complete.rendered, "Write to Alex about Q2 pricing in a friendly tone.");
});

test("createInMemoryTemplateStore saves and lists templates", () => {
  const store = createInMemoryTemplateStore();

  store.saveTemplate({
    id: "t_1",
    name: "Email outreach",
    template: "Write to {{recipient_name}} about {{topic}}.",
    variables: [],
    createdAt: "2026-02-06T00:00:00.000Z",
  });

  const templates = store.listTemplates();

  assert.equal(templates.length, 1);
  assert.equal(templates[0].name, "Email outreach");
  assert.equal(templates[0].id, "t_1");
});

test("createInMemoryTemplateStore supports search, update, and delete", () => {
  const store = createInMemoryTemplateStore();

  store.saveTemplate({
    id: "t_1",
    name: "Executive Summary",
    template: "Summarize {{notes}} for {{audience}}.",
    variables: [{ name: "audience", type: "enum", required: true, defaultValue: "execs" }],
    createdAt: "2026-02-06T00:00:00.000Z",
  });

  store.saveTemplate({
    id: "t_2",
    name: "Support Reply",
    template: "Reply to {{customer_name}} with {{tone}} tone.",
    variables: [{ name: "tone", type: "enum", required: true, defaultValue: "friendly" }],
    createdAt: "2026-02-06T00:01:00.000Z",
  });

  const searchByName = store.searchTemplates("summary");
  assert.equal(searchByName.length, 1);
  assert.equal(searchByName[0].id, "t_1");

  const searchByTemplate = store.searchTemplates("customer_name");
  assert.equal(searchByTemplate.length, 1);
  assert.equal(searchByTemplate[0].id, "t_2");

  const updated = store.updateTemplate("t_2", {
    name: "Support Reply Updated",
    variables: [{ name: "tone", type: "enum", required: true, defaultValue: "direct" }],
  });
  assert.equal(updated?.name, "Support Reply Updated");
  assert.equal(updated?.variables?.[0]?.defaultValue, "direct");
  assert.equal(store.getTemplate("t_2")?.name, "Support Reply Updated");

  const deleted = store.deleteTemplate("t_1");
  assert.equal(deleted, true);
  assert.equal(store.getTemplate("t_1"), null);
  assert.equal(store.deleteTemplate("missing"), false);
});

test("createInMemoryTemplateStore tracks versions and supports restore", () => {
  const store = createInMemoryTemplateStore();

  store.saveTemplate({
    id: "t_ver_1",
    name: "Versioned template",
    template: "Write for {{audience}}",
    variables: [{ name: "audience", type: "string", required: true }],
    createdAt: "2026-02-06T00:00:00.000Z",
  });

  store.updateTemplate("t_ver_1", {
    template: "Write for {{audience}} with {{tone}}",
    variables: [
      { name: "audience", type: "string", required: true },
      { name: "tone", type: "enum", required: true, defaultValue: "friendly" },
    ],
  });

  const versions = store.listTemplateVersions("t_ver_1");
  assert.equal(versions.length, 2);
  assert.equal(versions[0].version_number, 2);
  assert.equal(versions[1].version_number, 1);

  const restored = store.restoreTemplateVersion("t_ver_1", versions[1].version_id);
  assert.equal(restored?.template, "Write for {{audience}}");

  const finalVersions = store.listTemplateVersions("t_ver_1");
  assert.equal(finalVersions.length, 3);
  assert.equal(finalVersions[0].version_number, 3);
});
