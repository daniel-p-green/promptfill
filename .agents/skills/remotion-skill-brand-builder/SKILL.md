---
name: remotion-skill-brand-builder
description: Build an on-brand Remotion foundation by running a question-heavy brand intake, scraping style signals from websites, and generating reusable brand tokens, motion presets, and composition defaults for consistent high-quality video output.
---

# Remotion Skill Brand Builder

Use this skill when the user wants to:
- Create a branded Remotion system from scratch
- Match an existing website, product UI, or brand guide
- Improve consistency across multiple videos/compositions
- Turn brand strategy into reusable animation tokens and presets

## Workflow

### 1) Run a deep intake interview
Ask one question at a time and collect concrete answers. Use the question bank in `references/question-bank.md`.

Prioritize this order:
1. Business objective and success metric
2. Audience and channel constraints
3. Brand personality and anti-personality
4. Visual identity (color, type, layout)
5. Motion language (pace, easing, transitions)
6. Audio/voice rules
7. Approval constraints (legal, compliance, review loop)

If the user has limited time, switch to the "fast intake" subset in `references/question-bank.md`.

### 2) Collect reference signals from real sources
Use official sources first:
- Main website
- Product/app UI
- Brand guidelines page
- Social pages with strong brand consistency

Use the scraper script to gather candidate tokens:

```bash
python3 scripts/scrape_brand_signals.py \
  --url https://example.com \
  --url https://example.com/pricing \
  --out video/brand/research/brand-signals.json
```

Then manually verify the scraped output with screenshots and visual judgment. Scraped CSS values are hints, not ground truth.

### 3) Synthesize the brand system
Using interview answers + scraped signals, generate the deliverables in `video/brand/` following `references/output-contract.md`:
- `video/brand/BRAND_PROFILE.md`
- `video/brand/brand-tokens.json`
- `video/brand/motion-presets.ts`
- `video/brand/composition-defaults.json`
- `video/brand/scene-blueprints.md`

Copy starter examples from `assets/` if useful.

### 4) Wire into Remotion code
Create or update imports so scenes consume brand tokens and motion presets, not ad-hoc values.

Minimum implementation target:
- One shared module that exports tokens/presets
- One sample composition that demonstrates intro, content beat, and outro with brand-consistent timing

### 5) Validate consistency
Run checks:
1. `npm --prefix video run lint`
2. `npm --prefix video run build`
3. Render at least one representative composition

Then verify:
- Typography hierarchy is consistent
- Color usage follows semantic token mapping
- Motion rhythm matches the intended voice
- Captions/VO pacing fits on-screen animation

## Guardrails

- Never copy proprietary assets without permission.
- Treat scraping as reference extraction, not duplication.
- Ask for explicit confirmation before imitating a competitor style closely.
- Prefer reusable tokens and presets over one-off scene styling.

## Output Standard

The final response for brand-build requests should include:
1. Brand assumptions used
2. Files created/updated
3. How tokens map to scene behavior
4. What to tweak first for the next iteration
