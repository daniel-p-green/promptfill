# PromptFill ChatGPT-Native P0 Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a production-ready P0 ChatGPT-native PromptFill flow (extract -> fill -> render -> insert) with clear specs, reliable UX, and release-ready docs.

**Architecture:** Keep extraction/render/store logic centralized in `chatgpt-app/src/lib/promptfill-core.js`, expose atomic Apps SDK tools via `chatgpt-app/src/server.js`, and keep inline widget behavior minimal and conversation-first in `chatgpt-app/src/widget/inline-card.html`. Use spec-first behavior changes (`spec/product-tests.json`) plus contract tests for widget invariants.

**Tech Stack:** Node.js, Apps SDK MCP server, HTML/CSS/JS widget, Node test runner, Vitest (web), ESLint/TypeScript, Remotion for narrative assets.

---

## Estimated Timeline

- Task 1: 0.5 day
- Task 2: 1.0 day
- Task 3: 1.0 day
- Task 4: 1.0 day
- Task 5: 0.5 day
- Task 6: 0.5 day
- Task 7: 0.75 day
- **Total:** ~5.25 engineering days (single engineer), plus 0.5-1.0 day review and QA buffer.

## Execution Status (2026-02-06)

- Tasks 1-6 implemented and verified with passing checks.
- Task 7 is required and reserved for final media artifacts + README positioning updates.

## Resolved Product Decisions

1. Fullscreen advanced editing handoff ships in P0 (not behind a flag).
2. P1 durable storage target is Supabase.
   - Start with single-tenant user namespace model.
   - Defer org/team shared tenancy until after P1 stability.
3. Golden prompt ownership model:
   - Product owns prompt sets and pass/fail thresholds.
   - Engineering owns harness execution and regression reporting.
4. Ultimate demo MP4 and GIF artifacts are versioned long-term in this repo.
   - Heavy render artifacts use Git LFS.
   - README embeds should use lower-resolution GIF variants for load hygiene.
5. P0 persistence contract is strictly chat-scoped UX:
   - no cross-chat guarantee
   - process-memory reuse is implementation detail only
   - widget copy must set this expectation clearly

### Task 1: Tool Metadata and Trigger Quality Hardening

**Files:**
- Modify: `chatgpt-app/src/server.js`
- Modify: `chatgpt-app/README.md`
- Create: `chatgpt-app/test/tool-metadata.test.js`

**Step 1: Write the failing test**

```js
test("tool descriptions start with Use this when", () => {
  // load registered tool metadata and assert description style
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:chatgpt-app`  
Expected: FAIL with metadata description assertion errors.

**Step 3: Write minimal implementation**

```js
description: "Use this when the user wants to ..."
```

**Step 4: Run tests to verify pass**

Run: `npm run test:chatgpt-app`  
Expected: PASS.

**Step 5: Commit**

```bash
git add chatgpt-app/src/server.js chatgpt-app/test/tool-metadata.test.js chatgpt-app/README.md
git commit -m "test(chatgpt-app): enforce tool metadata trigger quality"
```

### Task 2: Inline Widget State and Error UX Stabilization

**Files:**
- Modify: `chatgpt-app/src/widget/inline-card.html`
- Create: `chatgpt-app/test/widget-state.test.js`
- Modify: `chatgpt-app/test/widget-contract.test.js`

**Step 1: Write the failing test**

```js
test("widget shows recoverable state when tool call fails", async () => {
  // mock rpc failure and assert fallback UI copy
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:chatgpt-app`  
Expected: FAIL with missing error-state assertions.

**Step 3: Write minimal implementation**

```js
setStatus("Could not render. Try again.");
```

**Step 4: Run tests to verify pass**

Run: `npm run test:chatgpt-app`  
Expected: PASS.

**Step 5: Commit**

```bash
git add chatgpt-app/src/widget/inline-card.html chatgpt-app/test/widget-state.test.js chatgpt-app/test/widget-contract.test.js
git commit -m "feat(chatgpt-app): add inline error and retry states"
```

