# PromptFill videos (Remotion)

This folder contains the Remotion compositions used for:

- Web app demo videos (honest UI screenshots + highlight overlays)
- ChatGPT Apps SDK demo videos (inline card feel, conversation-first)
- End-user story tracks (email, summaries, support, PRDs)

## Commands

**Install Dependencies**

```console
npm ci
```

**Start Preview**

```console
npm run dev
```

## Render outputs

All renders write into repo root `renders/`.

**Render MP4s (release set)**

From repo root:

```bash
cd video
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillDemo ../renders/promptfill-demo.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillChatGPTAppDemo ../renders/promptfill-chatgpt-app.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillFlagshipPromo ../renders/promptfill-flagship.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillUserStoryEmail ../renders/promptfill-userstory-email.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillUserStorySummary ../renders/promptfill-userstory-summary.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillUserStorySupport ../renders/promptfill-userstory-support.mp4 --codec=h264 --crf=18 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion render src/index.ts PromptFillUserStoryPRD ../renders/promptfill-userstory-prd.mp4 --codec=h264 --crf=18 --quiet
```

**Midpoint stills (readability checks)**

From repo root:

```bash
mkdir -p renders/stills
cd video
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion still src/index.ts PromptFillFlagshipPromo ../renders/stills/promptfill-flagship-mid.png --frame=720 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion still src/index.ts PromptFillChatGPTAppDemo ../renders/stills/promptfill-chatgpt-mid.png --frame=360 --quiet
PATH="/opt/homebrew/opt/node@20/bin:$PATH" npx remotion still src/index.ts PromptFillUserStoryEmail ../renders/stills/promptfill-userstory-email-mid.png --frame=180 --quiet
```

## Demo GIFs

The README uses GIFs generated from the rendered MP4s:

From repo root:

```bash
mkdir -p docs/media
ffmpeg -y -i renders/promptfill-demo.mp4 -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a" docs/media/promptfill-demo.gif
ffmpeg -y -i renders/promptfill-chatgpt-app.mp4 -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a" docs/media/promptfill-chatgpt-app.gif
```

## Composition list

See `video/src/Root.tsx`.
