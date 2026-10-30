# Website implementation handoff

Updated: 30 October 2026. [Production preparation](production.md) is the current verification and release checklist.

Live status: the owner deployed the static site at `https://baulingo.app`. The authorized WWW-only redirect Worker is also deployed and verified for HTTP/HTTPS 301 redirects retaining paths and queries. See [its operational notes](../cloudflare/www-redirect/README.md). Cloudflare login is available through local Wrangler; no credentials are in Git. Deployment verification is recorded in production.md.

Read [the roadmap](roadmap.md), [the setup](setup.md), [the approved visual reference](design/homepage.md) and [the architecture](architecture.md). The roadmap owns product sequencing; this handoff identifies the next implementation work. Continue in this website repository. Keep native app work in its separate repository.

## Current live foundation

The owner selected Turkish speakers as the first audience and supplied the final homepage screenshot. Its layout and visible wording are authoritative. Further development should proceed in small steps.

The site has a search-led hero, a cafe phrase with recorded audio, three topic columns and a resource banner. The sentence exercise, topic explanations, search, language information and resources open in accessible dialogs. Topic and resource content also has static readable pages. Two original text study notes can be downloaded without signup. Exam packages remain planned.

The site uses static HTML/CSS and browser JavaScript modules. Pure exercise and search rules are separate from DOM rendering. No framework migration or backend was added.

- `npm run dev` starts the local preview at http://127.0.0.1:4173.
- `npm test` runs 18 checks for learning rules, Turkish search, public paths, generated pages, deployment output, HTTP behavior and the WWW redirect.
- `npm run build` writes an explicit public allowlist to `dist/`.
- `.dev/`, `dist/`, local environment files and dependencies are ignored by Git.

## Verification

The tests and static build pass. Chrome checks cover the primary interactions, audio, downloads, focus return and console errors. Responsive checks cover eleven widths from 320 to 1440 px, including intermediate tablet widths. Topic/resource navigation also works without JavaScript. The owner supplied the postal address for the new Impressum; privacy edits update publisher contact and website hosting only. Native app telemetry paragraphs are unchanged. Build output excludes docs, tests, scripts, Git metadata, source artwork, raw fonts and local browser files.

[Design QA](../design-qa.md) records the visual comparisons, fixes and remaining minor differences. Local screenshots and browser logs are in the ignored `.dev/` directory. They are not deployed assets.

## Next steps

1. Define one embedded experiment brief using the roadmap's question, experience, evidence and decision fields. Explore visitors' needs for explanations, everyday communication or exam preparation and useful activity formats; do not assume a winning category.
2. Settle the smallest useful interaction, its placement within existing content and its measurement method. The existing sentence activity is an available pattern. No website measurement pipeline is implemented yet.
3. Implement and review that small change against the approved layout and Turkish wording, including accessibility and mobile use. Native app telemetry is outside this task.
4. Evaluate the evidence against the brief's success criteria, then expand, adjust or stop the experiment. Use that result to prioritise content and practice improvements in the roadmap.
5. For website releases, follow production.md and recheck the preview, HTTPS, WWW redirect, nested paths, assets, downloads and legal pages. Account billing settings and the full DNS configuration remain unaudited; do not enable paid plans.

Keep old GitHub Pages privacy access during migration. The app's policy URL is a separate app task. Product experiments belong within existing website pages and the normal site deployment, to learn about Turkish-speaking visitors' demand and preferences. The previous separate experiment page/project/subdomain direction is superseded.

The app repository still has a public-site export script. Do not use an older export to overwrite this independent website source.

## Limits

The main site, HTTPS custom domain and WWW redirects have now been verified live; account billing settings and the full DNS configuration have not been audited. The WWW setup added only its dedicated Worker route, with no DNS edits or paid-plan changes. Native app code and telemetry remain unchanged. Recheck live behavior after future deployments.
