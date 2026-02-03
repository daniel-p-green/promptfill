# PromptFill

Local-first prompt library + editor for LLM prompts with typed variables and dropdown selectors.

## Repo layout
- `web/` — Next.js web MVP (library + builder + share/import/export)
- `video/` — Remotion marketing/explainer video
- `docs/` — PRD + use cases + user stories + AI extraction spec

## Dev
```bash
cd web && npm install
cd ../video && npm install

# Web app (runs on http://localhost:3100)
cd ..
npm run dev:web

# Remotion Studio (runs on http://localhost:3000)
npm run dev:video
```

## Video assets
The explainer video uses real screenshots from the web app plus highlight boxes.

```bash
cd video
npm run capture:ui
```

## Tests
```bash
cd web
npm test
```
