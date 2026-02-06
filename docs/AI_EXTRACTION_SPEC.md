# PromptFill - AI Variable Extraction Spec (MVP)

## Purpose
Turn raw prompt text into a structured template with variables, types, and dropdown suggestions.
This powers the "Extract variables" button in the editor and must be safe, predictable, and easy to review.

## Inputs
- `raw_prompt` (string): the full prompt text as pasted/typed.
- `existing_spec` (optional): current prompt spec (template + variables + option sets).
- `locale` (optional): language hints for labels/options.

## Outputs (Proposal)
Return a proposal that can be diffed and reviewed before applying.

```json
{
  "template": "Write an email to {{recipient_name}} about {{topic}}...",
  "variables": {
    "recipient_name": {
      "type": "string",
      "label": "Recipient name",
      "required": true,
      "default": null
    },
    "tone": {
      "type": "enum",
      "label": "Tone",
      "required": true,
      "default": "concise",
      "selector": {
        "source": "static",
        "options": [
          { "id": "concise", "label": "Concise" },
          { "id": "friendly", "label": "Friendly" },
          { "id": "direct", "label": "Direct" },
          { "id": "formal", "label": "Formal" }
        ]
      }
    }
  },
  "option_sets": {
    "Tone": {
      "options": [
        { "id": "concise", "label": "Concise" },
        { "id": "friendly", "label": "Friendly" },
        { "id": "direct", "label": "Direct" },
        { "id": "formal", "label": "Formal" }
      ]
    }
  },
  "notes": {
    "warnings": [],
    "assumptions": [
      "Inferred tone dropdown from 'tone' keyword."
    ]
  }
}
```

## Variable Types (MVP)
- `string`, `text`, `number`, `boolean`, `enum`
- Optional (defer OK): `multi_enum`, `json`, `secret`, `date`

## Extraction Pipeline
1. **Heuristics pass (no model)**
   - Detect explicit placeholders:
     - `[name]`, `{name}`, `{{name}}`, `<name>`
   - Normalize to `snake_case`.
   - De-duplicate repeated placeholders.
   - Infer type from keywords:
     - tone / audience / format / length / language -> enum
     - context / notes / transcript / email thread / paste -> text
     - include / exclude / true / false -> boolean
   - Generate default labels by title-casing the name.
2. **Model pass (LLM)**
   - Identify implicit variables (e.g. "Write an email to Sarah" -> `recipient_name`).
   - Suggest enum options and defaults.
   - Suggest option set names for reuse (Tone, Audience, Format).
   - Propose minimal changes (do not explode into too many variables).

## Safety / Merge Rules
- Never overwrite existing variable definitions silently.
- If `existing_spec` is provided, the system returns:
  - `added` variables
  - `removed` variables
  - `renamed` pairs (old_name -> new_name)
  - `modified` fields (type, default, selector)
- Only apply changes the user explicitly accepts.
- Preserve any existing variable values in the fill sidebar when possible.

## Rename Detection Heuristic
- If a new variable is highly similar to an existing one (Levenshtein distance <= 2
  or strong substring match), mark as rename candidate instead of "remove + add".

## UX Requirements
- Show a proposal summary: "Found X variables, Y dropdowns, Z inferred."
- Provide accept-all and accept-individual controls.
- Provide a clear rollback path (discard proposal).

## Quality Targets
- High precision on explicit placeholders (must not mis-map).
- Conservative implicit variables: better to miss than to be noisy.
- Dropdown options should be small and high-signal (4-8 items).

## Example
Input:
```
Write an email to [person] about the Q2 pricing update.
Tone: concise.
Include context and a short CTA.
```

Output template (proposal):
```
Write an email to {{recipient_name}} about {{topic}}.
Tone: {{tone}}.
Include {{context}} and a short {{cta}}.
```

Variables:
- recipient_name: string (required)
- topic: string (required)
- tone: enum (default: concise, options: concise, friendly, direct, formal)
- context: text
- cta: string (optional)
