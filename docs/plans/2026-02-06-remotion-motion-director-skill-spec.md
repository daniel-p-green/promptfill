# Remotion Motion Director Skill Spec (v1)

Date: 2026-02-06
Owner: Product/AI Team
Status: Approved for implementation

## 1. Problem

Current Remotion skills are strong on technical setup and common patterns, but they do not provide enough granular control for:

- brand system translation into motion tokens,
- cinematic craft decisions (pace, rhythm, restraint, emphasis),
- repeatable "premium" visual outcomes with explicit quality gates.

## 2. Goal

Create a versioned skill that helps an agent operate like a senior motion designer:

- turns brand constraints into a motion language,
- plans storyboards intentionally before coding,
- ships production-safe renders with explicit review criteria.

## 3. Non-goals

- Copying Apple visual assets, trademarks, or exact ad structures.
- One-click full automation without human review.
- Replacing existing Remotion skills (`remotion-best-practices`, `remotion-ads`, `create-remotion-geist`).

## 4. Inputs and Outputs

### Required input contract

The skill must ask for (or infer and state assumptions for):

1. Brand intent: tone, audience, promise.
2. Visual system: color tokens, typography, logo policy, spacing.
3. Motion system: tempo, transition family, kinetic intensity.
4. Channel constraints: aspect ratios, safe zones, platform placements.
5. Narrative: single core message and proof points.

### Output contract

1. A creative direction brief (one page).
2. A scene-by-scene storyboard with timing.
3. A build plan mapped to Remotion components/sequences.
4. A QA rubric with pass/fail checks.
5. A post-build refinement loop (at least one iteration).

## 5. Skill Architecture

Skill name: `remotion-motion-director`

```
skills/remotion-motion-director/
├── SKILL.md
├── references/
│   ├── motion-direction-principles.md
│   ├── brand-control-schema.md
│   ├── production-rubric.md
│   ├── apple-inspired-not-copied.md
│   └── versioning-policy.md
└── scripts/
    └── bump-version.sh
```

## 6. Workflow Requirements

The skill must enforce this sequence:

1. Briefing: identify audience, message, and desired viewer action.
2. Constraint capture: record brand and channel constraints.
3. Storyboard: no implementation before shot-level plan.
4. Build: compose scenes with explicit sequencing and animation intent.
5. Critique: run rubric and list concrete deltas.
6. Refine: apply one or more corrective passes.

## 7. Versioning

Use semantic versioning for the skill itself:

- `MAJOR`: breaking workflow or schema changes,
- `MINOR`: new references/rubrics/playbooks,
- `PATCH`: clarifications and bug fixes.

Version appears in:

- `SKILL.md` frontmatter (`metadata.version`)
- `references/versioning-policy.md` change log table.

## 8. Research Basis

The skill design should encode and cite these themes:

- Apple design values: clarity, deference, depth; accessibility and reduced motion support.
  - https://developer.apple.com/design/tips/
  - https://developer.apple.com/accessibility/
- Remotion production mechanics: spring/interpolation, sequencing, and visual editing workflow.
  - https://www.remotion.dev/docs/spring/
  - https://www.remotion.dev/docs/interpolate/
  - https://www.remotion.dev/docs/sequence/
  - https://www.remotion.dev/docs/visual-editing/
- Platform-safe social formats and crops (for campaign/video variants).
  - https://www.facebook.com/business/news/your-guide-to-reels-ads
- Accessibility contrast baseline.
  - https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

## 9. Acceptance Criteria

1. Skill can be triggered by prompts mentioning Remotion + brand style + cinematic polish.
2. Skill asks for missing constraints before generating scenes.
3. Skill provides a clear "Apple-inspired, not copied" guardrail.
4. Skill includes a reusable quality rubric and refinement loop.
5. Skill version can be incremented through a repeatable script.
