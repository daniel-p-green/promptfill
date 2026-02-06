import test from "node:test";
import assert from "node:assert/strict";

import { createTemplateStoreAdapter } from "../src/lib/template-store-adapter.js";

test("store adapter supports in-memory implementation and future backend swap", () => {
  const store = createTemplateStoreAdapter("memory");

  assert.equal(typeof store.saveTemplate, "function");
  assert.equal(typeof store.listTemplates, "function");
  assert.equal(typeof store.getTemplate, "function");

  const record = {
    id: "tpl_adapter_1",
    name: "Adapter Test Template",
    template: "Write for {{audience}}",
    variables: [{ name: "audience", type: "string", required: true, defaultValue: "buyers" }],
    createdAt: "2026-02-06T00:00:00.000Z",
  };

  store.saveTemplate(record);
  assert.deepEqual(store.getTemplate(record.id), record);
  assert.equal(store.listTemplates().length, 1);
});

test("store adapter rejects unknown adapter kinds", () => {
  assert.throws(() => createTemplateStoreAdapter("unknown"), /Unknown template store adapter kind/);
});
