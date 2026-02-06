# PromptFill Agent Guide (AI + Humans)

This repository is operated by an AI-first dev team. The goal of this file is continuity: any contributor should be able to continue work safely with minimal context loss.

If you only read one file, read `docs/JOBS_TO_BE_DONE.md`.

## Product Truth

Current direction is resolved:

- Primary product: ChatGPT-native Apps SDK app in `chatgpt-app/`.
- Secondary lab: web prototype in `web/` for UX experimentation.
- Narrative artifact: product video in `video/`.
- PromptFill generates prompts; it does not execute prompts.

Rule: never port the full web shell into ChatGPT inline cards.

## Canon Order (When Docs Conflict)

1. `docs/JOBS_TO_BE_DONE.md` (intent)
2. `docs/PRD.md` (requirements)
3. `spec/product-tests.json` + `chatgpt-app/test/product-spec.test.js` (behavior truth)
4. `docs/USE_CASES.md` + `docs/USER_STORIES.md` (scope detail)
5. `docs/CHATGPT_APP_RETHINK.md` (strategy notes)

If you discover a conflict, update lower-priority docs in the same branch.

## Team Operating Model

Each non-trivial task follows this sequence:

1. Anchor to JTBD and active phase (P0/P1/P2).
2. Update or add spec case(s) first where behavior changes.
3. Implement minimum code to satisfy spec.
4. Run required test and lint commands.
5. Update docs and create a clear handoff summary.

Keep commits small and reversible. Avoid broad refactors in feature branches.

## Definition of Done

A change is done only if all apply:

- expected behavior is covered by tests or contract checks
- all relevant checks pass locally
- impacted docs are updated
- no unresolved TODOs or hidden assumptions remain
- branch is ready for review without oral context

## Test and Quality Gates

Run from repo root unless noted:

- `npm run test:chatgpt-app` for Apps SDK core behavior
- `npm run test:web` for web prototypes
- `npm run lint:web`
- `npm run lint:video`

If extraction/render/store behavior changes, update `spec/product-tests.json`.

If widget behavior changes, update or add a contract test in `chatgpt-app/test/`.

## Apps SDK UX Guardrails

Inline card constraints:

- conversation-first, no duplicate long-form composer
- maximum two core actions
- no deep navigation or tabbed mini-apps
- avoid nested scrolling
- preserve accessibility (labels, focus, contrast)
- prefer system visual language over custom theming

Fullscreen can be used for deeper editing, but should remain task-focused.

## Worktree and Branch Conventions

- Use isolated worktrees for major efforts.
- Use branch prefix `codex/`.
- Avoid destructive git commands.
- Do not rewrite history unless explicitly requested.

## Handoff Contract (Required in PR or summary)

Every handoff includes:

- what changed and why
- files touched
- commands run and results
- unresolved risks
- exact next recommended step

## Security and Privacy Guardrails

- treat widget/card content as potentially visible to bystanders
- do not commit secrets, tokens, keys, or `.env*`
- avoid unsafe command patterns (no `curl | bash` in normal workflow)
- prefer least-privilege tool access and explicit write actions

## Skills Baseline

Core skills for this repo:

- planning: `writing-plans`, `executing-plans`
- execution rhythm: `subagent-driven-development`, `using-git-worktrees`
- product quality: `code-review`, `qa-test-planner`, `security-review-2`
- domain: `openai-docs`, `remotion-best-practices`

Optional external skills discovered via `find-skills`:

- `trailofbits/skills@spec-to-code-compliance`
- `eddiebe147/claude-settings@roadmap-builder`

Install example:

```bash
npx skills add trailofbits/skills@spec-to-code-compliance -g -y
```
