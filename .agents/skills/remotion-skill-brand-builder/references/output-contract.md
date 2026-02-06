# Output Contract

The skill should generate these artifacts for a new brand setup.

## 1) `video/brand/BRAND_PROFILE.md`

Required sections:
- Objective
- Audience
- Voice and tone
- Visual language
- Motion language
- Audio language
- Do/Don't list
- Acceptance checklist

## 2) `video/brand/brand-tokens.json`

Expected shape:

```json
{
  "brand": "Example",
  "version": "1.0.0",
  "colors": {
    "bg": "#0B0D12",
    "surface": "#121621",
    "text": "#F3F5F8",
    "muted": "#98A2B3",
    "accent": "#2D7FF9",
    "success": "#1FA971",
    "warning": "#F4B740",
    "danger": "#EA4D4D"
  },
  "typography": {
    "display": "Inter",
    "body": "Inter",
    "mono": "JetBrains Mono",
    "scale": {
      "hero": 84,
      "h1": 64,
      "h2": 48,
      "h3": 36,
      "body": 28,
      "small": 22
    }
  },
  "spacing": {
    "xs": 8,
    "sm": 16,
    "md": 24,
    "lg": 32,
    "xl": 48
  },
  "radius": {
    "sm": 8,
    "md": 14,
    "lg": 20
  }
}
```

## 3) `video/brand/motion-presets.ts`

Expected exports:
- `timing`
- `easing`
- `springs`
- `transitions`
- `enter()`, `exit()`, `emphasize()` helpers

All durations should be frame-aware and derived from `fps`.

## 4) `video/brand/composition-defaults.json`

Required keys:
- `fps`
- `durationInFrames`
- `width`
- `height`
- `safeAreas`
- `captionDefaults`

## 5) `video/brand/scene-blueprints.md`

Include at least:
- Hook scene blueprint
- Proof/demo scene blueprint
- CTA scene blueprint
- Motion notes per scene

## Quality bar

- No hardcoded one-off visual values inside scene files when a token exists.
- Every animation type used in a scene maps to a named motion preset.
- Text and contrast remain readable at mobile-safe sizes.
