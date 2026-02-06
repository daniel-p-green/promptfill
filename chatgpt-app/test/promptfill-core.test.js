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
