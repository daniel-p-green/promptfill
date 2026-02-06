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

test("signed-header identity mode requires bearer auth mode", () => {
  assert.throws(
    () =>
      createPromptFillHttpServer({
        templateStoreKind: "memory",
        authToken: "",
        ownerIdMode: "signed_header",
        ownerIdSignatureSecret: "top-secret",
      }),
    /PROMPTFILL_AUTH_TOKEN/,
    "signed-header identity should require auth token mode"
  );
});

test("signed-header identity mode requires signature secret", () => {
  assert.throws(
    () =>
      createPromptFillHttpServer({
        templateStoreKind: "memory",
        authToken: "secret-token",
        ownerIdMode: "signed_header",
        ownerIdSignatureSecret: "",
      }),
    /PROMPTFILL_OWNER_ID_SIGNATURE_SECRET/,
    "signed-header identity should require signature secret"
  );
});

test("bearer-hash identity mode requires bearer auth mode", () => {
  assert.throws(
    () =>
      createPromptFillHttpServer({
        templateStoreKind: "memory",
        authToken: "",
        ownerIdMode: "bearer_hash",
      }),
    /PROMPTFILL_AUTH_TOKEN/,
    "bearer-hash identity should require auth token mode"
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
