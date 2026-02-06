import assert from "node:assert/strict";
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

test("owner resolution can opt into trusted user-id header", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ "x-promptfill-user-id": "Ops Team:North America" }),
    "team_default",
    { allowUserIdHeader: true }
  );

  assert.equal(ownerId, "ops_team:north_america");
});

test("owner resolution can opt into bearer hash tenancy", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest({ authorization: "Bearer caller-token" }),
    "team_default",
    { allowBearerTokenOwnerHash: true }
  );

  assert.match(ownerId, /^token_[a-f0-9]{24}$/);
});

test("owner resolution sanitizes fallback owner id", () => {
  const ownerId = resolveOwnerIdForRequest(
    createRequest(),
    "  North America Team ###  "
  );

  assert.equal(ownerId, "north_america_team");
});
