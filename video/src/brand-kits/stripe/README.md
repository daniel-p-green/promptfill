# Stripe Brand Kit (Reference)

This kit is intentionally opinionated. It enforces hierarchy, copy, and scene grammar so compositions stay consistent instead of freestyle.

Default optimization target:
- Primary: Reels 9:16
- Also supported: YouTube 16:9

Validation stack:
- TypeScript-only
- zod schema validation for script input

## Included artifacts

- `brand/tokens.json` and `brand/tokens.ts`
- `brand/fonts.ts`
- `brand/logo.svg`
- `copy/schema.ts` and `copy/exampleScript.ts`
- `remotion/BrandProvider.tsx`
- `remotion/styles.ts`
- `remotion/components/*`
- `remotion/motion/presets.ts`
- `templates/*`
- `Root.tsx`
- `rules/brand-scene-checklist.md`
- `starter/ScriptDrivenReel.tsx`

## How to use

1. Import `StripeBrandKitRoot` into your Remotion root and render either:
   - `StripeDemoReel9x16`
   - `StripeDemoReel16x9`
2. Pass a script object that conforms to `copy/schema.ts`.
3. Keep all scene styling routed through typography/layout primitives and motion presets.
4. Use `video/package.json` scripts:
   - `npm run render:stripe:reels`
   - `npm run render:stripe:yt`

## What not to do

- Do not hardcode random spacing or colors in template scenes.
- Do not mix unrelated easing/spring styles per scene.
- Do not remove safe-zone checks when preparing social exports.
- Do not bypass script constraints by dropping in unvalidated ad copy.
