# Website implementation handoff

Updated: 1 November 2026. [Production preparation](production.md) is the current verification and release checklist.

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

## DTZ simulation prepared locally

The owner requested the existing full simulation from `german-exam-app`. It is implemented at `/dtz-deneme-sinavi/` in the main site's static build, linked from the existing homepage exam column, exam topic/search dialog and resources. It includes the original 20 listening + 25 reading items, continuous audio, writing A/B, speaking A/B images, local resume and a receptive score/review. Writing/speaking are not automatically graded. The app repository is unchanged. [Port notes](content/dtz-web.md) record source hashes, limits and local verification. The owner approved a separate 10 MB DTZ media allowance alongside the existing 2 MB core limit. The owner has authorized a local commit of all reviewed changes. Deployment still requires separate authorization.

The current suite has 44 passing tests, including local review and performance tooling. Full browser flow, audio playback/end, timer expiry, reload/resume, local writing, error/retry, denied storage, corrupt-state reset, keyboard selection and no-JavaScript fallback passed locally. A fresh read-only review found no important bugs and independently ran the five pure DTZ tests. Publish only after authorization, then recheck live audio byte ranges, routing, exercise behavior, privacy and analytics.

## Next steps

The owner can review recent changes and walk through the website at `http://127.0.0.1:4173/dev/review/` in the current local session. **Refresh changes** rebuilds current source; DTZ shortcuts use isolated sample progress. Notes/decisions stay in ignored `.dev/website-review.json` and never trigger agent work or publication. See [local review instructions](development/review.md). Development-only review tools are not part of the pending public release.

Cloudflare analytics support and the website privacy disclosure are deployed with authorization. Live browser checks confirm automatic beacon loading (HTTP 200) and same-origin RUM acceptance (HTTP 204) on homepage and topic-index visits without CSP errors. Version: `f08cba0f-c32c-4a16-aaa8-df1a22d063f0`. A separate read-only token in the ignored local `.env` now permits analytics inspection. The reporting API confirms four ingested page views consistent with verification traffic. Automatic collection is enabled with an active host `*` / paths `["*"]` rule; proposed production-host/path restrictions have not been applied. See [analytics operations](analytics.md). No manual script was added. This does not replace the embedded experiment's evidence method.

1. Complete the authorized local cleanup and commit; obtain separate publication authorization. The latest priority is acquiring traffic with this existing useful resource, not adding another homepage preference selector.
2. After publication, choose and record specific community/teacher placements and inspect Search Console/Cloudflare acquisition evidence. No outreach or distribution results exist yet. Aggregate website analytics is deployed, but no experiment event pipeline is implemented.
3. Once visitors arrive, define the next experiment's question, experience, evidence and decision before expanding content or tracking. Native app telemetry is outside this task.
4. Evaluate the evidence against the brief's success criteria, then expand, adjust or stop the experiment. Use that result to prioritise content and practice improvements in the roadmap.
5. For website releases, follow production.md and recheck the preview, HTTPS, WWW redirect, nested paths, assets, downloads and legal pages. Account billing settings and the full DNS configuration remain unaudited; do not enable paid plans.

Keep old GitHub Pages privacy access during migration. The app's policy URL is a separate app task. Product experiments belong within existing website pages and the normal site deployment, to learn about Turkish-speaking visitors' demand and preferences. The previous separate experiment page/project/subdomain direction is superseded.

The app repository still has a public-site export script. Do not use an older export to overwrite this independent website source.

## Limits

The main site, HTTPS custom domain and WWW redirects have now been verified live; account billing settings and the full DNS configuration have not been audited. The WWW setup added only its dedicated Worker route, with no DNS edits or paid-plan changes. Native app code and telemetry remain unchanged. Recheck live behavior after future deployments.

## Local performance changes

The performance review entry is **Faster homepage, same design** at `http://127.0.0.1:4173/dev/review/`. It covers responsive hero copies, Turkish/German font subsets (Lato-derived Baulingo Sans), and content-hashed immutable core assets. These changes are not deployed; baseline PageSpeed scores remain mobile 97 / desktop 99. See [performance notes](performance.md).

The initial review follow-up applied three saved comments: a collapsible phone menu, removal of the free-resource header link, and removal of the last DTZ pre-start sentence. Component **+** buttons now attach local feedback to main sections and dialogs; saved notes can be edited or deleted. Original notes and approvals remain local. The owner confirmed approval of all changes in chat on 1 November; saved notes have not been rewritten. See [review instructions](development/review.md).

## Local resources removal

The owner requested removal of the free resources section. The local website no longer publishes its page or downloads; the original source files remain in the repository. This does not change the independent Android app. This change is not deployed.

## Local review follow-up

The local homepage now links grammar and daily-life topics directly to their static pages; topic practice uses topic-specific sentences. The app information page links to the owner-provided Google Play open-alpha listing. The DTZ result no longer offers a new-attempt button. These changes await publication. A locally prepared English section now offers independently written lessons on appointments, word order and articles, with English browser-language detection and a manual switch. The English app page was removed at the owner’s request. DTZ instructions and other Turkish pages have not been translated; the English section is limited to its published lessons.

## English homepage SEO preparation

The local English homepage now leads with beginner German, original English explanations, three existing lesson destinations, recorded café audio, a sentence task and getting-started questions. It uses the approved Baulingo artwork, colours and type. Metadata includes a descriptive title/description, canonical URL, social previews and reciprocal English/Turkish homepage language links. No keyword-volume, ranking or traffic results have been measured. The English app page remains removed.

## Shared English sentence builder

English homepage and lesson practice now use the same DOM controller and pure selection/checking rules as Turkish. Independent English task data supplies coffee/tea, word order, articles and appointment sentences with contextual hints. English tasks have three to five words; longer tasks wrap into two columns on phones. Readable examples remain available without JavaScript. The Turkish café flow is preserved.

The full saved-comment audit is recorded in [review follow-up](development/review-followup.md). The remaining B1 letter shortcut now leads to the available DTZ simulation. Turkish practice meanings were checked against their German sentences.

## Local exam overview and saved review

The Sınavlar header link now opens `/sinavlar/`. This static overview has DTZ mock-test and study-list links plus a brief Turkish guide to DTZ, Goethe/telc, DTB and TestDaF/DSH audiences, linked to official sources. Only DTZ preparation is offered. The mock test and study page link back to the overview. The single saved comment requesting removal of the printer example was applied; the original local feedback is retained. These changes are prepared locally and are not deployed.

The exam overview now prioritises the available DTZ test and study lists in two prominent content cards. The complete exam-audience guide is secondary, below the materials in a native disclosure under “Sınavlar hakkında”; it is collapsed by default and remains accessible without JavaScript.
