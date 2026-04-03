# Tracker UI

Frontend application built with React, TypeScript and Vite. The UI surfaces mood-related features, weather data, and curated deals (see the `src/` and `api/` folders for the app modules).

## Quick start

- Prerequisites: Node 18+ and npm installed.
- Install dependencies:

```bash
npm install
```

- Run development server with HMR:

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Preview the production build locally:

```bash
npm run preview
```

## Useful scripts

- **dev**: Runs the Vite dev server (`npm run dev`).
- **build**: Type-checks and builds the app (`npm run build`).
- **preview**: Serves the production build locally (`npm run preview`).
- **test**: Runs unit tests with `vitest` (`npm run test`).
- **lint**: Runs `eslint` over the project (`npm run lint`).
- **scenarios**: Runs the mood scenarios script (`npm run scenarios`).
- **deploy**: Builds and deploys via Cloudflare Pages using `wrangler` (`npm run deploy`).

All scripts are defined in `package.json`.

## Project structure (selected)

- [src/](src/) — React app sources and views.
- [src/App.tsx](src/App.tsx) — application root component.
- [src/main.tsx](src/main.tsx) — app entry and bootstrapping.
- [src/api/](src/api/) — API adapters and mocks (e.g. `weather.ts`, `ozbargain.ts`).
- [src/components/](src/components/) — UI components and primitives.
- [lib/crypto.ts](lib/crypto.ts) — local crypto helpers used by the app.
- [utils/mood-calculator.ts](utils/mood-calculator.ts) — mood scoring logic and tests.
- [scripts/run-mood-scenarios.ts](scripts/run-mood-scenarios.ts) — helper script for running scenario simulations.
- [wrangler.toml](wrangler.toml) — configuration used for Cloudflare Pages deployment.

## Testing & Linting

- Run tests:

```bash
npm run test
```

- Run linters:

```bash
npm run lint
```

## Deployment

This project includes a `wrangler.toml` configured for Cloudflare Pages. Use `npm run deploy` to build and push the `./dist` output.

## Notes

- The project uses `vite`, `react`, `typescript`, and `vitest` for development and testing.
- If you need to run the mood scenarios locally, use `npm run scenarios` (it uses `ts-node` to execute `scripts/run-mood-scenarios.ts`).

## Contributing

Open a PR with changes, run tests and linters before merging.

---

If you'd like, I can expand sections (examples, environment variables, or developer notes). Want me to add usage screenshots or a local debug checklist?
