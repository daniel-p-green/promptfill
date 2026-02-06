import test from "node:test";
import assert from "node:assert/strict";

import { createTemplateStoreAdapter } from "../src/lib/template-store-adapter.js";

function createMockSupabaseClient() {
  const tables = new Map();
  const state = {
    lastUpsertRow: null,
  };

  function getRows(tableName) {
    if (!tables.has(tableName)) {
      tables.set(tableName, []);
    }
    return tables.get(tableName);
  }

  function buildSelectBuilder(rows) {
    const filters = [];
    let orderBy = null;
    let ascending = true;

    function applyFilters() {
      let filtered = rows.filter((row) => filters.every((filter) => row[filter.field] === filter.value));
      if (orderBy) {
        filtered = [...filtered].sort((left, right) => {
          const leftValue = String(left[orderBy] ?? "");
          const rightValue = String(right[orderBy] ?? "");
          return ascending ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue);
        });
      }
      return filtered;
    }

    const builder = {
      eq(field, value) {
        filters.push({ field, value });
        return builder;
      },
      order(field, options = {}) {
        orderBy = field;
        ascending = options.ascending !== false;
        return builder;
      },
      maybeSingle() {
        const [match] = applyFilters();
        return Promise.resolve({ data: match ?? null, error: null });
      },
      then(resolve, reject) {
        try {
          resolve({ data: applyFilters(), error: null });
        } catch (error) {
          if (reject) reject(error);
        }
      },
    };

    return builder;
  }

  return {
    state,
    from(tableName) {
      const rows = getRows(tableName);
      return {
        upsert(row) {
          state.lastUpsertRow = row;
          const keyField = tableName === "promptfill_template_versions" ? "version_id" : "id";
          const index = rows.findIndex((existing) => {
            const ownerMatch = existing.owner_id === row.owner_id;
            const idMatch = existing[keyField] === row[keyField];
            const templateMatch =
              tableName !== "promptfill_template_versions" ||
              existing.template_id === row.template_id;
            return ownerMatch && idMatch && templateMatch;
          });
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
          return buildSelectBuilder(rows);
        },
        insert(input) {
          const rowsToInsert = Array.isArray(input) ? input : [input];
          for (const row of rowsToInsert) {
            rows.push({ ...row });
          }
          return Promise.resolve({ data: null, error: null });
        },
        delete() {
          const filters = [];
          const builder = {
            eq(field, value) {
              filters.push({ field, value });
              return builder;
            },
            then(resolve, reject) {
              try {
                const remaining = [];
                let deletedCount = 0;
                for (const row of rows) {
                  const matches = filters.every((filter) => row[filter.field] === filter.value);
                  if (matches) {
                    deletedCount += 1;
                  } else {
                    remaining.push(row);
                  }
                }
                rows.length = 0;
                rows.push(...remaining);
                resolve({ data: null, error: null, count: deletedCount });
              } catch (error) {
                if (reject) reject(error);
              }
            },
          };
          return builder;
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
  assert.equal(typeof store.updateTemplate, "function");
  assert.equal(typeof store.deleteTemplate, "function");
  assert.equal(typeof store.searchTemplates, "function");
  assert.equal(typeof store.listTemplateVersions, "function");
  assert.equal(typeof store.restoreTemplateVersion, "function");

  const record = {
    id: "tpl_adapter_1",
    name: "Adapter Test Template",
    template: "Write for {{audience}}",
    variables: [{ name: "audience", type: "string", required: true, defaultValue: "buyers" }],
    createdAt: "2026-02-06T00:00:00.000Z",
  };

  await store.saveTemplate(record);
  assert.deepEqual(await store.getTemplate(record.id), {
    ...record,
    updatedAt: null,
  });
  assert.equal((await store.listTemplates()).length, 1);
});

test("memory adapter can update, search, and delete templates", async () => {
  const store = createTemplateStoreAdapter("memory");

  await store.saveTemplate({
    id: "tpl_adapter_2",
    name: "Support Response",
    template: "Reply to {{customer_name}}",
    variables: [{ name: "customer_name", type: "string", required: true }],
    createdAt: "2026-02-06T00:02:00.000Z",
  });

  const searchResults = await store.searchTemplates("support");
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, "tpl_adapter_2");

  const updated = await store.updateTemplate("tpl_adapter_2", {
    name: "Support Response Updated",
  });
  assert.equal(updated?.name, "Support Response Updated");

  const deleted = await store.deleteTemplate("tpl_adapter_2");
  assert.equal(deleted, true);
  assert.equal(await store.getTemplate("tpl_adapter_2"), null);
});

test("memory adapter can list versions and restore a version", async () => {
  const store = createTemplateStoreAdapter("memory");

  await store.saveTemplate({
    id: "tpl_adapter_3",
    name: "Version template",
    template: "Initial {{value}}",
    variables: [{ name: "value", type: "string", required: true }],
    createdAt: "2026-02-06T00:03:00.000Z",
  });

  await store.updateTemplate("tpl_adapter_3", {
    template: "Updated {{value}} {{tone}}",
    variables: [
      { name: "value", type: "string", required: true },
      { name: "tone", type: "enum", required: true, defaultValue: "friendly" },
    ],
  });

  const versions = await store.listTemplateVersions("tpl_adapter_3");
  assert.equal(versions.length, 2);
  assert.equal(versions[0].version_number, 2);

  const restored = await store.restoreTemplateVersion("tpl_adapter_3", versions[1].version_id);
  assert.equal(restored?.template, "Initial {{value}}");
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
  assert.equal(typeof store.updateTemplate, "function");
  assert.equal(typeof store.deleteTemplate, "function");
  assert.equal(typeof store.searchTemplates, "function");
  assert.equal(typeof store.listTemplateVersions, "function");
  assert.equal(typeof store.restoreTemplateVersion, "function");

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

test("supabase adapter can update, search, and delete templates", async () => {
  const mockClient = createMockSupabaseClient();
  const store = createTemplateStoreAdapter("supabase", {
    client: mockClient,
    ownerId: "user_alpha",
    table: "promptfill_templates",
  });

  await store.saveTemplate({
    id: "tpl_3",
    name: "Project Brief",
    template: "Write a brief for {{project_name}}",
    variables: [{ name: "project_name", type: "string", required: true }],
    createdAt: "2026-02-06T00:05:00.000Z",
  });

  const searchResults = await store.searchTemplates("brief");
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, "tpl_3");

  const updated = await store.updateTemplate("tpl_3", {
    name: "Project Brief Updated",
  });
  assert.equal(updated?.name, "Project Brief Updated");

  const deleted = await store.deleteTemplate("tpl_3");
  assert.equal(deleted, true);
  assert.equal(await store.getTemplate("tpl_3"), null);
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
