import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("fullscreen widget exposes accessible form semantics and safe delete workflow", async () => {
  const fullscreenHtml = await readFile(
    new URL("../src/widget/fullscreen-editor.html", import.meta.url),
    "utf8"
  );

  assert.match(
    fullscreenHtml,
    /id="status"[\s\S]*aria-live="polite"|aria-live="polite"[\s\S]*id="status"/,
    "fullscreen status region should announce async updates"
  );
  assert.match(
    fullscreenHtml,
    /<label[^>]+for="template-name-input"/,
    "template name input should use explicit label association"
  );
  assert.match(
    fullscreenHtml,
    /id="template-name-input"[\s\S]*name="template_name"/,
    "template name input should provide a stable name attribute"
  );
  assert.match(
    fullscreenHtml,
    /id="template-search-input"[\s\S]*name="template_search"[\s\S]*autocomplete="off"/,
    "template search input should provide name and autocomplete semantics"
  );
  assert.match(
    fullscreenHtml,
    /id="delete-template-button"/,
    "delete action should exist"
  );
  assert.match(
    fullscreenHtml,
    /window\.confirm\(/,
    "delete action should require explicit confirmation"
  );
});

test("widget copy and loading strings use typographic ellipsis", async () => {
  const inlineHtml = await readFile(new URL("../src/widget/inline-card.html", import.meta.url), "utf8");
  const fullscreenHtml = await readFile(
    new URL("../src/widget/fullscreen-editor.html", import.meta.url),
    "utf8"
  );

  const bannedPhrases = [
    "Waiting for extracted fields...",
    "Rendering prompt...",
    "Inserting into chat...",
    "Loading template...",
    "Saving template...",
    "Deleting template...",
    "Searching templates...",
    "Refreshing library...",
    "Loading starter templates...",
    "Loading version history...",
  ];

  for (const phrase of bannedPhrases) {
    assert.ok(!inlineHtml.includes(phrase), `inline widget should avoid "${phrase}"`);
    assert.ok(!fullscreenHtml.includes(phrase), `fullscreen widget should avoid "${phrase}"`);
  }
});
