# Baulingo public site

Turkish-first German-learning website, app information, learning resources and privacy policy for Baulingo.

The current local draft follows the owner's [Turkish homepage reference](docs/design/homepage.md). It includes topic search and a short phrase exercise. Work continues in small steps; see [the proposed architecture](docs/architecture.md).

Local preview: `npm run dev` (http://127.0.0.1:4173). Checks: `npm test`. Public static output: `npm run build`, which writes only public files to `dist/`.

This repository contains the public website source. It contains no mobile app source, credentials or signing material.

Existing documented website: https://mahmutyoung.github.io/baulingo-site/

Existing documented privacy policy: https://mahmutyoung.github.io/baulingo-site/privacy/

## Cloudflare website work

The agreed target is a mainly static website at `baulingo.app`, with separate experiments whose address is still to be decided. Use free plans only. Learning resources and downloads will be available without signup. Cloudflare deployment and domain configuration remain unverified.

- [Setup and agreed decisions](docs/setup.md)
- [Implementation handoff and verification checklist](docs/handoff.md)

Local repository: `C:\Users\90505\Documents\POS\german-app\baulingo-site`. Keep it separate from the Android app repository.
