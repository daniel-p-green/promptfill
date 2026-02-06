# PromptFill Video Quality Standard

Date: 2026-02-06
Audience: end users (people reusing prompts in real work)

This standard defines what "great" looks like for PromptFill videos. If a scene fails these checks, it is not release-ready.

## Core Narrative Rules

1. Speak to user outcomes, not product internals.
2. Keep one message per scene: problem, action, or outcome.
3. Use concrete language tied to a real job:
   - outreach emails
   - executive summaries
   - support replies
   - PRDs and briefs
4. Prefer verbs users use in daily work: write, fill, copy, reuse, share.
5. Avoid platform hype and internal wording.

## Readability Rules

1. Headline max: 2 lines.
2. Headline max length target: 7 words.
3. Body max: 2 short sentences.
4. Keep text inside safe area:
   - left/right padding >= 48 px
   - top padding >= 40 px
   - bottom padding >= 40 px
5. Never place white text directly on busy UI without a dark scrim.
6. Keep contrast high:
   - white text on dark surfaces
   - secondary text opacity >= 0.72
7. Do not stack more than 2 overlay cards in the same vertical column.

## Copy Rules

Use this shape for most scenes:
- `Problem`: what slows the user down
- `Action`: what PromptFill lets them do
- `Outcome`: speed or consistency gained

Preferred style:
- short verbs
- specific nouns
- positive, direct statements
- no filler adjectives

## Banned Language

Do not use this wording in end-user videos:
- "loop coverage"
- "OpenAI-adjacent"
- "high-frequency prompt work"
- "workflow activation"
- "safe modal" (unless compliance context is required)
- "flagship film"

Replace with user-facing language:
- "do this task faster"
- "get consistent output"
- "reuse what already works"

## Technical Delivery Rules

1. Scene durations must leave enough read time:
   - headline visible >= 2.5s
   - body visible >= 2.0s
2. Add fade or spring entrances only when they improve legibility.
3. Do not animate every element at once.
4. Keep visual focus on one area of the UI per beat.

## Release Checklist

Before publishing any video:

0. Use Node.js LTS for Remotion (`node@20` recommended).
1. Render midpoint stills for every composition.
2. Check at 100% and 75% zoom:
   - no text clipping
   - no overlap with UI hotspots
   - clear hierarchy (headline > body > tags)
3. Confirm every scene can be summarized in one sentence.
4. Confirm language maps to JTBD outcomes from:
   - `docs/JOBS_TO_BE_DONE.md`
   - `docs/USER_STORIES.md`
   - `docs/PRD.md`
   - `docs/USE_CASES.md`

## Verification Commands

Run these from repo root:

```bash
npm run test:chatgpt-app
npm run test:web
npm run lint:web
npm run lint:video
```

Midpoint stills (example):

```bash
mkdir -p renders/stills
cd video
npx remotion still src/index.ts PromptFillFlagshipPromo ../renders/stills/promptfill-flagship-mid.png --frame=720 --quiet
```
