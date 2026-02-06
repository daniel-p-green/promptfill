# PromptFill Remotion Demos

This package renders the two primary project narratives:

- `PromptFillDemo` -> **Web App component** (design/prototyping lab)
- `PromptFillFlagshipPromo` -> **ChatGPT Apps SDK component** (native in-chat product)

## Local preview

```bash
cd video
npm install
npm run dev
```

## List available compositions

```bash
cd video
npx remotion compositions src/index.ts
```

## Render ultimate MP4 artifacts

```bash
cd video
npx remotion render src/index.ts PromptFillDemo ../renders/promptfill-ultimate-web.mp4
npx remotion render src/index.ts PromptFillFlagshipPromo ../renders/promptfill-ultimate-chatgpt.mp4
```

## Generate README GIF artifacts

```bash
mkdir -p ../docs/media
ffmpeg -y -i ../renders/promptfill-ultimate-web.mp4 -vf "fps=6,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" ../docs/media/promptfill-web-demo.gif
ffmpeg -y -i ../renders/promptfill-ultimate-chatgpt.mp4 -vf "fps=4,scale=448:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=80:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" ../docs/media/promptfill-chatgpt-demo.gif
```

## Media storage policy

- Full MP4 deliverables in `renders/` are long-term artifacts and should be tracked with Git LFS.
- README embed GIFs in `docs/media/` should stay lower-resolution for documentation load hygiene.
