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

## Security and session controls

Environment variables:

- `PROMPTFILL_TEMPLATE_STORE_KIND` (`memory` by default, `supabase` for durable single-tenant storage)
- `PROMPTFILL_AUTH_TOKEN` (optional bearer token; when set, MCP requests require `Authorization: Bearer <token>`)
- `PROMPTFILL_ALLOWED_ORIGINS` (optional comma-separated origin allowlist; defaults to ChatGPT + localhost patterns)
- `PROMPTFILL_WIDGET_DOMAIN` (optional widget origin override for `_meta.ui.domain`; defaults to `https://web-sandbox.oaiusercontent.com`)
- `PROMPTFILL_SINGLE_TENANT_USER_ID` (single-tenant namespace id for Supabase persistence; defaults to `promptfill_single_tenant`)
- `PROMPTFILL_SUPABASE_URL` (required when `PROMPTFILL_TEMPLATE_STORE_KIND=supabase`)
- `PROMPTFILL_SUPABASE_KEY` (required when `PROMPTFILL_TEMPLATE_STORE_KIND=supabase`)
- `PROMPTFILL_SUPABASE_TABLE` (optional; defaults to `promptfill_templates`)

Session behavior:

- each MCP session gets an isolated template store in P0
- `save_template` and `list_templates` never share state across different MCP session ids
- deleting a session (`DELETE /mcp` with session id) clears in-memory session state
- when `PROMPTFILL_TEMPLATE_STORE_KIND=supabase`, template persistence is owner-scoped by single-tenant namespace

Supabase schema bootstrap:

```bash
psql "$PROMPTFILL_SUPABASE_URL" -f chatgpt-app/supabase/promptfill_templates.sql
```

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
- Storage is in-memory per MCP session for P0; replace with durable backend for production.
- Product behavior is spec-driven:
  - source cases: `../spec/product-tests.json`
  - runner: `test/product-spec.test.js`
- Runtime protocol/tool behavior is validated through MCP integration tests:
  - `test/mcp-runtime.test.js`

Related product docs:

- `docs/JOBS_TO_BE_DONE.md`
- `docs/CHATGPT_APP_RETHINK.md`
- `docs/SPEC_TEST_CASES.md`
