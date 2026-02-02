# PromptFill -- Use Cases

This list is intentionally biased toward prompts where **structure beats freeform**:
repeated reuse, stable shape, changing inputs, and recurring choice axes (tone, audience, format).

## Use Case 1: Write An Email
- Trigger: "Write an email to [person] about [topic] ..."
- Variables:
  - `recipient_name` (string, required)
  - `relationship` (enum, optional): `customer`, `investor`, `coworker`, `friend`
  - `topic` (string, required)
  - `context` (text, optional)
  - `tone` (enum, default): `concise`, `friendly`, `direct`, `formal`
  - `length` (enum, default): `short`, `medium`, `long`
  - `cta` (string, optional)
- Output: a single email body (optionally with subject line).

## Use Case 2: Rewrite With Constraints
- Trigger: "Rewrite this to be more [style] while keeping [constraints]"
- Variables:
  - `input_text` (text, required)
  - `style` (enum, default): `friendly`, `crisp`, `executive`, `casual`
  - `constraints` (text, optional)
  - `preserve_voice` (boolean, default true)
- Output: rewritten text.

## Use Case 3: Summarize Notes For An Audience
- Trigger: meeting notes -> "Summarize for [audience]"
- Variables:
  - `notes` (text, required)
  - `audience` (enum, default): `execs`, `engineering`, `sales`, `customers`
  - `tone` (enum, default): `concise`, `neutral`, `persuasive`
  - `format` (enum, default): `bullets`, `paragraphs`, `email`, `slack_update`
  - `max_bullets` (number, optional)
- Output: structured summary.

## Use Case 4: Extract Action Items
- Trigger: transcript or notes -> "Give me action items"
- Variables:
  - `source_text` (text, required)
  - `owner_style` (enum, default): `name_if_known`, `role_if_unknown`
  - `format` (enum, default): `table`, `bullets`
- Output: action items with owners and due dates (if inferred).

## Use Case 5: Create A PRD Or Brief
- Trigger: "Turn this into a PRD/brief"
- Variables:
  - `context` (text, required)
  - `audience` (enum, default): `engineering`, `leadership`, `stakeholders`
  - `doc_type` (enum, default): `prd`, `brief`, `one_pager`
  - `scope` (text, optional)
  - `constraints` (text, optional)
- Output: structured doc outline.

## Use Case 6: Generate Social / Launch Copy
- Trigger: "Write launch copy in this voice"
- Variables:
  - `product_name` (string, required)
  - `target_customer` (string, optional)
  - `key_benefits` (text, required)
  - `voice` (enum, default): `openai_adjacent`, `playful`, `bold`, `minimal`
  - `channels` (multi_enum, optional): `twitter`, `linkedin`, `email`, `landing_page`
- Output: copy variants per channel.

## Use Case 7: Customer Support Reply Template
- Trigger: reuseable support response with context and policy
- Variables:
  - `customer_message` (text, required)
  - `policy_context` (text, optional)
  - `tone` (enum, default): `empathetic`, `neutral`, `firm`
  - `resolution_options` (text, optional)
- Output: reply draft.

## Use Case 8: Engineering Code Review Prompt
- Trigger: "Review this diff for issues"
- Variables:
  - `diff` (text, required)
  - `risk_profile` (enum, default): `strict`, `balanced`, `fast`
  - `focus_areas` (multi_enum, optional): `security`, `performance`, `correctness`, `style`, `tests`
  - `output_format` (enum, default): `bullets`, `annotated`
- Output: review checklist or comments.

## Use Case 9: SQL / Analytics Query Generator
- Trigger: "Generate SQL given schema + question"
- Variables:
  - `schema` (text, required)
  - `question` (text, required)
  - `dialect` (enum, default): `postgres`, `bigquery`, `snowflake`
  - `constraints` (text, optional)
- Output: SQL + explanation.

## Use Case 10: "Rubber Duck" Problem Solving
- Trigger: "Help me think through this"
- Variables:
  - `problem` (text, required)
  - `context` (text, optional)
  - `mode` (enum, default): `ask_questions`, `propose_options`, `recommend`
- Output: structured thinking partner prompt.

## Extraction Notes (How the AI Should See These)
- Treat bracketed tokens as placeholders and normalize them.
- Suggest enums for repeated "axes" (tone/audience/format/length/dialect).
- Prefer a small number of high-leverage variables rather than over-fragmenting.
