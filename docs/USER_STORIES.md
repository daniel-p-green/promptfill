# PromptFill User Stories

Date: 2026-02-06
Owner: Product
Status: Active (ChatGPT-native P0)

Stories below represent what must work in production for the Apps SDK product direction.

## Epic A: Conversational Entry

### A1. Start from natural language

As a user, I want to ask in plain language for prompt structuring so I can begin without learning tool syntax.

- Accept: direct commands and fuzzy asks can both lead to extraction.
- Accept: user does not need to fill a large custom input form inside the widget.

### A2. Start from rough prompt text

As a user, I want to paste rough prompt text and have fields extracted so I can reuse it quickly.

- Accept: placeholders normalize to canonical `{{snake_case}}`.
- Accept: extracted field list is explicit and stable.

## Epic B: Structure Safely

### B1. Infer useful variable types

As a user, I want field types inferred so the default form is useful immediately.

- Accept: enum fields infer sensible options for common axes.
- Accept: text-heavy fields are inferred as multi-line text when appropriate.

### B2. Avoid silent schema loss

As a user, I want safe extraction behavior so my prior work is not silently destroyed.

- Accept: schema changes are proposal-first.
- Accept: destructive changes require explicit confirmation.

## Epic C: Fill and Render

### C1. Fill required values fast

As a user, I want required fields and defaults handled clearly so I can render with confidence.

- Accept: missing required fields are shown explicitly.
- Accept: defaults are applied when value is omitted.

### C2. Render deterministic output

As a user, I want the rendered prompt to be deterministic so repeated runs are reliable.

- Accept: explicit values override defaults.
- Accept: unresolved placeholders remain visible when values are missing.

## Epic D: Continue In Chat

### D1. Insert output without context switching

As a user, I want to send the rendered prompt back into chat in one action so I stay in flow.

- Accept: widget supports `ui/message` insertion action.
- Accept: no duplicate composer controls inside the widget.

## Epic E: Reuse Templates

### E1. Save successful templates

As a user, I want to save working prompt structures so future tasks are faster.

- Accept: template name, template text, and schema are stored together.

### E2. List saved templates

As a user, I want to list prior templates so I can reuse proven prompt structures.

- Accept: listing works within P0 state constraints (session/chat scoped).

## Epic F: P1 Durability (Post-P0)

### F1. Account-backed persistence

As a user, I want my templates to persist across sessions and devices.

- Accept: auth and account mapping are in place.
- Accept: same template library is available in future chats.

## Story to Spec Mapping

These stories should map to spec coverage:

- extraction and normalization stories -> `spec/product-tests.json` `extraction`
- fill/render stories -> `spec/product-tests.json` `render`
- save/list stories -> `spec/product-tests.json` `store`
- insert-in-chat story -> `chatgpt-app/test/widget-contract.test.js`
