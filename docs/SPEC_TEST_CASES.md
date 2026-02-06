# PromptFill Spec-Driven Test Cases

Date: 2026-02-06
Owner: Product + Engineering
Status: Active

This document explains how to use the product spec tests as the source of truth for behavior changes.

## Purpose

PromptFill should evolve by changing spec cases first, then implementation. This keeps product decisions explicit and testable.

Primary artifacts:

- Machine-readable spec: `spec/product-tests.json`
- Spec runner: `chatgpt-app/test/product-spec.test.js`
- Core logic under test: `chatgpt-app/src/lib/promptfill-core.js`

## Coverage Matrix

### Extraction cases (`extraction`)

- `email_basic`: mixed placeholder syntax normalizes to canonical template.
- `boolean_inference`: boolean hint inference and default handling.
- `enum_axes`: enum inference for audience/format/length and defaults.
- `repeated_placeholder_name_dedup`: repeated placeholder emits one variable definition.
- `mixed_styles_and_normalization`: punctuation and spacing normalize to snake case names.
- `no_placeholders_no_variables`: no placeholders yields unchanged template and empty variable map.

### Render cases (`render`)

- `render_missing_required`: required missing value is flagged while defaults still render.
- `render_with_defaults`: required enum field can render from default when user omits value.
- `render_boolean_default_false`: boolean defaults serialize predictably.
- `render_prefers_explicit_value`: explicit user value overrides default.
- `render_keeps_unknown_placeholder`: unknown placeholders remain literal.
- `render_missing_required_without_default`: empty required value blocks completion.

### Store cases (`store`)

- `save_and_list`: save one template and list it.
- `save_two_templates_in_order`: insertion order is stable.
- `overwrite_template_same_id`: save with same id overwrites data without duplicate rows.

## Operating Procedure

1. Add or update one spec case in `spec/product-tests.json`.
2. Run `npm run test:chatgpt-app`.
3. If the spec is intentionally ahead of implementation, keep the failing case in draft branch only.
4. Implement minimum code needed for pass.
5. Re-run `npm run test:chatgpt-app` until fully green.
6. Update product docs if behavior changed for users.

## Quality Rules

- Prefer one behavior per case id.
- Use realistic prompt text, not synthetic edge-only fixtures.
- Keep outputs deterministic to avoid flaky tests.
- Add cases for regressions before fixing implementation.
- Do not add broad hidden behavior. If it matters, codify it in spec.

## Next Test Backlog (Not Yet Automated)

- Widget interaction contracts beyond `ui/message` insertion.
- Per-chat persistence lifecycle expectations.
- Fullscreen handoff behavior for advanced edits.
- Golden prompt metadata recall/precision checks.
