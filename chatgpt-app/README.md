# PromptFill ChatGPT App Scaffold

This folder contains a minimal Apps SDK scaffold for PromptFill:

- MCP server over `Streamable HTTP` at `/mcp`
- tool descriptors + resource registration
- inline widget (`text/html;profile=mcp-app`) using MCP Apps bridge (`ui/*`, `tools/call`)

## Tools (P0)

1. `extract_prompt_fields`
2. `render_prompt`
3. `save_template`
4. `list_templates`

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
- Storage is in-memory for scaffold phase; replace with durable backend for production.
