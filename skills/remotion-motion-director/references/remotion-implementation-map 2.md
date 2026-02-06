# Remotion Implementation Map

Use this map to translate creative direction into concrete Remotion code decisions.

## Direction -> Implementation

| Direction Control | Remotion Mechanic | Practical Rule |
| --- | --- | --- |
| Slow premium pacing | `Sequence` durations | Prefer 45-120 frame scenes at 30fps, with deliberate holds. |
| Snappy launch pacing | `Sequence` cuts + short transitions | Use 18-45 frame beats and avoid heavy transition overlap. |
| Soft motion language | `spring()` high damping | Keep bounce low; settle quickly and avoid overshoot. |
| Dynamic motion language | `spring()` lower damping + controlled stagger | Add rhythm, but cap concurrent animated elements. |
| Clean hierarchy reveals | staggered entrance order | Hero first, support second, metadata last. |
| Safe social framing | root containers with margins | Reserve format-specific safe zones before placing text/logos. |
| Readability under speed | `interpolate()` with opacity + Y shifts | Prefer small travel distances and high contrast text blocks. |
| Voice-led storytelling | scene timing from VO phrases | Cut on phrase boundaries, not arbitrary frame counts. |

## Starter Patterns

## Pattern A: Premium Reveal

- Fade from black over 10-14 frames.
- Headline enters with subtle `translateY` (<24px) and opacity.
- Hold for 24-36 frames before secondary text.
- Transition with quick crossfade (6-10 frames).

## Pattern B: Product Proof Stack

- Scene 1: problem statement.
- Scene 2: product action.
- Scene 3: quantified proof.
- Scene 4: CTA.
- Keep visual motif and timing grammar consistent across all scenes.

## Pattern C: Reduced Motion Variant

- Replace scale/position-heavy motion with opacity and short dissolves.
- Increase static hold time to preserve comprehension.
- Keep narrative order identical to default variant.

## Timing Budgets

At `30fps`:

- 6-10 frames: micro-transition.
- 12-20 frames: element entry.
- 24-45 frames: short beat.
- 60-120 frames: key message scene.

If average scene duration is below 30 frames, readability risk is high unless copy is extremely short.

## Common Failure Modes

- Overlapping too many entrances in one beat.
- Transition styles changing every scene.
- Text scale not adjusted for mobile preview.
- Camera movement added where no narrative gain exists.
