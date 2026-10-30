# Baulingo public site

Turkish-first German-learning website, app information, learning resources and privacy policy for Baulingo.

The site follows the owner's [Turkish homepage reference](docs/design/homepage.md). It includes topic search, readable learning pages, recorded audio, a short phrase exercise and free study notes. Work continues in small steps; see the [long-term roadmap](docs/roadmap.md) and [architecture](docs/architecture.md).

Use Node 24. `npm run dev` builds and serves http://127.0.0.1:4173. Re-run the build after edits; there is no live reload. `npm test` checks learning rules, public routes and the build. `npm run build` writes only explicitly allowed files to `dist/`; `npm run preview` serves that output without rebuilding. Normal builds require no npm or Python dependencies.

This repository contains the public website source. It contains no mobile app source, credentials or signing material.

Live website: https://baulingo.app/

Privacy policy: https://baulingo.app/privacy/. Preserve the legacy Android-app policy address at https://mahmutyoung.github.io/baulingo-site/privacy/ during migration.

## Cloudflare website work

The static website is live at `baulingo.app`, with a separate Worker redirecting WWW to the HTTPS apex. Product experiments are embedded in the main website to understand Turkish-speaking visitors' demand and preferences, and ship with the normal site deployment. Use free plans only. Resources and downloads require no signup. Live checks and local tests pass; account billing settings have not been independently audited. See [deployment notes](docs/production.md).

- [Setup and agreed decisions](docs/setup.md)
- [Agent working instructions](AGENTS.md)
- [Long-term roadmap and next product milestone](docs/roadmap.md)
- [Implementation handoff and verification checklist](docs/handoff.md)

Local repository: `C:\Users\90505\Documents\POS\german-app\baulingo-site`. Keep it separate from the Android app repository.
