# PromptFill Product Requirements

Date: 2026-02-06
Owner: Product
Status: Active (v2, ChatGPT-native, P0 release candidate)

## Summary

PromptFill turns rough prompt text into a reusable, fillable template directly in ChatGPT conversation flow.

Core promise: a prompt becomes a form, then returns to chat in one move.

## Product Direction (Resolved)

- Primary product: ChatGPT app built with Apps SDK (`chatgpt-app/`).
- Secondary surface: web app as design/prototyping lab (`web/`).
- PromptFill generates prompts but does not execute prompts against LLMs.
- Fullscreen advanced editing handoff ships in P0.

## Problem

Prompt reuse currently breaks in three ways:

- prompt variants drift across copies
- variable edits are missed under time pressure
- choice axes (tone, audience, format) are inconsistent

Traditional prompt libraries help with storage but not in-chat completion speed.

## Users

- Primary: people who repeatedly author high-stakes prompts (PMs, founders, marketers, support leads, engineers).
- Secondary: teams that need a shared structure for recurring prompt tasks.

## P0 Goal

Enable in-chat completion of the loop:

1. extract fields from rough prompt text
2. fill values quickly
3. render final prompt
4. insert rendered result back into conversation

## Non-Goals (P0)

- account sync and identity
- collaborative libraries
- marketplace and discovery feed
- full app-shell navigation inside inline cards

## Core Jobs To Support

Canonical JTBD lives in `docs/JOBS_TO_BE_DONE.md`.

P0 jobs:

- structure rough prompt text safely
- fill and render predictably
- insert rendered output into chat
- save and list reusable templates

## Functional Requirements (P0)

### Tool layer

Required tools:

1. `extract_prompt_fields`
2. `render_prompt`
3. `save_template`
4. `list_templates`

Tool contracts must be explicit, typed, and deterministic.

### Widget layer

- inline card remains conversation-first (no duplicate long-form composer)
- max two primary actions
- one clear insert action to `ui/message`
- no deep navigation or nested scrolling patterns

### State model

- P0 persistence contract is chat scoped
- no guarantee of cross-chat or cross-session durability
- process memory reuse is implementation detail, not product promise
- P1 adds auth-backed persistent storage

## Quality Requirements

### Performance

- first useful extraction result under 2 seconds for common prompts
- render results should feel immediate

### Reliability

- product behavior codified in spec tests:
  - `spec/product-tests.json`
  - `chatgpt-app/test/product-spec.test.js`

### Accessibility

- keyboard navigable inline card controls
- visible focus states
- readable contrast and text resizing tolerance

### Privacy and safety

- do not surface sensitive data unnecessarily in widget cards
- no silent schema-destructive updates during extraction

## Success Metrics

- in-chat completion rate for extract -> fill -> render -> insert
- time to first correct render (median < 20 seconds)
- save and reuse conversion from first successful render

## Milestones

### Phase P0 (current)

- production-hardened tool contracts
- conversation-first inline card
- spec-driven behavior suite for extraction/render/store
- scoped fullscreen advanced editing handoff
- golden prompt metadata harness with direct/indirect/negative buckets

### Phase P1

- auth and account mapping
- durable template persistence on Supabase
- single-tenant user-scoped storage model first
- org/team shared tenancy deferred until after P1 stabilization
- search/update/delete template tools

### Phase P2

- starter template carousel
- stronger metadata tuning and multi-tool composition

## Release Candidate Verification (2026-02-06)

The release-candidate gate ran successfully with:

- `npm run test:chatgpt-app`
- `npm run test:web`
- `npm run lint:web`
- `npm run lint:video`

## Risks

- over-porting the web shell into ChatGPT reduces native fit
- extraction quality regressions can break trust quickly
- unclear state expectations can create user confusion

## Decision Rules

- if a feature improves web UX but weakens chat-native UX, defer it from P0
- if behavior is important, encode it in spec tests before implementation
- if a card needs app-like navigation, move the flow to fullscreen or future phase

## Operational Ownership

- Product owns golden prompt sets and trigger quality thresholds.
- Engineering owns evaluation harness execution and release-gate reporting.

## Media Artifact Policy

- Keep ultimate demo MP4 and GIF assets in-repo for long-term project packaging.
- Track heavy render artifacts (for example MP4) with Git LFS.
- Keep README embed GIFs low-resolution by default for load hygiene.