### Task 3: Fullscreen Advanced Editing Handoff (P0 Required)

**Files:**
- Create: `chatgpt-app/src/widget/fullscreen-editor.html`
- Modify: `chatgpt-app/src/server.js`
- Create: `chatgpt-app/test/fullscreen-contract.test.js`
- Modify: `chatgpt-app/README.md`

**Step 1: Write the failing test**

```js
test("inline card offers fullscreen handoff action for advanced edits", async () => {
  // assert action registration and resource availability
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:chatgpt-app`  
Expected: FAIL with missing fullscreen resource/action.

**Step 3: Write minimal implementation**

```js
registerAppResource("fullscreen_editor", { /* scoped advanced edit view */ });
```

Also expose this in the inline card path as a first-class action for advanced schema edits.

**Step 4: Run tests to verify pass**

Run: `npm run test:chatgpt-app`  
Expected: PASS.

**Step 5: Commit**

```bash
git add chatgpt-app/src/widget/fullscreen-editor.html chatgpt-app/src/server.js chatgpt-app/test/fullscreen-contract.test.js chatgpt-app/README.md
git commit -m "feat(chatgpt-app): add scoped fullscreen advanced editing handoff"
```

### Task 4: Persistence Adapter Seam for P1

**Files:**
- Create: `chatgpt-app/src/lib/template-store-adapter.js`
- Create: `chatgpt-app/src/lib/supabase-template-store.js`
- Modify: `chatgpt-app/src/lib/promptfill-core.js`
- Modify: `chatgpt-app/src/server.js`
- Create: `chatgpt-app/test/store-adapter.test.js`

**Step 1: Write the failing test**

```js
test("store adapter supports in-memory implementation and future backend swap", () => {
  // assert shared adapter interface
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:chatgpt-app`  
Expected: FAIL with missing adapter abstraction.

**Step 3: Write minimal implementation**

```js
export function createTemplateStoreAdapter(kind = "memory") { /* ... */ }
```

Add a Supabase adapter stub that implements the same interface and is not yet required for P0 runtime.
Model this as single-tenant first (user-scoped templates), with schema notes for future team tenancy.

**Step 4: Run tests to verify pass**

Run: `npm run test:chatgpt-app`  
Expected: PASS.

**Step 5: Commit**

```bash
git add chatgpt-app/src/lib/template-store-adapter.js chatgpt-app/src/lib/promptfill-core.js chatgpt-app/src/server.js chatgpt-app/test/store-adapter.test.js
git commit -m "refactor(chatgpt-app): introduce template store adapter seam"
```

### Task 5: Golden Prompt and Metadata Evaluation Harness

**Files:**
- Create: `spec/tool-trigger-prompts.json`
- Create: `chatgpt-app/test/tool-trigger-eval.test.js`
- Modify: `docs/CHATGPT_APP_RETHINK.md`

**Step 1: Write the failing test**

```js
test("golden prompts contain direct, indirect, and negative buckets", async () => {
  // assert schema and minimum case counts
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:chatgpt-app`  
Expected: FAIL with missing golden prompt fixture.

**Step 3: Write minimal implementation**

```json
{ "direct": [], "indirect": [], "negative": [] }
```

**Step 4: Run tests to verify pass**

Run: `npm run test:chatgpt-app`  
Expected: PASS.

**Step 5: Commit**

```bash
git add spec/tool-trigger-prompts.json chatgpt-app/test/tool-trigger-eval.test.js docs/CHATGPT_APP_RETHINK.md
git commit -m "test(spec): add golden prompt trigger evaluation harness"
```

**Ownership note:**
- Product curates golden prompts and acceptance thresholds.
- Engineering runs and reports the harness on each release candidate.

### Task 6: Release Candidate Stabilization and Handoff

