import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("supabase schema enables rls and service-role policy", async () => {
  const sql = await readFile(
    new URL("../supabase/promptfill_templates.sql", import.meta.url),
    "utf8"
  );

  assert.match(
    sql,
    /alter table\s+public\.promptfill_templates\s+enable row level security/i,
    "schema must enable row-level security"
  );
  assert.match(
    sql,
    /create policy\s+promptfill_templates_service_role_all/i,
    "schema must define service-role policy"
  );
  assert.match(
    sql,
    /auth\.role\(\)\s*=\s*'service_role'/i,
    "policy should scope access to service role"
  );
});

