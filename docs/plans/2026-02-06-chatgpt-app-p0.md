# Native ChatGPT App P0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the PromptFill ChatGPT app feel native by enforcing a conversation-first inline card and enabling “insert rendered prompt into chat”.

**Architecture:** Keep `chatgpt-app/src/lib/promptfill-core.js` as the canonical extraction/render engine. MCP tools return structured outputs; the inline widget renders from tool results and only asks for the minimum inputs needed to complete the loop.

**Tech Stack:** Node.js, `@modelcontextprotocol/sdk`, `@modelcontextprotocol/ext-apps`, plain HTML widget, Node `node --test`.

---

### Task 1: Create A Dedicated Worktree (Isolation)

> Recommended skill: `@using-git-worktrees`

**Files:**
- None

**Step 1: Create worktree**

Run:

```bash
git status --porcelain
git worktree add ../promptfill-wt-chatgpt-app-p0 -b codex/chatgpt-app-p0
```

Expected: new folder `../promptfill-wt-chatgpt-app-p0` created.

**Step 2: Verify baseline tests**

Run:

```bash
cd ../promptfill-wt-chatgpt-app-p0
npm run test:chatgpt-app
```

Expected: PASS.

**Step 3: Commit**

Skip (no changes yet).

---

### Task 2: Add A Widget Contract Test (Conversation-First Invariant)

**Files:**
- Create: `chatgpt-app/test/widget-contract.test.js`
- Reads: `chatgpt-app/src/widget/inline-card.html`

**Step 1: Write the failing test**

Create `chatgpt-app/test/widget-contract.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("inline widget is conversation-first (no prompt textarea)", async () => {
  const html = await readFile(new URL("../src/widget/inline-card.html", import.meta.url), "utf8");
  assert.ok(!html.includes('id="prompt-input"'));
  assert.ok(!html.toLowerCase().includes("paste a rough prompt here"));
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd chatgpt-app
npm test
```

Expected: FAIL (current widget includes a prompt textarea).

**Step 3: Commit**

Skip (keep failing tests uncommitted).

---

### Task 3: Make The Inline Widget Tool-Result Driven (No Prompt Input UI)

**Files:**
- Modify: `chatgpt-app/src/widget/inline-card.html`
- Test: `chatgpt-app/test/widget-contract.test.js`

**Step 1: Implement minimal conversation-first UI**

In `chatgpt-app/src/widget/inline-card.html`:

- Remove the “Prompt text” label + textarea.
- Remove the “Extract fields” button and its click handler.
- Update the empty state to instruct the user to start in conversation.

Suggested copy for empty state:

- Title: “PromptFill”
- Subtitle: “Ask ChatGPT to ‘turn this prompt into a template’ to begin.”
- Status: “Waiting for extracted fields…”

**Step 2: Keep render behavior**

The widget should:

- Listen for `ui/notifications/tool-result`
- When `structuredContent.kind === "extraction"`:
  - Save `extraction.template` + `extraction.variables`
  - Render fill fields
  - Enable `Render prompt`
- When `structuredContent.kind === "render"`:
  - Show the rendered prompt text

**Step 3: Run tests**

Run:

```bash
cd chatgpt-app
npm test
```

Expected: PASS (the contract test now passes).

**Step 4: Commit**

Run:

```bash
git add chatgpt-app/src/widget/inline-card.html chatgpt-app/test/widget-contract.test.js
git commit -m "feat(chatgpt-app): make inline widget conversation-first"
```

---

### Task 4: Add “Insert Into Chat” Using `ui/message`

**Files:**
- Modify: `chatgpt-app/src/widget/inline-card.html`
- Modify: `chatgpt-app/test/widget-contract.test.js`

**Step 1: Extend the contract test (should fail first)**

Update `chatgpt-app/test/widget-contract.test.js`:

```js
assert.ok(html.includes("ui/message"), "widget should use ui/message to insert text into chat");
assert.ok(html.includes('id="insert-button"'), "widget should include an insert button");
```

**Step 2: Run tests to confirm failure**

Run:

```bash
cd chatgpt-app
npm test
```

Expected: FAIL (no insert behavior yet).

**Step 3: Implement insert UX**

In `chatgpt-app/src/widget/inline-card.html`:

- Add a button:
  - `id="insert-button"`
  - Label: “Insert into chat”
  - Disabled until a rendered prompt exists
- Implement:

```js
async function insertIntoChat(text) {
  const result = await rpcRequest("ui/message", {
    role: "user",
    content: [{ type: "text", text }],
  });

  if (result?.isError) {
    setStatus("Could not insert into chat.");
    return;
  }

  setStatus("Inserted into chat.");
}
```

Wire the click handler to call `insertIntoChat(renderedEl.textContent)`.

**Step 4: Run tests**

Run:

```bash
cd chatgpt-app
npm test
```

Expected: PASS.

**Step 5: Commit**

Run:

```bash
git add chatgpt-app/src/widget/inline-card.html chatgpt-app/test/widget-contract.test.js
git commit -m "feat(chatgpt-app): insert rendered prompt into chat"
```

---

### Task 5: Manual Acceptance Test In ChatGPT Dev Mode

**Files:**
- Reference: `chatgpt-app/README.md`

**Step 1: Run the MCP server**

Run:

```bash
cd chatgpt-app
npm run dev
```

Expected: server logs `http://localhost:8787/mcp`.

**Step 2: Tunnel**

Run:

```bash
ngrok http 8787
```

Expected: an HTTPS URL like `https://<subdomain>.ngrok.app`.

**Step 3: Connect ChatGPT dev mode**

Use connector URL:

```txt
https://<subdomain>.ngrok.app/mcp
```

**Step 4: End-to-end flow**

In chat, try:

- “Turn this into a reusable prompt template: Write an email to [recipient name] about {topic}. Tone: {{tone}}”
- Confirm the inline widget renders fields without asking you to paste prompt text.
- Fill values, render, click “Insert into chat”.

Expected: a new user message appears containing the rendered prompt.

