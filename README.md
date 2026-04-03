<!-- prettier-ignore-start -->
# 🚦 Tracker UI

![Node.js](https://img.shields.io/badge/node-%3E%3D18-blue) ![Vite](https://img.shields.io/badge/vite-%5E7.0-brightgreen) ![TypeScript](https://img.shields.io/badge/typescript-%5E5.9-blue)

Lightweight frontend for mood-aware recommendations, weather integration, and curated deals. Built with React, TypeScript and Vite — focused on fast feedback loops and small bundle size.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Quickstart](#quickstart)
- [Environment](#environment)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Developer notes](#developer-notes)
- [Testing & linting](#testing--linting)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- Mood scoring and scenarios (see `utils/mood-calculator.ts`).
- Weather integration and UI-aware suggestions (`src/api/weather.ts`).
- Curated deal scraping/adapter (`src/api/ozbargain.ts`).
- Accessible UI primitives and theming (`src/components/` and `components/ui`).
- Small, testable modules and a scenarios runner for offline analysis (`scripts/run-mood-scenarios.ts`).

## Demo

Add a GIF or screenshot here to showcase the UI. Example placeholder:

![demo-placeholder](https://via.placeholder.com/800x300?text=Tracker+UI+Demo)

---

## Quickstart

- Requirements: Node 18+ and npm

1. Install deps

```bash
npm install
```

2. Start dev server (HMR)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build

```bash
npm run preview
```

## Environment

Configuration values (API keys, feature flags) are loaded from your environment. Inspect the adapters in `src/api/` to see expected variables; there are no enforced `.env` defaults in the repo. Typical variables you may need to provide locally:

- `WEATHER_API_KEY` — optional, if you want live weather data.
- `CLOUDFLARE_ACCOUNT` / `WRANGLER_...` — for deployment via `wrangler`, if used.

Create a `.env.local` (gitignored) for local development when needed.

---

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — `tsc -b && vite build` (type-check + build)
- `npm run preview` — locally serve the production build
- `npm run test` — run `vitest` tests
- `npm run lint` — run ESLint
- `npm run scenarios` — run `scripts/run-mood-scenarios.ts` via `ts-node`
- `npm run deploy` — build and deploy using `wrangler pages deploy ./dist`

All scripts are defined in `package.json`.

---

## Project layout

- `src/` — React app entry, views and components
	- `src/App.tsx` — app root
	- `src/main.tsx` — bootstrap
- `src/api/` — adapters and mocks (`weather.ts`, `ozbargain.ts`, `mock-data.ts`)
- `src/components/` — UI primitives and theming
- `utils/` — domain logic (mood calculator, weather utils)
- `lib/` — small helpers (crypto, utils)
- `scripts/` — developer scripts and scenario runners
- `wrangler.toml` — Cloudflare Pages config

---

## Developer notes

- Recommended editor: VS Code with TypeScript + ESLint integration.
- Formatting: use the project's ESLint rules; consider adding Prettier if desired.
- When adding API integrations, keep adapters isolated under `src/api/` and provide mocks in `src/api/mock-data.ts` for local development and tests.

Quick debug tips:

- Inspect the network requests in the browser to verify API adapter responses.
- Run `npm run scenarios` to exercise mood-scoring logic without launching the UI.

---

## Testing & linting

- Run unit tests:

```bash
npm run test
```

- Run linters:

```bash
npm run lint
```

---

## Deployment

This repo can deploy to Cloudflare Pages via `wrangler`. To deploy:

```bash
npm run deploy
```

Check `wrangler.toml` to confirm account and project settings.

---

## Contributing

- Fork, create a branch, add tests and run linters.
- Open a PR and request review; include screenshots or brief steps to reproduce UI changes.

---

If you'd like, I can add a local debug checklist, CI badge, or embed real screenshots — which would you prefer?

<!-- prettier-ignore-end -->
