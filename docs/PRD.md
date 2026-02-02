# PromptFill -- Product Requirements (Web MVP)

## Summary
PromptFill is a local-first prompt library where prompts behave like reusable templates:
- Paste or write a prompt
- Auto-identify variables (AI-assisted) and sensible UI controls (text inputs, dropdowns, checkboxes)
- Fill variables in a sidebar
- Preview the rendered prompt and copy it in one click

The wedge: **"a prompt becomes a form."**

## Problem
People store prompts in docs, snippets, DMs, repos, and note apps. Reuse is painful:
- The same prompt gets copied and edited repeatedly; quality drifts across versions.
- Variable parts (names, product, audience, context) are manually updated and often missed.
- Common "choice axes" (tone, audience, format, length) live in someone's head, not in the prompt.
- Prompt libraries exist, but most treat prompts as static text, not structured templates.

## Goals (MVP)
- Make prompts easy to manage: searchable library with fast reuse.
- Make prompts flexible: variables + dropdown selectors + defaults + required fields.
- Make it feel magical: AI proposes variables and selectors from raw prompt text.
- Keep it safe and simple: local-first by default with export/import.
- "OpenAI-adjacent" aesthetic: calm, minimal, editorial, confident.

## Non-Goals (MVP)
- Running prompts against an LLM (PromptFill generates prompts; it doesn't execute them).
- Chat history, threads, tool calling, retrieval, agents, or workflow automation.
- Collaboration/multi-user sync.
- Marketplace/community prompt sharing.

## Target Users
- Primary: people who reuse prompts weekly and care about consistency.
  - Founders/PMs/marketers writing emails, launch copy, PRDs, briefs.
  - Eng leads/support leads reusing response templates and analysis prompts.
- Secondary: power users who already use text expanders/snippets and want structure.

## Core UX Loop (MVP)
1. **Capture**: create a prompt (paste/write) or import.
2. **Structure**: auto-extract variables (AI) + suggested types + suggested dropdowns.
3. **Refine**: user edits schema (rename, required, defaults, options).
4. **Fill**: sidebar renders controls for variables; user fills values quickly.
5. **Preview**: rendered prompt updates live.
6. **Copy**: one click copies the rendered prompt.

## Key Concepts
- **Prompt**: reusable template + metadata (name, tags).
- **Template**: prompt text with placeholders (e.g. `{{recipient_name}}`).
- **Variable**: typed input required to render a template (`string`, `text`, `enum`, etc.).
- **Option Set**: reusable dropdown options shared across prompts (e.g. "Tone").
- **AI Structuring**: converting raw prompt text into (template + variables + option suggestions).

## Requirements

### Library
- Create, rename, delete prompts.
- Search by name/tags/content.
- Tags (lightweight, optional).
- Duplicate prompt.

### Prompt Editor
- Rich-ish plain text editing (monospace optional), with live highlighting for placeholders.
- "Extract variables" button:
  - Runs AI structuring and shows a diff-like proposal (added/removed/renamed vars).
  - Never silently deletes user-defined fields.
- Manual variable creation (fallback).

### Variable Types (MVP)
- `string`: single-line text.
- `text`: multi-line text.
- `boolean`: checkbox.
- `number`: numeric input.
- `enum`: single select.
- `multi_enum`: multi select (optional MVP; OK to defer).
- `json`: JSON editor (optional MVP; OK to defer).
- `secret`: masked input (optional MVP; OK to defer).
- `date`: date input (optional MVP; OK to defer).

### Sidebar "Fill" Experience
- Render input controls from variable schema.
- Required field indicators and validation.
- Defaults apply automatically.
- One-click "Reset to defaults".
- Keyboard-first: tab order, quick focus, copy shortcut.

### Preview + Copy
- Live preview of rendered prompt.
- Copy button copies rendered prompt to clipboard.
- Optional: copy in different formats (raw / markdown) if prompt type supports it (defer).

### Local-First Storage
- Data stored locally (e.g. IndexedDB/localStorage).
- Export library to JSON file.
- Import JSON file (merge strategy: keep both versions on conflict).

## AI Variable Extraction (MVP Spec)
Input: raw prompt text.

Output proposal:
- Template with placeholders normalized to `{{snake_case}}`.
- Variables map:
  - `name` (snake_case)
  - `label` (human label)
  - `type` (best guess)
  - `required` (best guess)
  - `default` (optional)
  - `selector` for enums (suggested options + maybe suggested option set name)

Heuristics before AI (to keep it fast and reduce cost):
- Recognize explicit placeholders: `[person]`, `{person}`, `{{person}}`, `<person>`.
- Convert repeated placeholders consistently.
- Infer type from keywords:
  - "tone", "audience", "format", "length", "language" -> enum suggestions.
  - "paste", "context", "notes", "transcript", "email thread" -> `text`.
  - "true/false", "include/exclude" -> `boolean`.

AI pass:
- Suggest additional implicit variables not explicitly bracketed.
- Suggest enum options (e.g. tone: concise/friendly/direct).
- Suggest grouping into reusable option sets (Tone, Audience, Output format).

User experience requirements:
- Show the proposal with an explanation ("I found 6 variables; 2 look like dropdowns").
- User can accept all, accept individually, or reject.
- Never overwrite existing values without confirmation.

## Information Architecture (MVP)
- `/` Library
- `/prompt/:id` Prompt editor (template + variables)
- `/prompt/:id/fill` Fill + Preview + Copy (can be same screen with split panes)
- `/settings` Import/Export, Option Sets, AI settings

## Design Direction ("OpenAI Adjacent")
- Visual tone: calm, high-contrast, neutral, lots of whitespace, subtle borders.
- Type: modern grotesk + mono for code-like areas; avoid playful "app" vibes.
- Color: near-white background, near-black text, a single green-ish accent.
- Components: understated cards, soft shadows (rare), thin dividers, crisp focus states.
- Motion: subtle (panel slide-in, hover affordances), never bouncy.
- Accessibility: keyboard first, visible focus, WCAG contrast targets.
- Implementation note: use the **ChatGPT Apps** Figma component library + Apps SDK UI guidelines as the design reference (even though the MVP ships as a web app).

## MVP Milestones
1. Library CRUD + local storage + search.
2. Prompt editor with placeholders + manual variables.
3. Fill sidebar + live preview + copy.
4. Option sets (reusable enums).
5. AI extraction (heuristics + model call) + "apply proposal" UX.
6. Export/import.

## Success Metrics (MVP)
- Activation: % of users who create a prompt and successfully copy a rendered prompt within 5 minutes.
- Retention: weekly returning users; prompts reused per week.
- Value: time-to-copy for a reused prompt < 10 seconds.
- Quality: % of prompts with structured variables (not just static text).

## Risks / Unknowns
- "Local-first" vs AI: users may paste sensitive text; need clear toggles and warnings.
- Variable extraction quality: must be good enough that users feel helped, not slowed down.
- Adoption: if creation is too heavy, users will fall back to plain text snippets.

## Roadmap (Post-MVP)
- Chrome/Chromium extension:
  - Save selected text as a prompt.
  - Inject variable-fill sidebar on any page (or open a side panel).
  - One-click paste rendered prompt into active input.
- ChatGPT app companion (optional):
  - Purpose: "Prompt as a form" inside ChatGPT for the last mile (extract -> fill -> render -> insert).
  - Scope: keep it focused on structuring + rendering prompts (not a full library UI port).
  - UI: inline "result" cards for quick actions; fullscreen for the multi-step builder.
  - Storage: durable libraries likely require a backend (widget state is message-scoped), so start with per-chat or account-backed sync later.
- Workspace sync + team sharing (optional).
- Prompt execution integrations (optional, likely a separate product decision).

## Open Questions
- Should prompts support multiple templates (e.g. "short" vs "long") in MVP?
- Do we want a "snippet-style quick insert" mode (like a text expander) in web MVP?
- Where does AI run by default (remote model vs local model option)?
- Do we want the ChatGPT app to be "ephemeral per chat" or "synced library" (requires auth + backend)?
