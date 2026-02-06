# Output Contract

The skill should generate two outputs:

1. A portable core kit (`@brand-kit/<brand>`)
2. A starter project scaffold that uses the kit

## 1) Core kit package

Target location pattern:

- `packages/brand-kit-<brand>/`

Minimum package files:

- `package.json` (name `@brand-kit/<brand>`)
- `src/index.ts`
- `src/brand/tokens.json`
- `src/brand/tokens.ts`
- `src/brand/fonts.ts`
- `src/copy/schema.ts` (zod)
- `src/copy/exampleScript.ts`
- `src/remotion/components/typography/*`
- `src/remotion/components/layout/*`
- `src/remotion/motion/*`
- `src/starter/ScriptDrivenReel.tsx`

Schema rules (minimum):

- Hook: <= 8 words
- Problem bullets: max 3 bullets, 2-4 words each
- CTA text: 2-4 words
- One scene = one primary purpose

## 2) Starter scaffold

Generate with:

```bash
npm run brand:starter -- --out ./starter-<brand> --mode embed
```

Starter must include:

- `src/index.ts`
- `src/Root.tsx`
- `src/comps/DemoReel.tsx`
- `script.json`
- `public/brand/<brand>/logo.svg`
- render scripts for reels + youtube

## 3) Verification contract

Run:

1. `npm --prefix video run lint`
2. `npm --prefix video run build`
3. Render at least one still or clip from each format composition

## Quality bar

- No hardcoded freestyle text styles in scenes when primitives exist.
- Copy and hierarchy constraints enforced by schema and components.
- Safe zones are format-aware (Reels first, YouTube supported).
- Motion variants map to explicit energy presets only.
