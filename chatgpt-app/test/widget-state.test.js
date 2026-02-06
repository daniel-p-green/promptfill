import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("widget shows recoverable state when tool call fails", async () => {
  const html = await readFile(new URL("../src/widget/inline-card.html", import.meta.url), "utf8");

  assert.ok(
    html.includes('setStatus("Could not render. Try again.");'),
    "render failure state should tell the user they can try again"
  );
  assert.ok(
    html.includes("renderButton.disabled = false;"),
    "render button should be re-enabled after failure"
  );
});
