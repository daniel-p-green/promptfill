import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { resolveOwnerIdForRequest } from "../src/server.js";

function createRequest(headers = {}) {
  return { headers };
}

test("owner resolution defaults to fallback and ignores user-id header", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ "x-promptfill-user-id": "attacker-account" }),
    "team_default"
  );

  assert.equal(
    ownerId,
    "team_default",
    "owner id should not trust caller-provided user id header by default"
  );
});

test("owner resolution defaults to fallback and ignores bearer token", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ authorization: "Bearer caller-token" }),
    "team_default"
  );

  assert.equal(
    ownerId,
    "team_default",
    "owner id should not derive tenancy from caller token by default"
  );
});

function signOwner(ownerId, secret) {
  return createHmac("sha256", secret).update(ownerId).digest("hex");
}

test("owner resolution supports signed-header identity mode", () => {
  const ownerId = "Ops Team:North America";
  const signature = signOwner(ownerId, "top-secret");

  const resolved = resolveOwnerIdForRequest(
    createRequest({
      "x-promptfill-user-id": ownerId,
      "x-promptfill-user-signature": signature,
    }),
    "team_default",
    {
      ownerIdMode: "signed_header",
      ownerIdSignatureSecret: "top-secret",
    }
  );

  assert.equal(resolved, "ops_team:north_america");
});

test("owner resolution rejects invalid signed-header signature", () => {
  assert.throws(
    () =>
      resolveOwnerIdForRequest(
        createRequest({
          "x-promptfill-user-id": "Ops Team:North America",
          "x-promptfill-user-signature": "bad-signature",
        }),
        "team_default",
        {
          ownerIdMode: "signed_header",
          ownerIdSignatureSecret: "top-secret",
        }
      ),
    /Invalid owner signature/
  );
});

test("owner resolution can opt into trusted user-id header (legacy mode)", () => {
  const rawOwnerId = "Ops Team:North America";
  const signature = signOwner(rawOwnerId, "legacy-secret");

  const resolvedOwnerId = resolveOwnerIdForRequest(
    createRequest({
      "x-promptfill-user-id": rawOwnerId,
      "x-promptfill-user-signature": signature,
    }),
    "team_default",
    {
      allowUserIdHeader: true,
      ownerIdSignatureSecret: "legacy-secret",
    }
  );

  assert.equal(resolvedOwnerId, "ops_team:north_america");
});

test("owner resolution can opt into bearer hash tenancy (legacy mode)", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ authorization: "Bearer caller-token" }),
    "team_default",
    { allowBearerTokenOwnerHash: true }
  );

  assert.match(ownerId, /^token_[a-f0-9]{24}$/);
});

test("owner resolution supports explicit bearer identity mode", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ authorization: "Bearer caller-token" }),
    "team_default",
    { ownerIdMode: "bearer_hash" }
  );

  assert.match(ownerId, /^token_[a-f0-9]{24}$/);
});

test("owner resolution rejects bearer identity mode without token", () => {
  assert.throws(
    () =>
      resolveOwnerIdForRequest(createRequest(), "team_default", {
        ownerIdMode: "bearer_hash",
      }),
    /Bearer token is required/
  );
});

test("owner resolution sanitizes fallback owner id", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest(),
    "  North America Team ###  "
  );

  assert.equal(ownerId, "north_america_team");
});
