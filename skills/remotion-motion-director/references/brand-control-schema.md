# Brand Control Schema (Granular)

Use this schema to convert ambiguous style requests into an explicit design system for motion.

## Fill This First

```yaml
project:
  title: ""
  objective: ""
  audience: ""
  platform: ["youtube", "linkedin", "instagram", "chatgpt-docs", "other"]
  deliverables:
    - ratio: "16:9"
      resolution: "1920x1080"
      duration_sec: 30
      fps: 30

brand:
  positioning:
    tone: ["premium", "trustworthy", "bold", "playful", "technical"]
    traits: ["minimal", "human", "precise"]
    anti_traits: ["noisy", "gimmicky", "chaotic"]
  typography:
    heading_family: ""
    body_family: ""
    mono_family: ""
    scale:
      hero_px: 96
      h1_px: 64
      h2_px: 48
      body_px: 32
      caption_px: 24
    line_height:
      heading: 1.05
      body: 1.25
  color_tokens:
    bg_primary: "#000000"
    bg_secondary: "#111111"
    text_primary: "#FFFFFF"
    text_secondary: "#B8B8B8"
    accent_primary: "#4F8CFF"
    accent_secondary: "#7BE0B8"
    danger: "#FF5C5C"
  layout:
    grid_columns: 12
    safe_margin_px: 80
    corner_radius_px: 20
    spacing_scale: [8, 12, 16, 24, 32, 48, 64]

motion:
  pacing_profile: ["calm", "measured", "energetic"]
  shot_rhythm:
    avg_shot_sec: 1.8
    min_shot_sec: 0.8
    max_shot_sec: 4.0
  transitions:
    style: ["cut", "crossfade", "wipe", "match-move"]
    max_transition_ms: 350
    transition_density: "low"
  easing_family:
    primary: "spring-smooth"
    secondary: "ease-in-out"
  camera_language:
    movement: ["locked", "subtle-dolly", "parallax"]
    max_scale_change_pct: 8
    max_rotation_deg: 2
  micro_motion:
    enabled: true
    max_parallel_animated_elements: 3
    preferred_effects: ["opacity", "translateY", "scale"]

narrative:
  single_core_message: ""
  proof_points:
    - ""
    - ""
    - ""
  cta: ""

accessibility:
  contrast_target: "WCAG-AA"
  captions_required: true
  reduced_motion_variant: true
  max_words_per_frame: 10
```

## Preset Profiles

- `Premium Minimal`:
  - Longer holds, sparse transitions, low motion density, high whitespace.
- `Modern Product`:
  - Medium rhythm, confident typography, subtle camera motion.
- `High-Energy Launch`:
  - Fast cut cadence, stronger accents, tighter scene durations.

## Decision Rule

If two tokens conflict, prioritize in this order:

1. readability,
2. narrative clarity,
3. brand consistency,
4. stylistic flair.
