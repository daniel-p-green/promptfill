# PromptFill Video Quality Standard

Date: 2026-02-06  
Owner: Product + Creative + Engineering  
Status: Required for all Remotion deliverables

This document defines what "great" means for PromptFill videos.

If a video does not pass this standard, it does not ship.

## Purpose

PromptFill videos must help end users immediately understand:

1. what problem they have,
2. what PromptFill does for them,
3. how it works in one simple loop,
4. why they should care now.

The quality bar is "best-in-class product storytelling," not internal project narration.

## Audience and Voice

Primary audience:

- people doing high-stakes writing work repeatedly (PMs, founders, marketers, support leads, engineers)

Voice rules:

- speak to the viewer as "you"
- focus on outcomes, not implementation internals
- avoid internal roadmap or architecture language in user-facing cuts

Do not use in end-user videos:

- "P0/P1/P2"
- "metadata quality"
- "atomic tools"
- "schema proposal-first"
- "harness"
- any TODO/debug/internal note language

## Non-Negotiable Readability Rules

All values below assume 1280x720 output.

Layout safety:

- keep all headline/body text within a safe area inset: 64px left/right, 48px top/bottom
- never place text directly over busy UI without a scrim or darkened panel

Typography:

- headline minimum: 54px
- body minimum: 28px
- caption/chip minimum: 20px
- maximum line length: 42 characters for headlines, 62 characters for body text
- maximum on-screen lines: 2 headline lines, 3 body lines

Contrast:

- minimum 4.5:1 for body text
- minimum 3:1 for large headline text

Motion and timing:

- each primary message stays readable for at least 2.0 seconds
- avoid moving text and dense UI simultaneously
- transitions should support clarity (not distract), target 10-20 frames at 30fps

Scene density:

- one core message per scene
- max 2 supporting bullets per scene (unless scene is explicitly a list)
- never stack more than 3 text containers over UI at once

## Narrative Rules (End-User First)

Every video should follow this narrative shape:

1. Problem in plain language
2. PromptFill action (extract -> fill -> render -> insert)
3. User outcome (time saved, consistency gained, context switching removed)
4. Optional reuse callout (save/list template)

Required clarity:

- show the product loop once, clearly, end-to-end
- explain benefits in user terms ("faster," "consistent," "less rework")
- avoid feature dumping

Compelling scenes must answer one user question immediately:

- "What pain am I feeling right now?"
- "What does PromptFill do for me in this moment?"
- "What changed after I used it?"

If a scene cannot be summarized in one sentence for one of those questions, it is too vague.

## "Late to Class" Failure Modes (Blockers)

Reject any cut that has one or more of:

- overlapping text or clipped text
- text blending into background due to weak contrast
- jargon-first messaging that sounds internal
- notes/debug copy accidentally visible
- more than one competing headline on screen
- UI + overlay animation that makes either unreadable
- unclear "so what?" outcome by the final scene

Additional blockers:

- abstract headline with no user action ("better workflows", "smarter tooling")
- scene copy that only describes UI controls, not user outcomes
- more than 14 words in a headline line
- repeating the same claim across 2+ consecutive scenes

## Language Quality Guardrails

Headline quality rules:

- start with a verb or direct outcome
- keep to 6-12 words when possible
- prefer concrete nouns ("email updates", "support replies", "PRD draft")

Body copy rules:

- one claim per sentence
- no stacked clauses joined by commas
- use plain words over product jargon

Banned language in end-user cuts:

- "workflow optimization"
- "enterprise-grade"
- "metadata"
- "deterministic architecture"
- "harness/eval"
- "P0/P1/P2"

## Creative Quality Rubric (18 points)

Score each category 0-3:

- Clarity of core message
- Readability of text (size, contrast, spacing)
- Narrative flow (problem -> action -> outcome)
- End-user relevance (no internal language)
- Visual polish (intentional composition, no clutter)
- Product truthfulness (honest UI, no misleading claims)

Shipping threshold:

- minimum 15/18 overall
- and no category below 2

## Production Workflow (Required)

### 1) Script pass (before animation)

For each scene, write:

- scene purpose (1 sentence)
- on-screen headline (max 2 lines)
- supporting text (max 3 lines)
- user outcome statement

### 2) Layout pass (before full render)

Generate stills from midpoint of each scene and verify:

- no overlap/clipping
- readable at 100% and 75% zoom
- safe-area compliance
- contrast compliance
- headline/body/chip sizes meet minimums
- only one core message visible per scene

### 3) Playback pass (before merge)

Watch full cut at 1x and verify:

- no unreadable moments
- message remains understandable with audio muted
- first-time viewer can explain value proposition in one sentence

## Definition of Done for Video PRs

A video PR is done only when:

- it references this standard in the PR description
- rubric score is included (with category scores)
- midpoint stills are attached for each scene
- at least one reviewer confirms end-user clarity
- rendered artifacts are generated and named consistently

## References

- `/Users/danielgreen/Documents/GitHub/promptfill-wt-chatgpt-app-p0/docs/JOBS_TO_BE_DONE.md`
- `/Users/danielgreen/Documents/GitHub/promptfill-wt-chatgpt-app-p0/docs/USER_STORIES.md`
- `/Users/danielgreen/Documents/GitHub/promptfill-wt-chatgpt-app-p0/docs/PRD.md`
- `/Users/danielgreen/Documents/GitHub/promptfill-wt-chatgpt-app-p0/docs/USE_CASES.md`
