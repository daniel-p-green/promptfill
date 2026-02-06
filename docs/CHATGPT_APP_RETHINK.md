# PromptFill ChatGPT App Rethink

Date: 2026-02-06

## Purpose

Shift PromptFill from a standalone, web-first product into a native-feeling ChatGPT app built with the Apps SDK.

This document translates OpenAI Apps SDK UX/UI principles into a concrete PromptFill product strategy and implementation plan.

## Current Reality

PromptFill today is primarily a full product shell in one screen:

- `/web/src/app/page.tsx` contains a large library + editor + settings + onboarding interface.
- `/web/src/app/inline/page.tsx` is a lightweight demo mode, but not an Apps SDK widget runtime.
- `/chatgpt-app` contains an Apps SDK scaffold (MCP server + inline widget), but it is not production-ready:
  - in-memory storage only (resets on restart)
  - no auth / account mapping
  - widget UX still needs to fully converge on "conversation-first" patterns

This is great for standalone web usage, but it overfits navigation-heavy UX patterns that do not map cleanly to ChatGPT surfaces.

## Product Thesis for ChatGPT

PromptFill should be the fastest way to go from rough prompt text to reliable reusable prompt output directly in conversation.

### What should feel uniquely better in ChatGPT

1. Natural-language entry:
   - "Turn this rough prompt into a reusable template."
2. Conversational iteration:
   - "Make tone optional and add an audience dropdown."
3. In-chat completion:
   - Extract fields, fill key values, render final prompt, continue conversation without tab switching.

## Extracted Capabilities (Do Not Port the Whole App)

### P0 tools

1. `extract_prompt_fields` (read)
   - Input: `prompt_text`
   - Output: normalized `template`, variable schema, inferred selectors/options.
2. `render_prompt` (read)
   - Input: `template`, `variables`, `values`
   - Output: `rendered_prompt`, `missing_required`
3. `save_template` (write)
   - Input: `name`, `template`, `variables`
   - Output: saved template summary
4. `list_templates` (read)
   - Input: none
   - Output: list of saved template summaries

### Why this tool shape works

- Atomic and model-friendly
- Explicit input/output contracts
- Works for both direct commands and fuzzy asks
- Supports progressive enhancement (future tools: update/delete/search/compose)

## Display Mode Strategy

### Inline card (primary)

Use for the main P0 flow:

- Provide prompt text in conversation (system composer)
- Model invokes `extract_prompt_fields`
- Fill variable values
- Render final prompt

Rules:

- Keep to one card state per turn
- Keep actions concise and limited
- Avoid nested navigation
- Avoid duplicating the system composer with large "paste prompt" inputs in the card UI

### Inline carousel (secondary)

Use only for starter templates when user asks for examples.

- 3-8 items max
- One CTA per item

### Fullscreen (secondary)

Use when the user asks for deeper editing:

- schema refinements
- many variables
- advanced template cleanup

Do not replicate the full standalone app shell in fullscreen.

### PiP (defer)

Not needed for P0. PromptFill is not a live parallel session surface.

## State Model

### P0 (No Auth) — Session/Chat Scoped

In P0, we should assume the widget is ephemeral and keep expectations tight:

- “Saved templates” may be **session-scoped** (in-memory server store) or **chat-scoped**, but are not guaranteed cross-session.
- Avoid flows that require identity, billing, or account linking.

### UI ephemeral state

Widget owned:

- selected field
- draft values in current card

### Cross-session state

Not supported in P0.

### P1 (Auth) — Account Synced

Once we add auth/account mapping, business state becomes backend-owned:

- saved templates
- variable definitions
- durable preferences

## Discovery and Metadata Plan

Metadata quality is product quality for Apps SDK.

### Naming and description principles

- Use action-oriented tool names and descriptions.
- Start descriptions with "Use this when...".
- Explicitly avoid broad/misleading trigger language.

### Golden prompt set

Maintain three buckets for ongoing metadata tuning:

1. Direct prompts (brand/tool explicit)
2. Indirect prompts (goal explicit)
3. Negative prompts (should not trigger)

Run these prompts during each iteration to improve recall and precision.

Repo harness:

- Fixture: `spec/tool-trigger-prompts.json`
- Contract test: `chatgpt-app/test/tool-trigger-eval.test.js`
- Minimum standard: each bucket (`direct`, `indirect`, `negative`) must contain at least 3 non-empty prompts.

## UX Mapping from Existing PromptFill

### Keep in ChatGPT app P0

- AI field extraction
- variable typing and defaults
- quick fill + render loop
- save and list templates

### Move to fullscreen or P1

- full template library management
- large settings panels
- import/export tooling
- long onboarding tutorial UX

### Defer

- broad extension-like workflows
- heavy advanced controls not needed for in-chat completion

## Implementation Plan

### Phase 0 (scaffold)

- Add MCP server with `registerAppTool` and `registerAppResource`
- Add one inline widget using MCP Apps bridge (`ui/*`, `tools/call`)
- Implement P0 tool handlers with predictable structured output

### Phase 1 (productionize)

- Add auth and account mapping
- persist templates in backend DB
- improve tool metadata and prompt coverage tests
- tighten CSP and domain config

### Phase 2 (UX quality)

- add starter template carousel
- add fullscreen advanced editor surface
- add accessibility polish and mobile-specific refinements

## Review Checklist (Pre-submission)

1. Conversational value is obvious and testable.
2. At least one meaningful task completes fully in-chat.
3. Tools are atomic, typed, and safely annotated.
4. Inline UX is focused and non-navigational.
5. Fullscreen is additive, not a full app port.
6. Performance keeps chat rhythm intact.
7. Sensitive data exposure is minimized in card surfaces.
8. Metadata quality tested against golden prompt set.

## Success Metrics

1. Extraction success rate: user reaches valid variable schema on first attempt.
2. Time to rendered prompt: under 20s median from first tool invocation.
3. In-chat completion rate: prompt extracted + rendered without leaving ChatGPT.
4. Save/reuse rate: templates saved and listed in future turns.

## Notes for This Repo

- Existing standalone web app remains valuable as a design/prototyping lab.
- ChatGPT app implementation should live separately (`/chatgpt-app`) to avoid coupling with standalone UX assumptions.
- Shared extraction/render logic can be reused across both surfaces over time.
