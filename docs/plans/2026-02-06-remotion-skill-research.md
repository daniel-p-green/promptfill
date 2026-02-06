# Remotion Skill Landscape and Research Notes

Date: 2026-02-06
Owner: Product/AI Team

## 1) Ecosystem scan (`find-skills`)

Queries run:

- `npx skills find remotion motion graphics`
- `npx skills find brand design system video`
- `npx skills find elevenlabs remotion`
- `npx skills find motion design principles`

High-signal skill candidates found:

1. `remotion-dev/skills@remotion-best-practices`
2. `vercel-labs/skill-remotion-geist@create-remotion-geist`
3. `maartenlouis/remotion-ads@remotion-ads`
4. `maartenlouis/elevenlabs-remotion-skill@elevenlabs-remotion`
5. `av/remotion-bits@remotion-bits`
6. `kylezantos/design-motion-principles@design-motion-principles`

## 2) Gap analysis

What existing skills do well:

- Remotion API correctness (`spring`, `interpolate`, `Sequence`).
- Strong style baseline (Geist visual language).
- Platform constraints (Reels safe zones and crop-aware outputs).
- Voiceover tooling and generation.

What they generally do not solve as a unified contract:

- Granular brand token -> motion token translation.
- Storyboard-first quality gates for premium motion craft.
- "Inspired by premium brands, not copied" guardrails.
- A built-in iterative critique rubric with release versioning.

## 3) Web research synthesis

Primary references:

- Apple Design Tips:
  - https://developer.apple.com/design/tips/
- Apple Accessibility:
  - https://developer.apple.com/accessibility/
- Remotion docs:
  - https://www.remotion.dev/docs/spring/
  - https://www.remotion.dev/docs/interpolate/
  - https://www.remotion.dev/docs/sequence/
  - https://www.remotion.dev/docs/visual-editing/
- Reels ad constraints:
  - https://www.facebook.com/business/news/your-guide-to-reels-ads
- WCAG contrast:
  - https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

Design implications extracted:

1. Clarity-first visual hierarchy should dominate motion decisions.
2. Accessibility (contrast and reduced motion) must be treated as first-class.
3. Motion quality is mostly about timing discipline and scene sequencing.
4. Platform-safe crops/safe zones are non-negotiable for social derivatives.

## 4) Product decision

Create a new skill that composes these capabilities into one workflow:

- capture constraints -> storyboard -> implement -> critique -> refine,
- with explicit brand-control schema and versioned evolution.

Implemented skill:

- `skills/remotion-motion-director/` (current version: `0.2.0`)
