import assert from "node:assert/strict";
import test from "node:test";

import { createPromptFillHttpServer } from "../src/server.js";

test("supabase mode requires bearer auth token", () => {
  assert.throws(
    () => createPromptFillHttpServer({ templateStoreKind: "supabase", authToken: "" }),
    /PROMPTFILL_AUTH_TOKEN/,
    "supabase mode should require auth token to avoid unauthenticated writes"
  );
});

test("supabase mode rejects wildcard cors origins", () => {
  assert.throws(
    () =>
      createPromptFillHttpServer({
        templateStoreKind: "supabase",
        authToken: "secret-token",
        allowedOrigins: ["*"],
      }),
    /PROMPTFILL_ALLOWED_ORIGINS/,
    "supabase mode should not permit wildcard CORS"
  );
});

test("user-id header mapping requires bearer auth mode", () => {
  assert.throws(
    () =>
      createPromptFillHttpServer({
        templateStoreKind: "memory",
        authToken: "",
        allowUserIdHeader: true,
      }),
    /PROMPTFILL_ALLOW_USER_ID_HEADER/,
    "caller-supplied user-id mapping should require authenticated mode"
  );
});

test("supabase mode allows secure config", () => {
  const server = createPromptFillHttpServer({
    templateStoreKind: "supabase",
    authToken: "secret-token",
    allowedOrigins: ["https://chatgpt.com"],
  });

  server.close();
});

