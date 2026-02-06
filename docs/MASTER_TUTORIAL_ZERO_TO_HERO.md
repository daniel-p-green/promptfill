# Master Tutorial: Zero to Hero Content Production

This is the operating manual for turning a raw idea into polished, on-brand content using the PromptFill + Remotion skill stack.

Use it when you want repeatable quality, not one-off lucky shots.

## Run This Notebook

Open the interactive workshop notebook:

- `output/jupyter-notebook/promptfill-zero-to-hero-content-masterclass.ipynb`

Bootstrap a local notebook environment (recommended):

```bash
cd /Users/danielgreen/Documents/GitHub/promptfill

python3 -m venv tmp/jupyter-notebook/.venv
tmp/jupyter-notebook/.venv/bin/python -m pip install --upgrade pip
tmp/jupyter-notebook/.venv/bin/python -m pip install ipywidgets ipython ipykernel jupyterlab

tmp/jupyter-notebook/.venv/bin/python -m ipykernel install --user --name promptfill-notebook --display-name "Python (promptfill-notebook)"
tmp/jupyter-notebook/.venv/bin/jupyter lab output/jupyter-notebook/promptfill-zero-to-hero-content-masterclass.ipynb
```

---

## 1. Outcome and quality bar

By the end of this workflow you should have:

1. A reusable brand kit (`tokens + hierarchy + motion grammar + copy schema`).
2. A script-driven Remotion composition that stays on-brand.
3. Platform-specific renders (Reels, YouTube, previews, GIFs).
4. A repeatable process your team can run every week.

Definition of done:

1. Visual hierarchy is clear in the first 2 seconds.
2. One scene, one job (Hook, Problem, Proof, CTA).
3. Motion style is consistent across scenes.
4. Copy is concise and concrete.
5. Final files are exported in required formats with no quality regressions.

---

## 2. Skill map (what to use and when)

Core skills (always use):

1. `remotion-skill-brand-builder` for brand system generation.
2. `remotion-motion-director` for storyboard, pacing, and direction quality.
3. `remotion-best-practices` for technical correctness in Remotion.
4. `ralph-wiggum` for iterative build/verify loops until done.

Craft skills (raise polish):

1. `motion-designer` for animation principles (timing, anticipation, overlap).
2. `video-motion-graphics` for motion-graphics rhythm and transitions.
3. `create-remotion-geist` for premium product-style visual language.
4. `remotion-ads` for social-safe zones and ad format constraints.

Audio and voice skills:

1. `elevenlabs-remotion` for scene-based voiceover and stitching.
2. `remotion-resemble-ai` for alternate voice pipeline.

Format and runtime skills:

1. `lottie` for AE-to-web animation assets and performance patterns.
2. `motion` for Framer Motion style patterns you can map to timing systems.
3. `motion-canvas` when using a generator-function animation runtime instead of Remotion.

Utility skills for production:

1. `ffmpeg` for transcodes, GIFs, compression, and packaging.
2. `video-report` for reviewing a render and producing an actionable report.
3. `screenshot` for clean capture assets and before/after comparisons.
4. `writing-clearly-and-concisely` for scripts, docs, and CTA copy clarity.

---

## 3. Environment setup (once)

From repo root:

```bash
npm --prefix web install
npm --prefix video install
npm --prefix chatgpt-app install
```

Verify baseline:

```bash
npm --prefix web run lint
npm --prefix web run test
npm --prefix video run lint
npm --prefix video run build
npm --prefix chatgpt-app test
```

Recommended system tools:

1. Node.js 20+.
2. `ffmpeg` installed and available on PATH.
3. GitHub CLI (`gh`) if you want PR-based collaboration.

Optional API keys (only if needed for your stack):

1. `OPENAI_API_KEY` for OpenAI-powered generation workflows.
2. ElevenLabs/Resemble credentials for voice pipelines.

---

## 4. Zero to hero workflow

## Phase A: capture direction (15-25 min)

Use `remotion-motion-director` + `writing-clearly-and-concisely`.

Ask and lock:

1. Audience.
2. Core message (single takeaway).
3. Channel and format target (Reels 9:16, YouTube 16:9, or both).
4. Motion energy (`subtle`, `medium`, `punchy`).
5. Forbidden styles (what to avoid).

Codex prompt:

```txt
Use $remotion-motion-director to produce:
1) creative direction brief,
2) brand/motion control sheet,
3) storyboard with timings,
4) quality rubric and first-pass deltas.
Keep copy concrete and concise.
```

Output artifact:

1. A validated storyboard and direction brief in `docs/plans/`.

## Phase B: generate the brand kit (20-40 min)

Use `remotion-skill-brand-builder`.

Scan brand signals:

```bash
npm run brand:scan -- --url https://example.com --brand-slug your-brand
```

Create starter scaffold:

```bash
npm run brand:starter -- --out ./starter-your-brand --mode embed
```

If you need package-based reuse:

```bash
npm run brand:starter -- --out ./starter-your-brand-dep --mode dependency
```

Codex prompt:

```txt
Use $remotion-skill-brand-builder and enforce:
- hierarchy primitives (Hook/Claim/Body/Caption/CTA),
- scene grammar (Hook -> Problem -> Proof -> CTA),
- motion presets tied to energy level,
- zod validation for script JSON.
Do not allow freestyle typography.
```

Output artifact:

