# PromptFill P0 Release Notes (PR-Ready)

Date: 2026-02-06  
Branch: `codex/graveyard-shift`  
Status: Release Candidate (Ready for merge after final reviewer sign-off)

## Executive Summary

PromptFill now ships as a ChatGPT-native app experience with a complete in-chat loop:

1. Extract prompt structure from rough text.
2. Fill values and render deterministically.
3. Insert final prompt back into chat.
4. Save, search, update, version, and restore reusable templates.

The web app remains in the repo as a design/prototyping lab, not the system-of-record product surface.

## Product Decisions Locked

- Primary product surface is ChatGPT Apps SDK (`chatgpt-app/`).
- Web app (`web/`) is explicitly secondary and used for UX iteration.
- PromptFill prepares prompts; it does not execute prompts against models.
- Fullscreen advanced editor is in P0, but inline remains conversation-first.
- Durable storage target is Supabase with single-tenant owner namespace first.
- Heavy render artifacts are retained in-repo with Git LFS; README embeds use low-res GIFs.

Reference anchors:
- `docs/JOBS_TO_BE_DONE.md`
- `docs/PRD.md`
- `docs/plans/2026-02-06-chatgpt-native-p0-completion.md`

## Shipped Scope

### ChatGPT Apps SDK Component (`chatgpt-app/`)

- Tooling:
  - `extract_prompt_fields`
  - `render_prompt`
  - `save_template`
  - `list_templates`
  - `get_template`
  - `search_templates`
  - `update_template`
  - `delete_template`
  - `suggest_templates`
  - `list_template_versions`
  - `restore_template_version`
- UX:
  - Inline card for fast extract/fill/render/insert flow.
  - Fullscreen editor for advanced editing and template-library workflows.
  - Version history UI and one-click restore in fullscreen.
- Security/identity:
  - Guardrails for Supabase mode.
  - Owner resolution modes: `single_tenant`, `bearer_hash`, `signed_header`.
  - Signed-header mode requires HMAC verification.
- Persistence:
  - In-memory adapter and Supabase adapter share one store contract.
  - Supabase schema includes template versions table and RLS policies.

### Web App Component (`web/`)

- Maintained as a parallel prototyping surface for rapid UX iteration.
- Test and lint gates remain enforced.

### Media and Narrative Artifacts (`video/`, `renders/`, `docs/media/`)

- Ultimate demos:
  - `renders/promptfill-ultimate-web.mp4`
  - `renders/promptfill-ultimate-chatgpt.mp4`
- README embeds:
  - `docs/media/promptfill-web-demo.gif`
  - `docs/media/promptfill-chatgpt-demo.gif`
- Root README now positions the project as two complementary components.

## Verification Evidence

Release-candidate gates passing on current branch:

- `npm run test:chatgpt-app` (47 tests pass)
- `npm run test:web` (14 tests pass)
- `npm run lint:web`
- `npm run lint:video`
- `npm run eval:tool-routing` (strictly enforced; skips only when key is absent and strict mode is off)

Spec and contract coverage includes:

- Product behavior spec: `spec/product-tests.json`
- Tool-trigger fixture and eval harness: `spec/tool-trigger-prompts.json`, `chatgpt-app/scripts/eval-tool-routing.mjs`
- Widget and fullscreen contracts: `chatgpt-app/test/widget-contract.test.js`, `chatgpt-app/test/fullscreen-contract.test.js`
- Security and owner resolution guardrails: `chatgpt-app/test/server-security-guardrails.test.js`, `chatgpt-app/test/owner-resolution.test.js`

## Critical Rollout Risks and Mitigations

1. Native-fit regression risk  
Risk: Fullscreen/editor workflows can drift toward web-shell behavior and weaken ChatGPT-native UX.  
Mitigation: Keep inline flow primary, enforce card constraints in contract tests, and gate new fullscreen controls behind explicit JTBD value.

2. Identity misconfiguration risk  
Risk: Incorrect env config can permit unsafe owner mapping in production-like deployments.  
Mitigation: Guardrail tests enforce required auth/signature combinations; deployment checklist must require authenticated MCP requests and non-wildcard CORS.

3. Template data integrity risk  
Risk: Aggressive updates may unintentionally overwrite high-value templates.  
Mitigation: Version snapshots on save/update, restore tool + UI, and destructive tool annotations for delete operations.

4. Tool routing quality risk  
Risk: Model chooses wrong tools on fuzzy prompts, degrading trust.  
Mitigation: Golden prompt buckets (direct/indirect/negative), metadata lint tests, and recurring routing-eval updates owned by product + engineering.

5. Perceived durability risk  
Risk: Users may assume global persistence when some environments are still chat-scoped or single-tenant.  
Mitigation: Keep UX copy explicit about scope, document storage mode in runbook, and prioritize account mapping rollout before broad distribution.

## Explicit Deferrals

- Multi-user/team shared tenancy.
- Marketplace/discovery feed.
- Full account sync and org-level governance.
- Deep inline navigation patterns that replicate app shells.

## Proposed Rollout Plan

1. Internal dogfood (2-3 days): Validate extraction/render reliability and version restore behavior with real prompts.
2. Canary cohort (1 week): Enable a small trusted user set with Supabase-backed mode and signed-header identity.
3. Wider beta: Expand only if routing quality and in-chat completion metrics remain stable.

Gate to advance between stages:

- No critical security guardrail failures.
- Stable test/lint/spec gates.
- No sustained increase in restore/delete-related user incidents.

## Open Questions For Review

1. Should version restore stay immediate or add confirm-step UX for high-risk templates?
2. What minimum audit trail is required before enabling multi-user/team tenancy?
3. Should we enforce strict routing-eval in CI for all branches or only protected branches?
4. What production metric threshold defines "routing quality stable" for beta expansion?

## PR Summary Snippet (Copy/Paste)

This PR closes the PromptFill P0 release candidate scope as a ChatGPT-native app with a complete extract -> fill -> render -> insert loop, durable template-management workflows (including version history + restore), security/identity guardrails, and validated spec/contract coverage. It also finalizes media/readme positioning for a single project with two components: web prototyping lab and ChatGPT Apps SDK native product surface.
