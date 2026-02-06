import test from "node:test";
import assert from "node:assert/strict";

import { createTemplateStoreAdapter } from "../src/lib/template-store-adapter.js";

function createMockSupabaseClient() {
  const rows = [];
  const state = {
    lastUpsertRow: null,
  };

  function buildSelectBuilder() {
    const filters = [];

    return {
      eq(field, value) {
        filters.push({ field, value });
        return this;
      },
      order(field, options = {}) {
        const filtered = rows.filter((row) =>
          filters.every((filter) => row[filter.field] === filter.value)
        );
        const sorted = [...filtered].sort((left, right) => {
          const leftValue = String(left[field] ?? "");
          const rightValue = String(right[field] ?? "");
          return options.ascending === false
            ? rightValue.localeCompare(leftValue)
            : leftValue.localeCompare(rightValue);
        });
        return Promise.resolve({ data: sorted, error: null });
      },
      maybeSingle() {
        const match = rows.find((row) => filters.every((filter) => row[filter.field] === filter.value));
        return Promise.resolve({ data: match ?? null, error: null });
      },
    };
  }

  return {
    state,
    from() {
      return {
        upsert(row) {
          state.lastUpsertRow = row;
          const index = rows.findIndex(
            (existing) => existing.owner_id === row.owner_id && existing.id === row.id
          );
          if (index >= 0) {
            rows[index] = { ...row };
          } else {
            rows.push({ ...row });
          }
          return {
            select() {
              return {
                single: () => Promise.resolve({ data: row, error: null }),
              };
            },
          };
        },
        select() {
          return buildSelectBuilder();
        },
      };
    },
  };
}

test("store adapter supports in-memory implementation and future backend swap", async () => {
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

  await store.saveTemplate(record);
  assert.deepEqual(await store.getTemplate(record.id), record);
  assert.equal((await store.listTemplates()).length, 1);
});

test("store adapter rejects unknown adapter kinds", () => {
  assert.throws(() => createTemplateStoreAdapter("unknown"), /Unknown template store adapter kind/);
});

test("supabase adapter saves and lists templates in single-tenant scope", async () => {
  const mockClient = createMockSupabaseClient();
  const store = createTemplateStoreAdapter("supabase", {
    client: mockClient,
    ownerId: "user_alpha",
    table: "promptfill_templates",
  });

  assert.equal(typeof store.saveTemplate, "function");
  assert.equal(typeof store.listTemplates, "function");
  assert.equal(typeof store.getTemplate, "function");

  const saved = await store.saveTemplate({
    id: "tpl_1",
    name: "Single tenant template",
    template: "Write for {{audience}}",
    variables: [{ name: "audience", type: "string", required: true, defaultValue: "buyers" }],
    createdAt: "2026-02-06T00:00:00.000Z",
  });

  assert.equal(saved.id, "tpl_1");
  assert.equal(mockClient.state.lastUpsertRow.owner_id, "user_alpha");

  const list = await store.listTemplates();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "tpl_1");

  const loaded = await store.getTemplate("tpl_1");
  assert.equal(loaded?.name, "Single tenant template");
});

test("supabase adapter requires env config when no client is injected", () => {
  assert.throws(
    () =>
      createTemplateStoreAdapter("supabase", {
        ownerId: "user_alpha",
      }),
    /PROMPTFILL_SUPABASE_URL is required/
  );
});
