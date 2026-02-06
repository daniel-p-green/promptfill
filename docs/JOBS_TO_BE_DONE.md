# PromptFill Jobs To Be Done (JTBD)

Date: 2026-02-06
Owner: Product
Status: Canon

This file is the product anchor. Other docs may evolve, but decisions in this doc drive scope and prioritization.

## Product Decision (Resolved)

We are building the real product as a ChatGPT app using the Apps SDK.

- System of record product surface: `chatgpt-app/`
- Fast prototype and UX lab: `web/`
- Marketing and narrative artifact: `video/`

Decision rule: if there is a conflict between "native Apps SDK fit" and "web shell parity", prioritize native fit.

## North Star Job

When I am about to ask an LLM for a high-stakes output, help me turn rough prompt text into a reusable, fillable prompt so I can get reliable results quickly and stay in conversation flow.

## Primary Jobs (P0)

### JTBD 1: Extract structure from rough prompt text

When I paste rough prompt text, I want fields extracted and normalized so I can reuse it without hand-editing placeholders.

- Functional outcome:
  - placeholders normalize to stable variable names (for example `{{recipient_name}}`)
  - inferred field types are useful by default (string, text, enum, boolean)
  - proposal-first behavior prevents silent schema loss
- Tooling outcome:
  - powered by `extract_prompt_fields`

### JTBD 2: Fill and render correctly in one pass

When I provide values, I want required fields validated and the final prompt rendered deterministically so I can trust the output.

- Functional outcome:
  - missing required values are explicit
  - defaults apply when value is omitted
  - rendered prompt preserves unresolved placeholders only when data is truly missing
- Tooling outcome:
  - powered by `render_prompt`

### JTBD 3: Insert rendered prompt back into the chat

When the rendered prompt looks right, I want one action to continue the conversation with that output without copying across apps.

- Functional outcome:
  - no duplicate composer UI inside the card
  - primary CTA inserts text via Apps SDK bridge (`ui/message`)
  - follow-up model turn can immediately use inserted content

### JTBD 4: Save and reuse useful templates

When a prompt works, I want to save and list it so future runs are faster and more consistent.

- Functional outcome:
  - save template with schema
  - list templates quickly for reuse
- Tooling outcome:
  - powered by `save_template` and `list_templates`

## Secondary Jobs (P1+)

- Account-synced template library with auth-backed persistence.
- Sharable template bundles with safe import behavior.
- Standardized option sets across multiple templates.

## Non-Jobs (Guardrails)

- PromptFill does not run prompts against models. It prepares prompts.
- Do not recreate ChatGPT system features (composer, chat thread, navigation shell).
- Do not turn inline cards into full dashboards or multi-tab app shells.

## Success Metrics

- Time to first correct render: median under 20 seconds from first tool call.
- Reuse speed: median under 10 seconds for saved-template fill and render.
- In-chat completion rate: user can complete extract -> fill -> render -> insert without leaving chat.
- Extraction quality: first-pass schema accepted with minor edits in most sessions.

## Spec Mapping

The following must stay in sync:

- Product test cases: `spec/product-tests.json`
- Executable spec runner: `chatgpt-app/test/product-spec.test.js`
- Core behavior implementation: `chatgpt-app/src/lib/promptfill-core.js`

Job coverage map:

- JTBD 1 -> `extraction` cases
- JTBD 2 -> `render` cases
- JTBD 4 -> `store` cases

JTBD 3 currently has a widget contract test:

- `chatgpt-app/test/widget-contract.test.js`
