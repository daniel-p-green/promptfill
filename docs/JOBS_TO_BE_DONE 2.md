# PromptFill Jobs To Be Done (JTBD)

Date: 2026-02-06

This doc defines the stable "jobs" PromptFill should do for users, independent of surface area:

- **Web MVP** (`/web`): local-first prompt library + builder.
- **ChatGPT App** (`/chatgpt-app`): in-chat structuring + fill + render, optimized for conversation.

Treat the rest of the docs as evolving implementation ideas; this is the anchor for product intent.

## North Star Job

When I'm about to ask an LLM to produce something that matters, I want to **turn messy prompt text into a reusable, fillable template** so I can get **consistent results quickly** without forgetting variables or retyping "choice axes" like tone/audience/format.

## Primary Jobs

### JTBD 1: Structure A Prompt (Template + Fields)

When I have a rough prompt (or one I keep copy/pasting), I want PromptFill to extract the variable parts and suggest sensible field types so I can reuse it reliably.

- Triggers: "Turn this into a template", pasting a prompt with `[brackets]` / `{placeholders}` / `{{vars}}`, or asking for "a reusable version".
- Desired outcomes:
  - Variables normalized (e.g. `{{recipient_name}}`), stable names.
  - Field types suggested for common axes (tone/audience/format/length).
  - Safe-by-default changes: proposals should not silently delete user work.
- Surface notes:
  - ChatGPT App: conversation-first entry (the composer is the input).
  - Web: paste/edit in the editor, then "Extract variables".

### JTBD 2: Fill Fast, Render Correctly

When I’m reusing a template, I want to fill only what’s needed (with defaults and validation) and get the final rendered prompt so I can paste it (or continue the chat) with confidence.

- Desired outcomes:
  - Required fields are obvious; missing fields are called out.
  - Defaults reduce typing.
  - Rendered output is predictable and "copy-ready".
- Surface notes:
  - ChatGPT App: "rendered prompt" should be easy to send back into the conversation.
  - Web: one-click copy with subtle feedback.

### JTBD 3: Iterate With Conversation, Not Navigation

When I’m unsure how to structure something, I want to refine the template and schema by talking ("make tone optional", "add an audience dropdown") so I can converge quickly without hunting through settings.

- Desired outcomes:
  - Small, atomic edits that can be applied safely.
  - Clear summaries of what changed.
  - No deep navigation required for the common loop.

### JTBD 4: Reuse A Library (Without Getting Lost)

When I’ve saved templates before, I want to find and reuse them quickly so I can stay in flow.

- Desired outcomes:
  - Quick list/search/choose.
  - Reuse feels like "fill + render", not "open an app".
- Surface notes:
  - Web: library UX is a core feature.
  - ChatGPT App: start with per-chat reuse; account sync can be P1.

## Secondary Jobs (P1+)

- Share a template (and its schema) with a teammate.
- Standardize option sets ("Tone", "Audience") across many templates.
- Portability (export/import) with merge safety.

## Non-Jobs (Guardrails)

- Prompt execution (running against an LLM) is out of scope: PromptFill generates prompts, it does not run them.
- Long-form content browsing, dashboards, ads, or marketing messaging inside ChatGPT surfaces.
- Rebuilding ChatGPT’s system composer or chat features inside a widget.

## Success Metrics (Cross-Surface)

- Time to first correct render (median): < 20 seconds from first tool invocation.
- Reuse speed: < 10 seconds to render a saved template with defaults.
- Extraction quality: majority of templates "work" without manual schema surgery.

## Spec-Driven Development Hooks

These jobs should map to runnable "product tests":

- `spec/product-tests.json` (machine-readable cases)
- `chatgpt-app/test/product-spec.test.js` (runner against core logic)

