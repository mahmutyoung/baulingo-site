# Website implementation handoff

Recorded: 29 October 2026.

Read [the setup](setup.md), [the approved visual reference](design/homepage.md) and [the architecture](architecture.md). Continue in this website repository. Keep native app work in its separate repository.

## Current local draft

The owner selected Turkish speakers as the first audience and supplied the final homepage screenshot. Its layout and visible wording are authoritative. Further development should proceed in small steps.

The draft has a search-led hero, a cafe phrase with recorded audio, three topic columns and a resource banner. The sentence exercise, topic explanations, search, language information and resources open in accessible dialogs. Two original text study notes can be downloaded without signup. Exam packages remain planned.

The site uses static HTML/CSS and browser JavaScript modules. Pure exercise and search rules are separate from DOM rendering. No framework migration or backend was added.

- `npm run dev` starts the local preview at http://127.0.0.1:4173.
- `npm test` runs nine focused tests for learning rules, Turkish search and canonical public paths.
- `npm run build` writes an explicit public allowlist to `dist/`.
- `.dev/`, `dist/`, local environment files and dependencies are ignored by Git.

## Verification

The nine tests and static build pass. Chrome checks cover the primary interactions, audio, downloads, focus return and console errors. Responsive checks cover eleven widths from 320 to 1440 px, including intermediate tablet widths. The existing privacy page was verified byte-for-byte unchanged. Build output excludes docs, tests, scripts, Git metadata and local browser files.

[Design QA](../design-qa.md) records the visual comparisons, fixes and remaining minor differences. Local screenshots and browser logs are in the ignored `.dev/` directory. They are not deployed assets.

## Next steps

1. Review one small learner-facing change at a time against the approved reference. Keep its layout, Turkish wording and brand consistent.
2. Establish one reviewed learning-page pattern before expanding the content library. The Astro/content structure in the architecture document remains a proposal.
3. Inspect the Cloudflare account and domain settings when access is available. No account, plan or DNS state has been verified here.
4. Prepare the static hosting configuration for `dist/`. Verify a deployment preview before connecting `baulingo.app`.
5. Verify HTTPS, the `www` redirect, nested paths, asset loading, downloads and privacy access after deployment. Record actual results and the deployed revision.

Keep old GitHub Pages privacy access during migration. The app's policy URL is a separate app task. The experiment address remains undecided.

The app repository still has a public-site export script. Do not use an older export to overwrite this independent website source.

## Limits

Cloudflare access, account plans, DNS, custom domains, HTTPS, redirects and public deployment remain unverified. This work has not changed them. It has not changed native app code or telemetry. Local checks do not prove a public deployment.
