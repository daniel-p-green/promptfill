# PromptFill ChatGPT App Scaffold

This folder contains the ChatGPT-native PromptFill surface built with the Apps SDK:

- MCP server over `Streamable HTTP` at `/mcp`
- tool descriptors + resource registration
- inline widget (`text/html;profile=mcp-app`) using MCP Apps bridge (`ui/*`, `tools/call`)

## Tools (P0)

1. `extract_prompt_fields`
2. `render_prompt`
3. `save_template`
4. `list_templates`

Tool metadata copy standard:

- Tool descriptions should begin with `Use this when the user wants to...` so trigger intent is explicit.
- Tool metadata exposes a scoped `Open advanced editor` fullscreen handoff action for complex edits.

Current product direction:

- P0 keeps persistence session/chat scoped.
- P0 UX promise is chat scoped only (no cross-chat guarantee).
- P1 adds auth-backed durable storage.
- P1 durability target is Supabase-backed storage.
- Inline UX stays conversation-first; avoid recreating a full app shell.

## Local development

```bash
cd chatgpt-app
npm install
npm test
npm run dev
```

Server default:

- health: `http://localhost:8787/`
- MCP endpoint: `http://localhost:8787/mcp`

## Connect in ChatGPT developer mode

1. Expose local server via HTTPS tunnel, for example:

```bash
ngrok http 8787
```

2. In ChatGPT developer mode, create a connector using:

```txt
https://<your-ngrok-subdomain>.ngrok.app/mcp
```

3. Refresh connector after metadata/tool updates.

## Implementation notes

- Core extraction/render/storage logic lives in `src/lib/promptfill-core.js`.
- Widget is intentionally lightweight and conversation-first.
- A dedicated fullscreen editor resource exists for advanced edit handoff (`src/widget/fullscreen-editor.html`).
- Storage is in-memory for scaffold phase; replace with durable backend for production.
- Product behavior is spec-driven:
  - source cases: `../spec/product-tests.json`
  - runner: `test/product-spec.test.js`

Related product docs:

- `docs/JOBS_TO_BE_DONE.md`
- `docs/CHATGPT_APP_RETHINK.md`
- `docs/SPEC_TEST_CASES.md`
