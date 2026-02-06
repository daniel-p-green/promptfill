# Remotion Skill Brand Builder v1 PRD

## Objective
Build a repeatable brand-to-Remotion pipeline that converts a URL set + a small preference set into a reusable, ready-to-render brand kit for consistent output quality.

## Scope (v1)
- Output format: **portable kit folder** that can be copied into any Remotion project.
- Provide one production-grade reference kit (`stripe`) inside this repo.
- Support an 80/20 style scan from website HTML/CSS.

## Inputs
- `--url` (repeatable): brand website pages.
- `--brand-slug`: output folder key.
- Optional preferences:
  - `--format`: `reels-9x16` | `youtube-16x9` | `square-1x1`
  - `--length`: `6` | `15` | `30` | `60`
  - `--energy`: `subtle` | `medium` | `punchy`
  - `--type-vibe`: `clean` | `editorial` | `playful`

## Pipeline
1. **Scan**
   - Pull HTML and linked CSS.
   - Extract: body/headline fonts, color tokens, CSS vars, link color, button-ish styles, durations.
2. **Synthesize**
   - Build normalized token set:
     - color roles (bg/surface/text/muted/accent)
     - type scale
     - spacing/radius/shadow levels
   - Map `energy` into motion presets.
3. **Generate kit**
   - Write typed token access + provider + reusable components.
   - Write template scenes and composition registration.
4. **Verify**
   - `npm --prefix video run lint`
   - `npm --prefix video run build`

## Output Contract
For `video/src/brand-kits/<brand_slug>/`:

1. `brand/`
- `tokens.json`
- `tokens.ts`
- `fonts.ts`
- `logo.svg` (placeholder if no approved source)

2. `remotion/`
- `BrandProvider.tsx`
- `styles.ts`
- `components/Title.tsx`
- `components/Subtitle.tsx`
- `components/Badge.tsx`
- `components/Card.tsx`
- `components/CTAButton.tsx`
- `components/LowerThird.tsx`
- `motion/presets.ts`

3. `templates/`
- `HookScene.tsx`
- `ProblemSolution.tsx`
- `FeatureList.tsx`
- `CTAEndCard.tsx`

4. kit metadata
- `Root.tsx`
- `README.md`
- `rules/brand-scene-checklist.md`

## First 3 Required Templates
1. **HookScene**
- Goal: immediate brand recognition and message clarity in first 1-2 seconds.
- Must include logo placement + single clear headline.

2. **ProblemSolution**
- Goal: reveal pain point then product/system answer with visual hierarchy.
- Must use one consistent emphasis motion for the solution beat.

3. **FeatureList**
- Goal: communicate 3 core benefits with consistent card pattern and stagger.
- Must enforce max line lengths and safe readable sizes.

(CTAEndCard included in v1 for practical completeness.)

## Success Criteria
- A developer can copy one folder and render branded compositions immediately.
- New scenes use token/motion presets instead of ad-hoc style values.
- Brand kit renders with consistent spacing, typography, and motion.
- Build + lint pass in `video/`.

## Non-goals (v1)
- Pixel-perfect extraction of full design systems.
- Automated legal validation of trademarks/assets.
- Multi-brand orchestration UI.

## Risks
- Website scraping can return noisy CSS signals.
- Motion style still needs human curation for premium quality.

## Mitigations
- Keep human-in-the-loop review checklist.
- Bias toward conservative defaults when scan confidence is low.

## Rollout
1. Land scanner + stripe reference kit.
2. Validate with one additional brand URL.
3. Add generator mode in v2 (scan -> full file emit).
