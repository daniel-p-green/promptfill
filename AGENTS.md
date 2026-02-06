# PromptFill Agent Guide (AI + Humans)

This repo is being built by an AI dev team. This file exists to keep work consistent across sessions and contributors.

If you only read one thing: start with `docs/JOBS_TO_BE_DONE.md`.

## Product Decisions (PM)

These decisions are the current direction. If you disagree, open an issue or update a plan doc with a counter-proposal.

- **Native-first:** The “real” product is a **ChatGPT App built with the Apps SDK** (`chatgpt-app/`).
- **Web is a lab:** The web app (`web/`) remains valuable for fast iteration and as a standalone experience, but we do not “port the shell” into ChatGPT.
- **P0 scope:** in-chat completion of the core loop: **structure → fill → render → insert into chat**.
- **P0 persistence:** **per-chat/per-session** is acceptable. **No auth** and **no account sync** in P0.
- **P1:** account-synced template library behind auth.
- **Non-goal:** PromptFill generates prompts; it does not run them against an LLM.

## Canon (Do Not Contradict)

If another doc conflicts with these, treat it as “evolving notes” and update it.

- JTBD: `docs/JOBS_TO_BE_DONE.md`
- Spec-driven core behaviors: `spec/product-tests.json`
- Spec runner: `chatgpt-app/test/product-spec.test.js`

## Repo Tracks

- `chatgpt-app/` (Apps SDK): MCP server + inline widget. Optimize for ChatGPT UI/UX constraints.
- `web/` (Next.js): local-first library + builder + share/import/export.
- `video/` (Remotion): honest UI capture pipeline for demos.

Rule: do not introduce navigation-heavy “app shell” patterns into `chatgpt-app/`. Extract atomic capabilities as tools.

## Definition Of Done (Any Change)

- If you change extraction/render behavior:
  - Update `spec/product-tests.json`
  - Ensure `npm run test:chatgpt-app` passes
- If you change `web/` behavior:
  - Ensure `npm run test:web` passes
- Update docs when user-facing behavior changes (README, JTBD, rethink, or plan docs).
- Keep changes small and reversible (avoid “mega diffs”).

## Spec-Driven Development Workflow

Default workflow for anything non-trivial:

1. Add/modify a case in `spec/product-tests.json`
2. Run `npm run test:chatgpt-app` and confirm it fails for the right reason
3. Implement the minimal code to pass
4. Re-run tests until green
5. Commit

If a change is UI-only, add a lightweight “contract test” that asserts the invariant (e.g. “no prompt textarea in inline card”).

## Apps SDK UI Rules (Inline Card)

Optimize for ChatGPT:

- **Conversation-first:** don’t duplicate the system composer with large “paste prompt” inputs.
- **Two actions max:** one primary CTA and one optional secondary CTA.
- **No deep navigation:** no tabs, drill-ins, or multi-view state machines inside the card.
- **No nested scrolling:** card should fit content; avoid internal scroll containers where possible.
- **System look:** inherit system fonts/colors; use brand accent only for primary action emphasis.
- **Accessible:** labels, focus states, contrast, and text-resize resilience.

## Commands (Local)

From repo root:

- Web: `npm run dev:web` (http://localhost:3100)
- ChatGPT app server: `npm run dev:chatgpt-app` (http://localhost:8787/mcp)
- ChatGPT app tests: `npm run test:chatgpt-app`

ChatGPT dev-mode connector:

- `cd chatgpt-app && npm run dev`
- `ngrok http 8787`
- Use `https://<ngrok-subdomain>.ngrok.app/mcp` as the connector URL

## Recommended Skills (Team Tooling)

If using the Skills CLI ecosystem:

- Planning: `obra/superpowers@executing-plans`
- Isolation: `obra/superpowers@using-git-worktrees`
- Iteration loop: `obra/superpowers@subagent-driven-development`
- Motion direction (local): `skills/remotion-motion-director` for brand-controlled, storyboard-first Remotion execution.

Install example:

```bash
npx skills add obra/superpowers@executing-plans -g -y
```

## Security & Privacy Guardrails

- Treat all card content as potentially visible; avoid surfacing secrets or sensitive personal data.
- Never commit API keys; keep `.env*` out of git.
- Prefer read-only tools unless a write is essential; annotate tools accordingly.
