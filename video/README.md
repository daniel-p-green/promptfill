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
ffmpeg -y -i ../renders/promptfill-ultimate-web.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" ../docs/media/promptfill-web-demo.gif
ffmpeg -y -i ../renders/promptfill-ultimate-chatgpt.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" ../docs/media/promptfill-chatgpt-demo.gif
```
