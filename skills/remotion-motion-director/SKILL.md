---
name: remotion-motion-director
description: Senior-level Remotion direction with granular brand and motion control. Use when creating or refining videos that need precise style systems, storyboarding, cinematic pacing, and iterative quality critique (Apple-inspired restraint, without copying Apple assets).
metadata:
  version: 0.3.1
  tags: remotion, motion-design, brand-system, storyboard, creative-direction
---

# Remotion Motion Director

Use this skill when video quality matters as much as code quality. It is designed to produce polished motion work with explicit creative rationale, not just "working animations."

## When to use

- The user asks for premium, brand-led Remotion videos.
- The user needs precise style controls beyond generic templates.
- The project needs storyboard-first execution and iterative critique loops.
- The request mentions Apple-like polish, cinematic motion, or high-end ad feel.

## Do not use

- One-off technical fixes with no design direction needs.
- Requests to copy Apple trademarks, product shots, or ad scripts exactly.

## Required workflow

1. Capture constraints:
   - Load `references/brand-control-schema.md`.
   - Fill missing inputs with explicit assumptions if the user does not provide them.
2. Set creative direction:
   - Load `references/motion-direction-principles.md`.
   - Pick one primary motion profile and one fallback profile.
3. Apply "inspired, not copied" guardrails:
   - Load `references/apple-inspired-not-copied.md`.
4. Plan before coding:
   - Produce a scene-by-scene storyboard with timing and intent.
5. Build in Remotion:
   - Load `references/remotion-implementation-map.md`.
   - Map scenes to `Composition`, `Sequence`, and timing primitives.
6. Critique and refine:
   - Load `references/production-rubric.md`.
   - Score the output, list gaps, and run at least one improvement pass.

## Output contract

Always return these artifacts:

1. Creative direction brief (message, audience, visual promise).
2. Brand and motion control sheet (tokens and knobs).
3. Storyboard with scene timing.
4. Build notes (which components/animations implement each scene).
5. QA rubric score plus next-pass deltas.

## Reusable templates

Use these before generating custom files from scratch:

- `assets/storyboard-template.md`
- `assets/motion-tokens-template.ts`
- `assets/scene-template.tsx`
- `assets/remotion-root-template.tsx`
- `assets/qa-scorecard-template.md`

## Starter example

For a runnable reference implementation, see:

- `examples/motion-director-starter/README.md`

This starter demonstrates how to wire storyboard and motion tokens into a minimal Remotion project structure.

## Quality bar

- Prioritize clarity over complexity.
- Use motion to reveal hierarchy, not decorate everything.
- Keep pacing intentional: avoid over-editing and constant movement.
- Favor consistency in spacing, typography, and timing systems.
- Respect accessibility (contrast, reduced motion options, text legibility).
- If constraints are missing, declare defaults and continue instead of blocking.

## Related skills

- `remotion-best-practices`: technical Remotion correctness.
- `create-remotion-geist`: Vercel/Geist visual language.
- `remotion-ads`: social-safe zones and campaign constraints.
- `elevenlabs-remotion`: voice pipeline for narration-led edits.

## Versioning

- Follow semantic versioning in `references/versioning-policy.md`.
- To bump versions, run `scripts/bump-version.sh`.
