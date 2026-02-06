import assert from "node:assert/strict";
import test from "node:test";

import { suggestStarterTemplates } from "../src/lib/starter-templates.js";

test("starter template suggestions support use-case filtering", () => {
  const emailSuggestions = suggestStarterTemplates({ useCase: "email", limit: 10 });
  assert.ok(emailSuggestions.length >= 1);
  assert.ok(emailSuggestions.every((item) => item.use_case === "email"));
});

test("starter template suggestions support free-text query", () => {
  const suggestions = suggestStarterTemplates({ query: "support", limit: 10 });
  assert.ok(suggestions.length >= 1);
  assert.ok(
    suggestions.some((item) => item.name.toLowerCase().includes("support") || item.template.toLowerCase().includes("support"))
  );
});

test("starter template suggestions enforce limit", () => {
  const suggestions = suggestStarterTemplates({ limit: 2 });
  assert.equal(suggestions.length, 2);
});