**Files:**
- Modify: `README.md`
- Modify: `docs/PRD.md`
- Modify: `docs/SPEC_TEST_CASES.md`
- Modify: `docs/plans/2026-02-06-chatgpt-native-p0-completion.md`

**Step 1: Run full verification**

Run: `npm run test:chatgpt-app && npm run test:web && npm run lint:web && npm run lint:video`  
Expected: PASS.

**Step 2: Prepare release notes**

```md
- shipped conversation-first inline flow
- verified tool contracts and spec coverage
```

**Step 3: Validate docs consistency**

Run: `rg -n "w[e]b-first|standalone[-]first|companion\\s+optional" docs README.md`  
Expected: no stale contradictions for product direction.

**Step 4: Commit**

```bash
git add README.md docs/PRD.md docs/SPEC_TEST_CASES.md docs/plans/2026-02-06-chatgpt-native-p0-completion.md
git commit -m "docs: finalize p0 release candidate handoff"
```

### Task 7: Ultimate Demo Videos, GIFs, and README Positioning

**Files:**
- Modify: `video/src/Root.tsx`
- Modify: `video/src/PromptFillDemo.tsx`
- Modify: `video/src/PromptFillFlagshipPromo.tsx`
- Modify: `README.md`
- Modify: `video/README.md`
- Create: `renders/promptfill-ultimate-web.mp4`
- Create: `renders/promptfill-ultimate-chatgpt.mp4`
- Create: `docs/media/promptfill-web-demo.gif`
- Create: `docs/media/promptfill-chatgpt-demo.gif`

**Step 1: Add or confirm dedicated compositions**

Run: `cd video && npx remotion compositions src/index.ts`  
Expected: existing or newly added compositions clearly map to:
- web app demo surface
- ChatGPT Apps SDK demo surface

**Step 2: Render ultimate demo videos**

Run:

```bash
cd video
npx remotion render src/index.ts PromptFillDemo ../renders/promptfill-ultimate-web.mp4
npx remotion render src/index.ts PromptFillFlagshipPromo ../renders/promptfill-ultimate-chatgpt.mp4
```

Expected: both MP4 files render successfully.

**Step 3: Generate README GIF artifacts**

Run:

```bash
mkdir -p ../docs/media
ffmpeg -y -i ../renders/promptfill-ultimate-web.mp4 -vf "fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ../docs/media/promptfill-web-demo.gif
ffmpeg -y -i ../renders/promptfill-ultimate-chatgpt.mp4 -vf "fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ../docs/media/promptfill-chatgpt-demo.gif
```

Expected: two lightweight GIF loops suitable for README display.

**Step 4: Update README to feature two project components**

Add a dedicated section that positions PromptFill as one project with two complementary components:

- Web App component (design/prototyping lab)
- ChatGPT Apps SDK component (native product surface)

Include both GIFs and one-line purpose statements for each.

**Step 5: Validate docs references**

Run: `rg -n "promptfill-web-demo.gif|promptfill-chatgpt-demo.gif|Web App component|ChatGPT Apps SDK component" README.md video/README.md`  
Expected: references exist and wording is consistent.

**Step 6: Run project checks and commit**

Run: `npm run test:chatgpt-app && npm run test:web && npm run lint:web && npm run lint:video`  
Expected: PASS.

Commit:

```bash
git add video/src/Root.tsx video/src/PromptFillDemo.tsx video/src/PromptFillFlagshipPromo.tsx README.md video/README.md renders/promptfill-ultimate-web.mp4 renders/promptfill-ultimate-chatgpt.mp4 docs/media/promptfill-web-demo.gif docs/media/promptfill-chatgpt-demo.gif
git commit -m "feat(video): add ultimate web/chatgpt demos and refresh readme media"
```

Artifact policy: keep MP4 and GIF deliverables versioned in git for long-term project storytelling.
Use Git LFS for heavy media (MP4), and keep embed GIFs low-resolution by default.
