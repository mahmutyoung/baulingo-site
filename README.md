# Baulingo public site

Turkish-first German-learning website, app information, learning resources and privacy policy for Baulingo.

The site follows the owner's [Turkish homepage reference](docs/design/homepage.md). It includes topic search, readable learning pages, recorded audio, a short phrase exercise and free study notes. Work continues in small steps; see [the proposed architecture](docs/architecture.md).

Use Node 24. `npm run dev` builds and serves http://127.0.0.1:4173. Re-run the build after edits; there is no live reload. `npm test` checks learning rules, public routes and the build. `npm run build` writes only explicitly allowed files to `dist/`; `npm run preview` serves that output without rebuilding. Normal builds require no npm or Python dependencies.

This repository contains the public website source. It contains no mobile app source, credentials or signing material.

Existing documented website: https://mahmutyoung.github.io/baulingo-site/

Existing documented privacy policy: https://mahmutyoung.github.io/baulingo-site/privacy/

## Cloudflare website work

The target is a static website at `baulingo.app`, with separate experiments whose address is still to be decided. Use free plans only. Resources and downloads require no signup. Cloudflare configuration and a CLI dry run are verified locally; deployment, account settings and domain configuration remain pending. See [the release checklist](docs/production.md).

- [Setup and agreed decisions](docs/setup.md)
- [Implementation handoff and verification checklist](docs/handoff.md)

Local repository: `C:\Users\90505\Documents\POS\german-app\baulingo-site`. Keep it separate from the Android app repository.
