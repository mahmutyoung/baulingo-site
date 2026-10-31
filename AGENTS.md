# Working in baulingo-site

These instructions apply to this repository. Follow the user's latest instructions and existing session authorizations. Keep changes small, concrete and verifiable.

## Product direction

- Baulingo serves Turkish speakers learning German. Put their questions, Turkish explanations and everyday situations at the centre.
- Preserve the approved homepage layout, brand and Turkish copy in [the design brief](docs/design/homepage.md) and [reference image](docs/design/homepage-reference.png). Make design or copy changes when the user requests them.
- Embed product experiments in the homepage or relevant existing website content. They share the main site's build and deployment. Do not revive a separate experiment page, lab project or subdomain.
- Use the roadmap's question → experience → evidence → decision cycle. The next milestone is one embedded demand/preference experiment with a defined measurement method.
- Keep implemented features, proposed work and measured results distinct. No website measurement pipeline currently exists; browser search and practice are not collected demand data.
- Resources and downloads remain free and accessible without signup or email capture. Exam packages are planned; do not present unfinished preparation content as available.
- Use free hosting plans. Do not enable paid plans, billing upgrades or paid services.

## Read the relevant sources

| Source | Authority |
| --- | --- |
| [Roadmap](docs/roadmap.md) | Product stages, priorities and experiment decisions |
| [Architecture](docs/architecture.md) | Current implementation and optional future structure |
| [Handoff](docs/handoff.md) | Next work, current features and boundaries |
| [Setup](docs/setup.md) | Agreed hosting, routes and repository ownership |
| [Production notes](docs/production.md) | Build, release operations and recorded verification |
| [Design brief](docs/design/homepage.md) | Approved homepage layout and wording |
| [WWW Worker notes](cloudflare/www-redirect/README.md) | Redirect deployment, scope and rollback |

Historical documents under `docs/superpowers/` record earlier work. Use the current roadmap and approved visual reference when older plans conflict with them. Keep the relevant core docs synchronized when decisions or implementation change.

## Implementation map

- `index.html`, `style.css`, `app.js`: approved homepage and browser interactions.
- `src/topics.js`: topic content and Turkish-aware search rules.
- `src/exercise.js`: exercise data and pure answer/state rules.
- `scripts/pages.mjs`: generated topic/resource pages, discovery files and 404.
- `scripts/public-files.mjs`: explicit publication allowlist and public path resolution.
- `scripts/build.mjs`: static output builder; `scripts/dev.mjs` and `scripts/server.mjs`: local output preview.
- `assets/`, `downloads/`: artwork, local fonts/audio/icons and study files.
- `privacy/`, `impressum/`: public legal pages.
- Root `wrangler.json`, `_headers`, `_redirects`: main static site's Cloudflare configuration.
- `cloudflare/www-redirect/`: separately deployed infrastructure Worker for WWW redirects only.
- `tests/`: Node tests for learning, build boundaries, HTTP behavior and redirects.

Continue with static HTML/CSS and native JavaScript modules. Keep content, learning rules and DOM rendering separate. Astro, TypeScript, React, accounts, databases and synchronisation are optional future choices requiring a concrete product need, not current prerequisites.

## Local workflow

Use Node 24. Normal builds require no installed npm or Python dependencies.

```powershell
npm run dev
npm test
npm run build
npm run preview
```

- `dev` builds and serves http://127.0.0.1:4173. It does not watch files; rebuild after edits.
- Local review is at `/dev/review/` in development mode only. Its Refresh changes action rebuilds the preview; restart the server after middleware changes. Keep the newest reviewable UI change first in `dev/review/changes.json`, with relevant source/media files and honest walkthrough notes. Feedback stays in ignored `.dev/website-review.json`; never publish review tools or notes.
- `build` writes `dist/`. Edit source files, not generated output.
- `preview` serves the existing `dist/` without rebuilding.
- `test` uses Node's built-in runner with `--test-isolation=none`; retain that setting for the current Windows environment.
- `.dev/`, `.wrangler/`, `dist/`, dependencies and local environment files are ignored scratch/output locations.

Use available frontend-design and Product Design skills for visual work, and applicable Superpowers workflows for planning, implementation and verification. Respect the approved reference when applying design guidance.

## Verification

- For behavior, routing, asset or deployment-code changes, run `npm test` and `npm run build`, inspect the results and run checks relevant to the change.
- For UI changes, inspect the rendered page at relevant desktop/mobile widths and verify affected keyboard, focus, dialog, search, exercise, audio or download behavior. Preserve readable static topic/resource links when JavaScript is unavailable.
- For documentation-only changes, check relative links and `git diff --check`; do not add implementation-mirroring tests or run unrelated suites without a reason.
- Report what was actually verified. Distinguish local tests, a CLI dry run, preview checks and live-domain checks. Recheck live behavior after an authorized deployment.

## Publication and repository boundaries

- Publish only the explicit static output. Update the allowlist when adding public files; never expose the repository root, documentation, tests, credentials or private app material.
- Keep the core public build under its existing 2 MB test budget. The owner approved a separate 10 MB budget for the explicit DTZ audio/WebP media allowlist; load the exam audio only when the learner starts listening. Publish WebP/WOFF2 assets and licenses; retain original PNG/TTF sources outside the public output. Optional re-encoding instructions are in `scripts/optimize-assets.py`.
- Keep secrets in the tool's credential store or local environment. Never print authentication tokens, commit credentials or add them to public assets. Wrangler authentication may need rechecking; do not assume a previous login is still valid.
- The main site is `https://baulingo.app`. `baulingo-www-redirect` handles only `www.baulingo.app/*`, returning a 301 to HTTPS apex while preserving paths and query strings. Its deployment is separate from the main static build.
- Inspect the target configuration before deployment. A dry run does not publish. Pushes, deployments and account/domain changes need user authorization for their scope; once authorized, complete that work without repeatedly asking for the same permission.
- Make coherent local commits when requested or already authorized. Do not infer permission to push from permission to commit locally.
- Keep this website independent of the sibling Android app repository. Do not change native app code, telemetry or first-install behavior as part of website work.
- Preserve the legacy GitHub Pages privacy URL used by the Android app. Do not overwrite this independent website with an older app-site export. Use confirmed public app destinations rather than inventing store links.
