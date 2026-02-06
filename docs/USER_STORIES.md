# PromptFill -- User Stories (Web MVP)

Stories are grouped by epics. Each story includes a minimal acceptance checklist.

## Epic A: Library

### A1. Create A Prompt
As a user, I want to create a new prompt from scratch or by pasting text, so I can reuse it later.
- Accept: I can create and it appears in the library immediately.
- Accept: The prompt has a name and editable template text.

### A2. Search Prompts
As a user, I want to search my prompt library, so I can find what I need in seconds.
- Accept: Search matches name and tags (and optionally content).
- Accept: Results update quickly as I type.

### A3. Tag Prompts
As a user, I want to tag prompts, so I can organize them loosely without folders.
- Accept: I can add/remove tags.
- Accept: I can filter by tag.

### A4. Duplicate A Prompt
As a user, I want to duplicate a prompt, so I can create variations without starting over.
- Accept: Duplicate preserves template + variables + option bindings.

## Epic B: Template Editing

### B1. Insert Variables Into Template
As a user, I want to insert variables into the template, so I can mark the parts that change.
- Accept: I can type placeholders and they are recognized/highlighted.
- Accept: Variable names are normalized (snake_case) or validated.

### B2. Live Preview While Editing
As a user, I want to preview the rendered prompt, so I can verify the template works.
- Accept: Preview updates when I change the template or variable values.

## Epic C: Variables & Validation

### C1. Add A Variable Manually
As a user, I want to add a variable with a type, so I can structure a prompt even without AI.
- Accept: Variable appears in sidebar with the correct input control.

### C2. Set Required / Defaults
As a user, I want to mark variables required and set defaults, so reuse is fast and consistent.
- Accept: Required fields show an indicator and block "Copy" until filled.
- Accept: Defaults prefill values.

### C3. Dropdown Selector (Enum)
As a user, I want dropdown selectors for common axes (tone/audience/format), so I can reuse consistent choices.
- Accept: Enum variables render a select control.
- Accept: Selected option renders correctly in the template.

## Epic D: AI-Assisted Structuring

### D1. Extract Variables From Raw Prompt (AI)
As a user, I want AI to identify variables from raw prompt text, so I don't have to manually structure everything.
- Accept: The system proposes a variable list and placeholder replacements.
- Accept: I can accept/reject changes before applying.

### D2. Suggest Types And Dropdown Options
As a user, I want AI to suggest types and dropdown options, so the sidebar UI is immediately useful.
- Accept: Suggestions include type and (for enums) options.
- Accept: I can edit type/options after applying.

### D3. Don't Destroy My Work
As a user, I want extraction to be safe, so it won't delete variables or values silently.
- Accept: Existing variables are preserved unless I explicitly remove them.
- Accept: Any renames are shown as a proposal.

## Epic E: Fill + Copy

### E1. Fill Sidebar With Keyboard
As a user, I want to fill variable values quickly, so reuse is fast.
- Accept: Tab order is sensible; inputs focus correctly.
- Accept: Enter/shortcut triggers copy.

### E2. Copy Rendered Prompt
As a user, I want to copy the rendered prompt, so I can paste it into ChatGPT or other tools.
- Accept: Copy writes exactly the rendered text to clipboard.
- Accept: Success feedback is visible but subtle.

## Epic F: Local-First Portability

### F1. Export Library
As a user, I want to export my library, so I can back it up or move machines.
- Accept: Export produces a single JSON file.

### F2. Import Library
As a user, I want to import a library JSON, so I can restore or merge prompts.
- Accept: Import merges without data loss (conflicts produce duplicates).

## Epic G: Option Sets (Reusable Dropdowns)

### G1. Create Reusable Option Sets
As a user, I want to define reusable option sets (Tone, Audience), so multiple prompts share the same dropdown.
- Accept: Option set can be created/edited in Settings.
- Accept: Prompt variables can bind to an option set.

## Future (Roadmap) -- Chromium Extension

### X1. Save Selection As Prompt
As a user, I want to highlight text on any page and save it as a prompt, so capture is frictionless.

### X2. Fill + Paste Into Active Field
As a user, I want to render a prompt and paste it directly into the active textbox, so I never context-switch.
