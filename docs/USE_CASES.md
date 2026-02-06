# PromptFill Use Cases

Date: 2026-02-06
Owner: Product
Status: Active (aligned to ChatGPT-native P0)

This set is prioritized for in-chat completion and model-friendly tool invocation.

## Prioritization Framework

A use case is P0-ready when it has:

- stable structure across repeated requests
- clear variable axes
- compact enough output for inline workflow
- obvious extract -> fill -> render -> insert value

## P0 Use Cases (Build Now)

### Use Case 1: Email drafts

- Trigger examples:
  - "Turn this outreach prompt into a reusable template."
  - "Render this email prompt for Alex in a direct tone."
- Common fields:
  - `recipient_name`, `topic`, `tone`, `context`
- Why P0:
  - high repeat frequency and clear structure

### Use Case 2: Summaries by audience

- Trigger examples:
  - "Summarize these notes for execs in bullets."
  - "Make this an engineering-ready summary template."
- Common fields:
  - `notes`, `audience`, `format`, `length`
- Why P0:
  - reliable enum inference and fast in-chat output

### Use Case 3: Rewrite with constraints

- Trigger examples:
  - "Rewrite this but keep it concise and executive."
  - "Make this friendlier without changing meaning."
- Common fields:
  - `input_text`, `style`, `constraints`, `preserve_voice`
- Why P0:
  - strong fit for extract and render loops

### Use Case 4: Support response templates

- Trigger examples:
  - "Template this support reply with a firm but empathetic tone."
  - "Render this for a billing issue response."
- Common fields:
  - `customer_message`, `policy_context`, `tone`, `resolution_options`
- Why P0:
  - repeatable and high-value consistency job

### Use Case 5: PRD or brief scaffold prompts

- Trigger examples:
  - "Template this PRD prompt for stakeholder readouts."
  - "Render this brief prompt for leadership."
- Common fields:
  - `context`, `audience`, `doc_type`, `scope`, `constraints`
- Why P0:
  - high leverage for product and strategy workflows

## P1 Use Cases (After Auth + Durable Storage)

### Use Case 6: Team-shared option sets

- Job:
  - standardize shared dropdowns across templates
- Dependency:
  - account-backed persistence and template ownership

### Use Case 7: Cross-session prompt packs

- Job:
  - reliable save, retrieve, and reuse across multiple chats and devices
- Dependency:
  - synced backend and identity layer

## Defer / Not P0

- Very long-form multi-step flows that need app navigation
- Anything requiring PromptFill to execute prompts against models
- Heavy dashboard-style analytics inside inline cards

## Tool Trigger Expectations

Each P0 use case should map cleanly to existing tools:

- `extract_prompt_fields`: convert rough prompt text into schema
- `render_prompt`: produce deterministic prompt output with validation
- `save_template`: persist working prompt shape for reuse
- `list_templates`: recover prior templates for fast reruns

When a use case cannot be served by this tool set, it is either P1 or out of scope.