1. Reusable kit files under `video/src/brand-kits/<brand>` or package form under `packages/`.

## Phase C: script engine + copy constraints (15-30 min)

Use `writing-clearly-and-concisely`.

Build or update `script.json` style content with hard limits:

1. Hook: max 8 words.
2. Body: max 18-26 words per scene.
3. Bullets: max 3 bullets, 2-4 words each.
4. One CTA only, 2-4 words.

Codex prompt:

```txt
Rewrite this script to meet strict scene-copy constraints:
- one job per scene,
- active voice,
- concrete language,
- no stacked claims.
Return validated JSON plus a short rationale.
```

Output artifact:

1. Script payload that your templates can render without layout collapse.

## Phase D: motion craft pass (20-45 min)

Use `motion-designer`, `video-motion-graphics`, and `remotion-best-practices`.

Rules to enforce:

1. 3-5 transition styles only.
2. Shared spring presets across all scenes.
3. Stagger intervals (6-10 frames) for list reveals.
4. Dev-safe-zone overlays for social formats.

Codex prompt:

```txt
Apply $motion-designer + $video-motion-graphics + $remotion-best-practices.
Normalize all transitions and spring configs.
Audit each scene for hierarchy clarity and motion consistency.
Return exact code changes.
```

Output artifact:

1. Consistent, professional motion language across the whole reel.

## Phase E: voice and audio (optional, 20-40 min)

Use `elevenlabs-remotion` or `remotion-resemble-ai`.

Process:

1. Generate narration per scene.
2. Align VO timing to scene durations.
3. Duck background audio under narration.
4. Recheck scene pacing after audio sync.

Codex prompt:

```txt
Use $elevenlabs-remotion to generate scene-level VO, stitch tracks, and adjust scene durations so VO never feels rushed.
Then run a pacing critique pass.
```

Output artifact:

1. Narration-led version with intentional pacing.

## Phase F: render and package (10-30 min)

Use `remotion-best-practices` + `ffmpeg`.

Render core deliverables:

```bash
cd video
npm run render:stripe:reels
npm run render:stripe:yt
```

Create lightweight previews:

```bash
ffmpeg -y -i renders/your-master.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" docs/media/your-preview.gif
```

Output artifact:

1. Master renders and preview assets in `renders/` and `docs/media/`.

## Phase G: QA and iteration loop (non-negotiable)

Use `ralph-wiggum` + `video-report`.

Loop:

1. Run lint/build/tests.
2. Generate render.
3. Review against quality rubric.
4. Fix one focused set of issues.
5. Repeat until pass.

Codex prompt:

```txt
Use $ralph-wiggum.
Run iterative passes until all criteria pass:
- clarity in first 2 seconds,
- one scene one job,
- no hierarchy collisions,
- smooth motion rhythm,
- clean export quality.
After each pass, list deltas and what changed.
```

---

## 5. Superstar mode (team operating system)

Use this weekly cadence for consistent output:

1. Monday: brief + storyboard approval.
2. Tuesday: brand kit updates + script lock.
3. Wednesday: motion and audio build.
4. Thursday: QA loop + stakeholder review cut.
5. Friday: final exports + distribution package.

Team standards:

1. No ad-hoc scene styling outside primitives.
2. No copy without schema validation.
3. No final export without QA rubric score.
4. Every project leaves reusable templates behind.

---

## 6. Prompt library you can copy/paste

Master kickoff prompt:

```txt
We are creating [content type] for [audience] in [format].
Use these skills in this order:
1) $remotion-skill-brand-builder
2) $remotion-motion-director
3) $remotion-best-practices
4) $motion-designer
5) $video-motion-graphics
6) $ralph-wiggum

Deliver:
- brand control sheet,
- storyboard with timings,
- script schema + validated JSON,
- updated Remotion compositions,
- render commands,
- QA scorecard.
```

Social ads prompt:

```txt
Use $remotion-ads + $remotion-motion-director + $remotion-best-practices.
Optimize for Reels 9:16 safe zones and clear CTA.
Keep copy short and direct.
Return final renders and one GIF preview.
```

Premium product demo prompt:

```txt
Use $create-remotion-geist + $remotion-motion-director + $remotion-best-practices.
Direction: restrained, premium, high clarity.
No decorative motion without narrative purpose.
```

Voice-led explainer prompt:

```txt
Use $elevenlabs-remotion + $remotion-best-practices + $ralph-wiggum.
Generate narration per scene, align timings, and iterate until pacing feels natural.
```

---

## 7. Common failure modes and fixes

Problem: scenes look inconsistent.
Fix: lock all scene components to shared primitives and motion presets.

Problem: too much text on screen.
Fix: enforce copy constraints before layout; cut words, not font size.

Problem: motion feels robotic.
Fix: apply anticipation/overlap/stagger rules from `motion-designer`.

Problem: great visuals, weak conversion.
Fix: rebuild script around one clear CTA and proof scene.

Problem: export quality drops.
Fix: validate render settings and post-process with `ffmpeg` profiles.

---

## 8. Final checklist before ship

1. Brand kit is reusable and versioned.
2. Script is schema-validated.
3. First 2 seconds communicate the message.
4. Scene grammar is respected across the full timeline.
5. Audio mix is clear and balanced.
6. Exports exist for all target channels.
7. README/docs include preview media and usage commands.
8. QA rubric score meets your team threshold.

If all 8 are true, you are in superstar territory.
