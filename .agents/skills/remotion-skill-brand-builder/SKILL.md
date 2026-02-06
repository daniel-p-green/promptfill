---
name: remotion-skill-brand-builder
description: Build an opinionated, on-brand Remotion system using intake + brand scan + enforced hierarchy/copy/scene grammar. Generates both a portable @brand-kit package and a starter project scaffold for consistent professional output.
---

# Remotion Skill Brand Builder

Use this skill when the user wants to:
- Create a branded Remotion system from scratch
- Match an existing website, product UI, or brand guide
- Improve consistency across multiple videos/compositions
- Turn brand strategy into reusable tokens + copy schema + scene grammar
- Produce both:
  - Portable kit: `@brand-kit/<brand>`
  - Starter project: scaffolded Remotion app using that kit

Default v1 strategy:
- Optimize first for Reels 9:16, also support YouTube 16:9
- Use TypeScript + zod for script validation
- Enforce hierarchy through primitives, not ad-hoc styles

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

Use the project scanner to gather candidate tokens/signals:

```bash
npm run brand:scan -- \
  --url https://example.com \
  --brand-slug example
```

Then manually verify the scraped output with screenshots and visual judgment. Scraped CSS values are hints, not ground truth.

### 3) Build the portable core kit
Using interview answers + scanned signals, generate the deliverables following `references/output-contract.md`:
- Core kit package under `packages/brand-kit-<brand>/`
- Enforced copy schema under `copy/schema.ts`
- Typography/layout primitives
- Motion preset system tied to energy
- Script-driven scene templates (Hook/Problem/Solution/CTA)

Copy starter examples from `assets/` if useful.

### 4) Generate starter project output
Create a starter Remotion project that embeds or depends on the kit:

```bash
npm run brand:starter -- --out ./starter-<brand> --mode embed
# or
npm run brand:starter -- --out ./starter-<brand> --mode dependency
```

Starter must include:
- `src/Root.tsx`
- `src/comps/DemoReel.tsx`
- `script.json`
- `render:reels` and `render:yt` scripts

### 5) Validate consistency
Run checks:
1. `npm --prefix video run lint`
2. `npm --prefix video run build`
3. Render at least one representative composition for each target format

Then verify:
- Typography hierarchy uses approved primitives and limits
- Color usage follows semantic token mapping
- Motion rhythm matches the intended energy profile
- Copy constraints are enforced by schema (hook length, bullets, CTA limits)

## Guardrails

- Never copy proprietary assets without permission.
- Treat scraping as reference extraction, not duplication.
- Ask for explicit confirmation before imitating a competitor style closely.
- Prefer reusable grammar and primitives over one-off scene styling.

## Output Standard

The final response for brand-build requests should include:
1. Brand assumptions used
2. Files created/updated
3. How hierarchy/copy/motion grammar is enforced
4. What to tweak first for the next iteration
