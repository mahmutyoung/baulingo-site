# Website implementation handoff

## Analytics completion and SEO growth — 27 November 2026

Continuation: Desktop OAuth now verifies Analytics, Search Console and Ads scopes. Actual worldwide German-learning research with Turkish/English/German query seeds succeeded for the Baulingo production Ads customer, currency TRY. The combined report has **1,778 unique keyword wordings from 1,862 observations**, retaining missing values and conflicts. Read the local package identified by `.dev/reports/latest-worldwide-keywords.json`; it contains Markdown, JSON, CSV and a small content-priority review. `worldwide` and all families are the default. The Desktop fix is a standing [AGENTS.md rule](../AGENTS.md#required-google-authorization-workflow), enforced by `npm run analytics:auth`, with persisted tests. [Live retrieval and operating state](analytics.md#live-keyword-exports-and-scheduled-snapshots)

Remote clean-install/build and active production are now verified independently: `origin/main` is `ae9e33f`; Ubuntu CI and the Cloudflare build succeeded; deployment `7141503b-15c0-4488-a572-9c026fb369c6` serves version `6c1aa69b-9551-4b56-b545-27ba6feb47bc` at 100%. Production routing, discovery files and packaged analytics/cookie assets passed HTTP/hash checks. [Recorded evidence](production.md#remote-build-and-active-production-verified--27-november-0917-utc)

The three Windows analytics tasks are registered with Limited privileges and Interactive logon. Their daily/weekly/monthly definitions validated; a scheduler-triggered daily test correctly returned **partial / exit 1**, with GSC and Cloudflare complete and GA4 deferred while the first clean day is still in progress. Timed future triggers and weekly/monthly scheduled executions remain unobserved. Keyword-based ideas, historical metrics and website-based discovery all succeeded; no campaign, spend or Ads account setting was created. Developer-token setup is obsolete under Google's September 2026 migration. [Access, scheduling and caveats](analytics.md#analytics-completion-and-seo-growth--27-november-2026)

A live weekly run also preserved partial status while completing current/previous Cloudflare traffic/performance; successful empty Worker reports do not establish zero website traffic. Local validation: **190 Node tests passed**, reporting typecheck, Astro check, static build, PowerShell syntax, relative links and diff checks passed. Independent review findings were corrected and verified. No dependencies were changed.

The current review uses actual Planner demand estimates, fresh finalized GSC, URL inspections, independently qualified CF evidence and inspected competition. It proposes a small batch around existing word-order content, writing hubs and case/article practice, with DTZ indexing investigation alongside it. The mock test remains crawled/not indexed after a 26 November crawl, while cases/writing are indexed and Google downloaded the 297-URL sitemap today. No exclusion cause is established. Clean GA4 learning evidence and the exact UTC comparison remain unavailable. Content priorities still need owner approval; no education content or collection settings were changed.

Next: observe scheduled runs and processed clean GA4 after the baseline; complete the Cloudflare dashboard/scope reconciliation; use the exact native Looker/Exploration recipes where saved-report creation lacks a supported API; approve a small content batch and the embedded experiment's evidence method. Essential read-only integrations now function; stop expanding analytics infrastructure. Keep the aggregate-event endpoint deferred. Earlier verification paragraphs below record their dates and are superseded by this continuation where scope/access status changed.

Final reporting verification, 27 November: 173 tests, reporting typecheck, Astro check and build passed. The current credential was absent from generated report files scanned. Dashboard comparison, exact UTC GA4 extraction/clean live coverage, positive Worker evidence, token-policy scope and regional/rule-scope checks remain open. See [final verification and manual checks](analytics.md#final-local-verification--27-november-2026). Do not describe the entire analytics handoff as fully verified while these gaps remain.

Cloudflare reporting update, 27 November: local read-only check, traffic and performance commands export dataset capabilities, browser/edge traffic, performance, Worker outcomes and catalog rollups. Production collection and page-view duplicate checks are recorded in [analytics operations](analytics.md). `seo:combined --cloudflare <browser-pages.json>` adds descriptive Cloudflare page evidence. `cloudflare:coverage` validates compatible exported evidence and reports unavailable when gates fail; exact UTC GA4 extraction and positive live clean-period joins remain pending, along with opportunity extensions. These local tools do not establish visitor learning outcomes, change tracking, or require deployment. Preserve unknown classifications and sampled/empty-result qualifications.

## Current status — 26 November 2026

Phase 11 feasibility review (27 November): Analytics Engine could support coarse learning-action counts, but implementation is recommended to remain deferred until the clean GA4 baseline and a concrete experiment question justify it. Free-plan eligibility, privacy/consent treatment, abuse controls and duplicate semantics would need verification for any future endpoint. [Investigation and sources](analytics.md#phase-11-investigation--27-november-2026). This review added no collection or infrastructure.

The Astro and TypeScript site is live at `https://baulingo.app`. The main Cloudflare Worker serves the allowlisted static build in `dist/`. The separate WWW Worker preserves paths and queries when redirecting to the apex. Browser-local progress, drafts and exam attempts stay on the device. [Production release](production.md#release--26-november-2026) · [Current architecture](architecture.md)

The website's opt-in GA4 property, `baulingo-web`, passed the configuration check with 19 dimensions, five metrics and three managed key events. Search Console is linked to the correct web stream and the apex sitemap is submitted. Production browser and Realtime checks established dispatch and some ingestion. Use complete dates from 27 November onward for unified reporting. [Schema and operating guide](analytics.md#reproducible-ga4-configuration) · [Live search audit](production.md#production-search-audit--26-november-2026)

### Remaining work

The Google-tag page-view fix is deployed and verified in production Chrome. [Release and checks](production.md#page-view-fix--26-november-2026)

1. Rerun the GA4 attribution and learning reports after complete post-release days have processed. Confirm the expanded sitemap is picked up on Google's next read.
2. Create the saved GA4 Explorations and native Looker Studio report, check whether the Search Console reports collection is published, and inspect Core Web Vitals field coverage. [Reporting setup](analytics.md#reporting-setup)
3. Continue the roadmap's next product milestone with one embedded demand or preference experiment and a defined evidence method. [Roadmap](roadmap.md)

## Site-wide cookie settings

The localized cookie dialog is live on `baulingo.app`. It offers equal access to rejection, configuration and acceptance. The existing opt-in storage key and browser-local learning data remain compatible. Privacy and Imprint stay readable on entry and expose the footer control. [Release verification](production.md#release--26-november-2026) · [Analytics behavior](analytics.md#cookie-settings)

## Phase 7 release readiness

`npm run build` produces the Astro release artifact in `dist/`. Use `npm ci` on Node 24 and `npm run preview` to inspect it locally. CI checks and packages the same artifact. [Migration verification](migration.md#phase-7-release-readiness) · [Release and rollback](production.md#astro-release-and-rollback)

## Phase 6 unified analytics

The deployed contract uses stable page and content IDs and consented analytics. The same specification drives local GA4 check, sync and verify commands. [GA4 configuration runbook](analytics.md#reproducible-ga4-configuration) · [Production measurement audit](analytics.md#production-measurement-audit--26-november-2026)

## Published formats

Phase 5 moved all indexed pages to the catalog, including six course overviews, the A1 practice test, topic and phrase pages, DTZ guides and practice formats, and app information. German mock-test and writing pages have static previews with the existing full interactive exercises. [Phase 5 verification](migration.md#phase-5-remaining-formats)

## Site-wide language preference

The English and Turkish controls share the same browser preference across homepages, topic pages, course levels, grammar hubs and lesson readers. Lesson switches open the matching lesson; grammar and everyday links stay in the selected edition. The German DTZ materials retain their separate English and Turkish help links. The bare homepage respects the saved choice, and direct localized URLs remain shareable.

## Grammar course

The Turkish and English homepages now link to separate grammar courses at `/konular/almanca-gramer/` and `/en/german-grammar/`. Each edition imports 21 A1, 16 A2 and 16 B1 samples from `GermanPacks/pack1a/data/samples/` in the source's teaching order. The course level pages and grammar hubs link in both directions. Grammar lessons expose the rule and a bilingual example in initial HTML and link to an everyday lesson for practice. The interactive reader links back to the relevant grammar lessons.

## Readable lesson URLs

All 67 lessons have separate English and Turkish lesson URLs. The published HTML includes the lesson title, objective and a bilingual example. Course lists, the Turkish A1 practice test and the reader use these URLs. The previous `?topic=` links open the same lesson and update to its readable address in the browser. The static build and preview now include all 134 lesson routes and the three English course pages.

## A1–B1 course pages and A1 practice test

The homepage links to static A1, A2 and B1 course pages at `/konular/almanca-a1/`, `/konular/almanca-a2/` and `/konular/almanca-b1/`. Each lists every lesson at that level and includes an authored sample exercise. The 12-question `/konular/almanca-a1-test/` checks vocabulary, sentence structure and short reading prompts. Results include Turkish explanations and links to relevant lessons. The test does not store answers or assign a CEFR level.

## Almanca Kursu navigation

The Turkish menu links directly to the 67-lesson course as **Almanca Kursu**. The homepage card has direct starts for A1, A2 and B1. The course keeps its existing URL at `/konular/mini-paketler/`.

## DTZ-Prüfung hub

The German hub at `/de/dtz-pruefung/` links to the complete German Modelltest and the original 15-chapter German writing course, with its 47 activities and model answers. `/en/dtz-exam/` gives English test and writing guidance. `/dtz-sinavi/` links to the existing test and course with Turkish help. The build publishes the two German learning experiences as on-demand compressed fragments and keeps the hub and help content in static HTML.

## Turkish and English mini-packs — 21 November 2026

Konular links to `/konular/mini-paketler/` and English Topics links to `/en/mini-packs/`. Each library contains 17 A1, 22 A2 and 28 B1 authored samples from `GermanPacks/pack1a/data/samples/`, with the Turkish collection taken from its `tr/` directory. The shared reader uses the original layout, catalog order and language picker with Baulingo colors. Each library loads only its selected language.

## Historical implementation notes

The entries below record development and verification at the dates indicated. Local test counts, review sessions and publication status in those entries describe the work at that time. The current release and remaining tasks are above.

### Writing audit fixed — 3 November 2026

The owner requested all Product Design audit fixes and will perform the final review. The course now has 22 learning lessons plus two reference pages, 47 tasks in six appropriate formats, visible required choices, point-linked letter plans/checks/annotated models and 64 translated phrase entries. Resume targets unfinished work; save status is beside editors. Prior text/plan data remains accessible; old generic checks are kept separately. Multi-tab saves merge changed fields and failed-storage export includes later memory edits. See [the final review checklist](content/dtz-writing-review.md). No deployment or push is authorized by this request. The LAN preview remains on port 4173.

### DTZ letter-writing update — 2 November 2026

The owner chose the Turkish short-lesson adaptation of their `dtz-writing-book-web`. It is prepared locally at `/dtz-mektup-yazma/`: 24 lessons, 11 letter types and all 47 original answer/model activities, plus short interactive checks. Drafts, plans, self-checks, revisions, notes, explicit completion and optional clocks remain in this browser. Export and scoped reset are available. See [content and boundaries](content/dtz-writing.md). Review is the newest entry at `/dev/review/`. Publication remains pending authorization.

The requested LAN preview uses the last active port: `http://192.168.178.22:4173/` (bound to `0.0.0.0:4173`; the computer's LAN address may change).

Updated: 1 November 2026. [Production preparation](production.md) is the current verification and release checklist.

Live status: the owner deployed the static site at `https://baulingo.app`. The authorized WWW-only redirect Worker is also deployed and verified for HTTP/HTTPS 301 redirects retaining paths and queries. See [its operational notes](../cloudflare/www-redirect/README.md). Cloudflare login is available through local Wrangler; no credentials are in Git. Deployment verification is recorded in production.md.

Read [the roadmap](roadmap.md), [the setup](setup.md), [the approved visual reference](design/homepage.md) and [the architecture](architecture.md). The roadmap owns product sequencing; this handoff identifies the next implementation work. Continue in this website repository. Keep native app work in its separate repository.

### Current live foundation

The owner selected Turkish speakers as the first audience and supplied the final homepage screenshot. Its layout and visible wording are authoritative. Further development should proceed in small steps.

The site has a search-led hero, a cafe phrase with recorded audio, three topic columns and a resource banner. The sentence exercise, topic explanations, search, language information and resources open in accessible dialogs. Topic and resource content also has static readable pages. Two original text study notes can be downloaded without signup. Exam packages remain planned.

The site uses static HTML/CSS and browser JavaScript modules. Pure exercise and search rules are separate from DOM rendering. No framework migration or backend was added.

- `npm run dev` starts the local preview at http://127.0.0.1:4173.
- `npm test` runs 18 checks for learning rules, Turkish search, public paths, generated pages, deployment output, HTTP behavior and the WWW redirect.
- `npm run build` writes an explicit public allowlist to `dist/`.
- `.dev/`, `dist/`, local environment files and dependencies are ignored by Git.

### Verification

The tests and static build pass. Chrome checks cover the primary interactions, audio, downloads, focus return and console errors. Responsive checks cover eleven widths from 320 to 1440 px, including intermediate tablet widths. Topic/resource navigation also works without JavaScript. The owner supplied the postal address for the new Impressum; privacy edits update publisher contact and website hosting only. Native app telemetry paragraphs are unchanged. Build output excludes docs, tests, scripts, Git metadata, source artwork, raw fonts and local browser files.

[Design QA](../design-qa.md) records the visual comparisons, fixes and remaining minor differences. Local screenshots and browser logs are in the ignored `.dev/` directory. They are not deployed assets.

### DTZ simulation prepared locally

The owner requested the existing full simulation from `german-exam-app`. It is implemented at `/dtz-deneme-sinavi/` in the main site's static build, linked from the existing homepage exam column, exam topic/search dialog and resources. It includes the original 20 listening + 25 reading items, continuous audio, writing A/B, speaking A/B images, local resume and a receptive score/review. Writing/speaking are not automatically graded. The app repository is unchanged. [Port notes](content/dtz-web.md) record source hashes, limits and local verification. The owner approved a separate 10 MB DTZ media allowance alongside the existing 2 MB core limit. The owner has authorized a local commit of all reviewed changes. Deployment still requires separate authorization.

The current suite has 44 passing tests, including local review and performance tooling. Full browser flow, audio playback/end, timer expiry, reload/resume, local writing, error/retry, denied storage, corrupt-state reset, keyboard selection and no-JavaScript fallback passed locally. A fresh read-only review found no important bugs and independently ran the five pure DTZ tests. Publish only after authorization, then recheck live audio byte ranges, routing, exercise behavior, privacy and analytics.

### Historical next steps

The owner can review recent changes and walk through the website at `http://127.0.0.1:4173/dev/review/` in the current local session. **Refresh changes** rebuilds current source; DTZ shortcuts use isolated sample progress. Notes/decisions stay in ignored `.dev/website-review.json` and never trigger agent work or publication. See [local review instructions](development/review.md). Development-only review tools are not part of the pending public release.

Cloudflare analytics support and the website privacy disclosure are deployed with authorization. Live browser checks confirm automatic beacon loading (HTTP 200) and same-origin RUM acceptance (HTTP 204) on homepage and topic-index visits without CSP errors. Version: `f08cba0f-c32c-4a16-aaa8-df1a22d063f0`. A separate read-only token in the ignored local `.env` now permits analytics inspection. The reporting API confirms four ingested page views consistent with verification traffic. Automatic collection is enabled with an active host `*` / paths `["*"]` rule; proposed production-host/path restrictions have not been applied. See [analytics operations](analytics.md). No manual script was added. This does not replace the embedded experiment's evidence method.

1. Complete the authorized local cleanup and commit; obtain separate publication authorization. The latest priority is acquiring traffic with this existing useful resource, not adding another homepage preference selector.
2. After publication, choose and record specific community/teacher placements and inspect Search Console/Cloudflare acquisition evidence. No outreach or distribution results exist yet. Aggregate website analytics is deployed, but no experiment event pipeline is implemented.
3. Once visitors arrive, define the next experiment's question, experience, evidence and decision before expanding content or tracking. Native app telemetry is outside this task.
4. Evaluate the evidence against the brief's success criteria, then expand, adjust or stop the experiment. Use that result to prioritise content and practice improvements in the roadmap.
5. For website releases, follow production.md and recheck the preview, HTTPS, WWW redirect, nested paths, assets, downloads and legal pages. Account billing settings and the full DNS configuration remain unaudited; do not enable paid plans.

Keep old GitHub Pages privacy access during migration. The app's policy URL is a separate app task. Product experiments belong within existing website pages and the normal site deployment, to learn about Turkish-speaking visitors' demand and preferences. The previous separate experiment page/project/subdomain direction is superseded.

The app repository still has a public-site export script. Do not use an older export to overwrite this independent website source.

### Limits

The main site, HTTPS custom domain and WWW redirects have now been verified live; account billing settings and the full DNS configuration have not been audited. The WWW setup added only its dedicated Worker route, with no DNS edits or paid-plan changes. Native app code and telemetry remain unchanged. Recheck live behavior after future deployments.

### Local performance changes

The performance review entry is **Faster homepage, same design** at `http://127.0.0.1:4173/dev/review/`. It covers responsive hero copies, Turkish/German font subsets (Lato-derived Baulingo Sans), and content-hashed immutable core assets. These changes are not deployed; baseline PageSpeed scores remain mobile 97 / desktop 99. See [performance notes](performance.md).

The initial review follow-up applied three saved comments: a collapsible phone menu, removal of the free-resource header link, and removal of the last DTZ pre-start sentence. Component **+** buttons now attach local feedback to main sections and dialogs; saved notes can be edited or deleted. Original notes and approvals remain local. The owner confirmed approval of all changes in chat on 1 November; saved notes have not been rewritten. See [review instructions](development/review.md).

### Local resources removal

The owner requested removal of the free resources section. The local website no longer publishes its page or downloads; the original source files remain in the repository. This does not change the independent Android app. This change is not deployed.

### Local review follow-up

The latest saved-comment changes are **Sade filtreler, sabit başlık ve temiz yazma alanı**. Study pages default to level/content filters; the four remaining controls are inside Gelişmiş filtreler. Each sticky level row includes synchronized Liste / Tablo controls and the current topic while scrolling, on desktop and mobile. Writing pages no longer show the standalone phrase rail or initial browser-only notices. Inline phrase help, the full reference, the actual letter preview and relevant storage-failure feedback remain. Original notes/approvals are preserved; publication remains pending.

The owner authorized merging the guided-letter branch into `main` locally. The existing website baseline was checkpointed first; the guided changes form a separate feature commit. After merging, the owner requested removal of the guided and two experiment worktrees and their local branches. Only the main worktree remains; source files and local review notes were archived in ignored `.dev/retired-worktrees/` before cleanup. No remote push or deployment is included.

The combined simple-format design is merged locally into `main`. **Birlikte yazalım: adım adım mektup** is first in review. Guided full-letter tasks use one field per step, an interactive letter preview, three related phrases and the full toolbox, including during final editing. Labelled icons and list presentation support the original wording. Old drafts, separate section work and independent full-text edits are retained; export includes the parts and backed-up prior draft. Simulation and short-answer formats remain unchanged. No commit, push or deployment was inferred from creating the branch.

13 November studio update: applied the owner's [compact writing reference](design/dtz-writing-studio.md). The newest review entry is **Kompakt mektup stüdyosu**: grouped lesson navigation, learning/writing stages, one task at a time, collapsible instructions/checks, a visible searchable phrase toolbox with cursor insertion, and live draft preview. Phones use an expandable toolbox. All 24 destinations, 47 tasks, 64 phrases and authored learning content are unchanged; existing drafts and progress use the same storage. Local verification covers 75 passing Node tests, public build/budget checks and browser flows at 320/390/800/1024/1487 px. Publication remains pending.

13 November: the three saved owner comments were applied locally. Writing navigation now says “Mektup Yazmaya Giriş” and the course start section says “Nereden Başlamak İstersin?”. The mobile Liste / Tablo switch sits inside the first visible study level section, below its introduction, and follows level filtering. The newest review entry links all three original notes; the notes and approval states are preserved. Publication is pending.

The local homepage now links grammar and daily-life topics directly to their static pages; topic practice uses topic-specific sentences. The app information page links to the owner-provided Google Play open-alpha listing. The DTZ result no longer offers a new-attempt button. These changes await publication. A locally prepared English section now offers independently written lessons on appointments, word order and articles, with English browser-language detection and a manual switch. The English app page was removed at the owner’s request. DTZ instructions and other Turkish pages have not been translated; the English section is limited to its published lessons.

### English homepage SEO preparation

The local English homepage now leads with beginner German, original English explanations, three existing lesson destinations, recorded café audio, a sentence task and getting-started questions. It uses the approved Baulingo artwork, colours and type. Metadata includes a descriptive title/description, canonical URL, social previews and reciprocal English/Turkish homepage language links. No keyword-volume, ranking or traffic results have been measured. The English app page remains removed.

### Shared English sentence builder

English homepage and lesson practice now use the same DOM controller and pure selection/checking rules as Turkish. Independent English task data supplies coffee/tea, word order, articles and appointment sentences with contextual hints. English tasks have three to five words; longer tasks wrap into two columns on phones. Readable examples remain available without JavaScript. The Turkish café flow is preserved.

The full saved-comment audit is recorded in [review follow-up](development/review-followup.md). The remaining B1 letter shortcut now leads to the available DTZ simulation. Turkish practice meanings were checked against their German sentences.

### Local exam overview and saved review

The Sınavlar header link now opens `/sinavlar/`. This static overview has DTZ mock-test and study-list links plus a brief Turkish guide to DTZ, Goethe/telc, DTB and TestDaF/DSH audiences, linked to official sources. Only DTZ preparation is offered. The mock test and study page link back to the overview. The single saved comment requesting removal of the printer example was applied; the original local feedback is retained. These changes are prepared locally and are not deployed.

The exam overview now prioritises the available DTZ test and study lists in two prominent content cards. The complete exam-audience guide is secondary, below the materials in a native disclosure under “Sınavlar hakkında”; it is collapsed by default and remains accessible without JavaScript.


14 November: the approved scene-first proposal is implemented locally. Writing goals, task context and required points are visible; navigation/task/reference groups use normal headings. The guided preview is visible below the editor on phones. Optional plans, answers and original text retain reveal controls. The newest comment removes duplicate level chips and enlarges sticky headings with smooth transitions. Scene/dialog/button/preview motion respects reduced motion. Original comments are preserved and linked from the first review entry, **Önce içerik: açık sahneler ve yumuşak geçişler**. Chrome checks at 320/390/800/1440 px cover context, filters/views, 64 phrase entries/search/insertion, draft reload, focus, simulation, all 24 writing destinations, reduced motion and static no-JavaScript content. Publication remains pending.


14 November: applied the approved [German-language presentation convention](design/language-presentation.md). Inline German expressions use italic type and pale sage targets; nouns retain articles and bold upright type. Standalone examples are upright with translations below, outside German language scope. Turkish topics/dialogs, English lessons, writing references/suggestions and sentence feedback are covered. Existing text, exercise answers and draft storage remain. The newest local review entry is **Almanca ifadeler ve anlamları daha belirgin**. No deployment.


14 November editorial follow-up: the owner requested a systematic check of technical and non-learning sentences. The [interface-copy audit](content/interface-copy-audit.md) records 30 proposed decisions (16 remove, 12 shorten, 2 consolidate), with source locations, display conditions and a keep list for useful learner guidance. Recommendations have not been applied; public copy and saved review comments remain unchanged by the audit.


14 November: the owner approved the interface-copy cleanup after its dependency review. All 30 audit decisions are implemented locally. Counter/live regions and controls remain; scripts no longer depend on the removed sidebar tagline or the draft editor’s next sibling. Useful error, timing and fallback guidance stays, with one brief scope notice near export. The newest review entry is **Daha az açıklama, doğrudan çalışma**, linked to the original saved comment. All 83 tests and the static build pass; focused Chrome tests cover word-order answers, counters, completion and draft reload, timers, DTZ writing/results, blocked audio, denied-storage export/reset and no-JavaScript fallbacks. No deployment or commit.
