# Production operations

The current Astro release is live on `baulingo.app`. The approved homepage layout and Turkish copy remain authoritative. Earlier entries record the test and deployment state at their stated dates.

The [long-term roadmap](roadmap.md) owns product priorities. The next product milestone is one embedded demand/preference experiment with a defined evidence method. This document records delivery operations and verification; no measurement pipeline has been added by the roadmap update.

## Reporting release — 27 November 2026, 15:59 UTC

The owner authorized committing, pushing and deploying the reporting handoff. Source commit `68ca33e2e3ac930be442c61ee21b8a77258184cd` adds worldwide keyword research, enforced Desktop OAuth, scheduled local snapshots and the qualified opportunity workflow. Generated reports, credentials and scheduler state remain outside Git and the static release. No educational content, consent behavior, paid services or collection settings changed.

Fresh local verification passed all **190 Node tests**, reporting TypeScript checks, OAuth validation tests, Astro checks (nine files; no diagnostics), the production build and Wrangler dry run. Relative documentation links and diff checks passed. A literal scan of 1,243 source/output/report files found no matches for the current Google refresh token, client secret or Cloudflare reporting token; this is a targeted check, not a general secret audit. Dependencies and the lockfile are unchanged. [Linux CI run 46029390381](https://github.com/mahmutyoung/baulingo-site/actions/runs/46029390381) also passed the clean install, Astro checks, tests and build.

The authorized push triggered Cloudflare build `e215a2ac-c7c1-4ea6-a2e8-8f938408591e`, which succeeded for that commit. Independent deployment inspection confirmed deployment `26c53f6f-ce64-41a8-be0a-ca5eb5f8388c`, created at `2026-11-27T15:58:10.768901Z`, serving version `822d0977-3ca2-4f10-a75f-b10a6422ef20` at 100%. Previous version: `6c1aa69b-9551-4b56-b545-27ba6feb47bc`. This used the existing Git-linked main-site deployment; the separate WWW Worker was not redeployed.

Post-deployment HTTP checks passed at 15:59 UTC: public/learning/legal routes returned 200; documentation, developer review, reports, scripts and a missing path returned 404; WWW preserved the path/query in its 301; workers.dev retained noindex; robots referenced the sitemap. Live analytics, cookie-consent module and the 297-URL sitemap matched the verified build by SHA-256. Evidence is retained locally in `.dev/release-68ca33e/` and `.dev/release-68ca33e-deployments.json`. These are HTTP/asset checks, not a new browser interaction or live event-ingestion audit. The [remaining analytics gaps](handoff.md#analytics-completion-and-seo-growth--27-november-2026) remain open. Later documentation-only commits can trigger equivalent builds; inspect deployment metadata for the latest active revision.

## Local reporting verification — 27 November 2026

### Remote build and active production verified — 27 November, 09:17 UTC

Read-only GitHub inspection confirmed `origin/main` at `ae9e33f94158f097fdb12044842542ea38cc5dc3`. Remote `package-lock.json` blob `116596efd621f9933683a68daa7e08c40eb8b0a2` equals the local repaired lockfile. [Ubuntu CI run 45923362348](https://github.com/mahmutyoung/baulingo-site/actions/runs/45923362348) completed successfully, including Node 24 setup, `npm ci`, Astro checks, tests, build and artifact upload. This establishes a successful Linux clean install/build, separately from the earlier Windows check.

The Cloudflare GitHub check reports build `ddcc7df3-1244-4a2f-9435-0b66ec3ff33c` successful for that revision and version `6c1aa69b-9551-4b56-b545-27ba6feb47bc`. A separate authenticated Cloudflare deployment read confirms deployment `7141503b-15c0-4488-a572-9c026fb369c6`, created at `2026-11-27T01:35:37.079153Z`, serves that version at 100%. The revision-to-version association comes from the successful build check; version metadata alone does not expose a Git SHA. [Cloudflare build](https://dash.cloudflare.com/f79d2839a11db7e10fab2b9f9f5635ec/workers/services/view/baulingo-site/production/builds/ddcc7df3-1244-4a2f-9435-0b66ec3ff33c)

Live HTTP checks passed for Turkish/English homepages, DTZ mock exam, case topic and legal pages (200); docs, developer review and a missing path (404); WWW query-preserving HTTPS apex redirect (301); workers.dev `noindex`; robots sitemap discovery; and all 297 sitemap locations matching the current catalog. Production analytics, cookie module and sitemap SHA-256 hashes match the fresh local `dist/` output. The analytics module is transformed during packaging, so comparing it directly with untransformed `src/analytics.js` would be the wrong comparison. Local evidence is in ignored `.dev/handoff-2026-11-27/`. These checks read an existing deployment; no push, retry, deployment or external setting change was performed.

The local Cloudflare analytics integration passed 173 Node tests, the reporting TypeScript check, the Astro check and the static build. Read-only live queries verified resource/dataset access and generated local traffic, performance and catalog reports; production Worker queries returned empty results. Credential exclusion and report-integrity checks are recorded in [analytics operations](analytics.md#final-local-verification--27-november-2026). Dashboard agreement, positive Worker results and exact-boundary clean-period GA4 coverage remain unverified. These are local reporting changes, not a website release; no deployment, domain/plan change, new collection endpoint or consent change was performed.

### Cloudflare clean-install failure reproduced and checked

The owner supplied a 26 November Cloudflare build log failing during `npm ci` with npm 10.9.2, before the site build, because eight nested `@emnapi/core`/`@emnapi/runtime` entries were missing from the lockfile. An isolated copy of revision `2f4cdef` reproduced those same missing-package errors with npm 10.9.2. The repaired lockfile in local commit `3840842` passed npm 10.9.2 clean-install validation. A fresh archive of that commit then passed a real `npm ci` (274 packages installed) and `npm run build` in ignored `.dev/clean-install-3840842/`.

This verifies clean installation independently of the existing `node_modules`. It ran on Windows with Node 24.19.0; the supplied Cloudflare log used Linux with Node 24.22.1. It is not a successful remote-build or deployment result. Cloudflare must build a revision containing the repaired lockfile; retrying the old revision cannot pick up the local fix. No push or deployment was performed.

## Live deployment

### Page-view fix — 26 November 2026

At 20:27 UTC Cloudflare activated main Worker version `b68e5ef3-2535-4914-9e51-48b4ae45aa6f` at 100% traffic, replacing `ddb4d13d-cd05-4b3a-8e40-d5cbede508e5`. The authorized deployment used the verified local build based on `2317162` with the analytics fix. Wrangler uploaded only the changed `/src/analytics.js` asset. The WWW Worker remained separate.

All 112 tests, the production build and Wrangler dry run passed. The live analytics module and sitemap matched the build byte for byte. Apex learning and legal routes, private-path 404s, the query-preserving WWW redirect and workers.dev noindex passed HTTP checks. Chrome captured one clean, attributed GA4 page view each on the homepage and Topics and no Google tag or requests with consent denied. The browser harness intercepted synthetic collection requests. [Measurement audit](analytics.md#production-measurement-audit--26-november-2026)

### Release — 26 November 2026

The owner authorized pushing and deploying `main`. Source revision `776f723` is live on `baulingo.app` through the existing `baulingo-site` Worker. Active deployment `0defc701-92ac-4116-aabb-9faa50e5820f` serves version `ddb4d13d-cd05-4b3a-8e40-d5cbede508e5`. The previously active version was `4a47e873-6fb3-4945-8408-09a39caa07cd`. This releases the Astro build, unified analytics and the shared cookie settings. The WWW redirect Worker remains a separate deployment.

All 112 Node tests, the Astro check, the production build and the Wrangler dry run passed. The live cookie assets, analytics module and sitemap matched the build. HTTP checks covered public and legal routes, private-path 404s, security headers, robots discovery, the WWW query-preserving redirect and the workers.dev noindex response. Chrome on the live site checked all three languages, keyboard focus, legal links, persistent choices, cross-tab withdrawal and lazy DTZ audio playback. The Google tag was stubbed for those release checks. The subsequent [production measurement audit](analytics.md#production-measurement-audit--26-november-2026) records real browser transport, Realtime ingestion and processed reporting limits.

The live DTZ MP3 played on demand and matched the release bytes. The static-assets endpoint returned the full file with HTTP 200 when sent a Range request, consistent with the documented static-assets limitation. [Cloudflare range behavior](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests)

### Release — 15 November 2026

The owner authorized pushing and deploying the merged main branch. Source revision `73d2647` is pushed to GitHub and deployed to the existing `baulingo-site` Worker, version `97ce523c-acf4-49d5-adee-615c6b71cad7`. This publishes the local learning UI, writing-course and consent-based GA4 changes described in earlier entries; their previous unpublished status is historical. The separate WWW Worker was not redeployed.

All 85 Node tests, the static build and `git diff --check` pass. The study-filter test now accepts optional HTML attribute quotes removed by the existing build compaction. Live HTTP checks return 200 for the Turkish/English homepages, writing course, study page, privacy page, CSS and analytics module; the CSS and module match local bytes. Homepage and privacy HTML first differ at Cloudflare's injected closing-body script. Missing pages, development review and documentation paths return 404. The homepage sends `X-Content-Type-Options: nosniff`; WWW returns 301 to HTTPS apex preserving path and query. These are HTTP checks, not a fresh browser interaction or analytics event-collection audit.

Wrangler's existing OAuth login worked when an ignored empty environment file bypassed the stale local API-token override. No credentials, domain settings or paid services were changed.



`https://baulingo.app` serves the main static site. Its homepage, topic/legal pages and downloads return 200; missing pages return 404. Public responses include security headers and do not include the preview noindex header.

The owner authorized and authenticated the WWW redirect setup. Wrangler's OAuth permission grants Worker routing, but the zone Redirect Rules API returns 403. A dedicated [WWW redirect Worker](../cloudflare/www-redirect/README.md) now serves only `www.baulingo.app/*`, returning 301 directly to HTTPS apex with the path/query preserved. Version: `12357254-9074-4dcb-acb0-c3b5218ca07c`. Live HTTP/HTTPS, nested-path, encoded-path and query checks pass. The apex stays on `baulingo-site`; no DNS edits or paid-plan changes were made for this redirect.

The local Wrangler login is stored by Wrangler outside the repository. No credentials are committed. The WWW Worker has a separate explicit deployment command; the main site's Git-linked build does not deploy it.

## Build and verify

### Writing-course audit fixes — local, 3 November 2026

The owner asked to fix the entire Product Design audit and will perform the final review. The local course now distinguishes 22 lessons and two reference pages, 47 tasks in six formats, 21 point-linked full-letter workspaces and 64 translated phrase entries. See [the owner checklist](content/dtz-writing-review.md). No deployment, push or commit was performed for this request.

The full Node suite passes 74/74 tests; the static build and public 2 MB budget pass (core output approximately 1.94 MB). Tests cover task formats, visible stimuli, real planning points, annotated excerpts existing in their models, phrase meanings/examples, preserved legacy text, bounded structured answers, unfinished-task resume, reference exclusion and merging only changed fields into stored state. A read-only technical review found short-task revision binding and whole-lesson overwrite risks; failing regressions were added and both were corrected. Its two smaller findings (visible `weil` instruction and ordering announcements) were also corrected. A quota-failure browser regression exposed stale later memory edits in export; it failed before the memory-merge fix and passed afterward.

Fresh Chrome checks cover all 24 pages, match/choice/cloze/order/short/letter controls, per-item feedback, Enter-key checking and order undo, reload persistence including short revisions and old drafts/plans/check migration, point-linked plans/models, reference meanings, unfinished-task anchors, reference completion excluding the lesson count, reopening a lesson after a text edit, A/B choice with preserved drafts, reload deadlines/expiry, actual exported Blob text, sequential two-tab edits after shared storage propagation, subsequent in-memory edits after quota failure, denied-storage warnings beside editors, no-JavaScript choices and 320/390/768/1440 px overflow checks. No runtime exceptions were observed. Screenshots were inspected for the key phone and desktop states; artifacts remain ignored in `.dev/writing-fixes-2026-11-03/`.

These are local technical checks. No human learner pilot, actual screen-reader speech, physical phone keyboard test or educational certification is claimed. Fundamental DTZ writing structure and capitalization/register guidance were cross-checked against the primary sources linked in the owner checklist. The owner's final editorial/educational review remains pending.

### DTZ letter-writing course — local, 2 November 2026

The requested Turkish adaptation is prepared at `/dtz-mektup-yazma/`, linked from the homepage, exam overview and topic/search. See [content and privacy boundaries](content/dtz-writing.md). No deployment or push was performed.

`npm test` passes 66/66 checks; `npm run build` and `git diff --check` pass. Chrome checks cover choice/cloze/order feedback, Enter-key checking, saved drafts/plans/revisions/self-checks, deliberate completion and resume, 320/390/768/1440 px layouts, independent A/B drafts, unchanged deadlines after reload, editable writing after expiry, actual exported text, saved learning notes, quota failure, denied/corrupt storage, reset retaining an unrelated storage key and static reading without JavaScript. No runtime exceptions occurred. Screenshots were inspected on desktop and phone. A reproduced mobile-to-desktop closed-navigation bug was fixed and its browser regression passes. A separate read-only code reviewer found two accessibility issues (Turkish answer language and live countdown announcements); both were fixed with a failing-then-passing markup check. Actual screen-reader speech was not tested.

Large asset deduplication keeps the core output around 1.81 MB under its existing 2 MB test budget; the separate DTZ media budget is unchanged. Tests verify exact rewrite targets, original asset bytes, revalidation on alias URLs and immutable caching on hashed URLs. Cloudflare's documented static `200` rewrites were checked against official documentation; live edge behavior has not been verified for this unpublished change.

The user requested the last active port on LAN. Development preview is running on `0.0.0.0:4173`; loopback and this computer's `http://192.168.178.22:4173/` return HTTP 200. This is a same-computer LAN-interface check, not confirmation from another device. The LAN address can change.

### DTZ simulation — historical local verification

The owner requested the app's original full DTZ simulation on the website and approved a separate 10 MB lazy-media allowance, retaining the 2 MB core limit. `/dtz-deneme-sinavi/`, its homepage/topic/resource entries, local-only attempt storage and the corresponding website privacy disclosure are implemented locally. This entry records the original local checks. The simulation is now live in the main static build. The independent app and legacy GitHub Pages policy are unchanged. See [content/provenance and verification notes](content/dtz-web.md). The port is a technical adaptation, not an assertion of official certification or completed human editorial/audio review.

25 tests pass locally, including DTZ content/state/scoring/deadline boundaries, static output and audio ranges. Chrome checks pass for the complete four-section flow and 45/45 result, with real media loading/decoding and seek-to-end completion; reload/deadlines, local draft persistence, keyboard, audio failure/retry, storage denial, corrupt-state deletion, no-JavaScript fallback and 320/390/768/1440 px layouts. There were no answer/draft POSTs in the full local flow. A fresh read-only reviewer found no important bugs and independently ran the five pure DTZ tests. These are local checks, not live DTZ verification.

### Initial Cloudflare Web Analytics deployment — 30 October 2026

On 30 October 2026 the owner authorized publication of Cloudflare analytics support and the website privacy disclosure. The zone API confirms the Free Website plan. Final main-site version: `f08cba0f-c32c-4a16-aaa8-df1a22d063f0`, deployed from working-tree changes based on `57d04316378916291ac92765ca78b4ec74411440` (no commit or push requested). Initial version `22138c30-76a8-4dbf-9f1b-21f8dcbe8bc1` allowed only the unversioned beacon; a live browser revealed Cloudflare's versioned script path, so both CSP policies were corrected and redeployed. Live Chrome checks now confirm the automatically injected script loads (HTTP 200) and homepage/topic-index RUM POSTs succeed (HTTP 204) without CSP or network errors. A network trace locates this check in Germany. Non-browser fetches did not receive an injected beacon, so raw HTML checks alone are insufficient. The refreshed Wrangler login can access the zone and Worker, but Web Analytics inspection returns HTTP 403 because the login lacks account-settings permissions. A subsequently supplied read-only token in the ignored local `.env` permits RUM configuration and GraphQL reporting checks. Automatic collection and the ruleset are enabled, with one active inclusive host `*` / paths `["*"]` rule. The reporting API confirms four page views (two homepage, two topic index) on 30 October 2026, consistent with verification traffic. No account settings were changed; narrower hostname/path exclusions remain proposed and regional options were not established. The dashboard UI was not inspected. No manual beacon was added. [Analytics configuration](analytics.md) records the remaining account checks and useful review views.

Use Node 24 and install the locked build dependencies.

```powershell
npm ci
npm test
npm run check:astro
npm run build
npm run preview
```

Preview http://127.0.0.1:4173. `npm run dev` also builds before serving; it does not watch for edits. The preview serves `dist/`, not repository files. It mirrors common security headers, downloads, slash redirects and real 404 responses. Cloudflare controls its own edge cache, TLS and hostname rules.

`scripts/public-files.mjs` is the publication boundary. Source photos and TTF files stay in Git but are excluded from deployment; the build publishes WebP/WOFF2 and their licenses. Adding a file under `assets/` does not automatically publish it. Source symlinks are rejected. The automated core-output budget remains 2 MB. The owner approved a separate 10 MB limit for the exact three-file DTZ media allowlist; its original audio/images total 8,913,392 bytes. Exam audio is requested only when listening starts, not when the homepage or landing page opens. The static site needs no database, learning-state cookies or remote fonts. DTZ attempts/drafts use localStorage only; Cloudflare automatically injects its Web Analytics script for aggregate traffic and performance measurement.

Optional asset encoding uses `scripts/optimize-assets.py` with its pinned Python dependencies. It generates responsive WebP copies and Latin/Turkish/German WOFF2 subsets from retained original sources. The Lato-derived subsets have their own Baulingo Sans names and published modification/license notice. Normal builds use tracked outputs without Python. See [performance notes](performance.md).

Astro renders the catalog-driven static routes, and the build packages the allowlisted output in `dist/`. Topic content in `src/topics.js` and shared templates in `scripts/pages.mjs` feed `/konular/`, individual topic pages and the café phrase page. Homepage links open the existing dialogs when JavaScript is available and navigate to readable pages otherwise. Search falls back to the topic index without JavaScript. The interactive sentence exercise requires JavaScript. A normal click retains the approved interaction; opening a topic in another tab uses its real URL.

The build includes canonical metadata, social preview metadata on the homepage, robots.txt, sitemap.xml, a custom 404 and security headers. Mutable asset names revalidate. The builder creates content-hashed copies of explicit core assets and appends exact immutable-header rules for those paths only. `_headers` allows inline styles for the existing privacy page; the homepage's meta CSP is stricter. Preview workers.dev hostnames receive noindex. Authentication is separate from indexing; preview URLs are not private.

## Cloudflare validation and publication

`wrangler.json` configures static assets only, auto trailing slashes and `404-page` fallback. It includes no account, custom-domain route or paid service. Wrangler 4.156.0 accepted this command without deployment:

```powershell
npx --yes wrangler@4.156.0 deploy --dry-run --outdir .dev/wrangler-dry-run
```

To validate with Cloudflare's local runtime:

```powershell
npx --yes wrangler@4.156.0 dev --local --port 4174
```

Deployment and maintenance checklist (the owner's initial deployment is already live):

1. Confirm the Cloudflare account remains on the agreed free plans and review the supplied publisher details at `/impressum/` and website hosting disclosure at `/privacy/`. No claim of comprehensive legal compliance is made by the build checks.
2. Obtain explicit publication authorization, authenticate Wrangler and deploy the verified `dist/`. Do not run a normal deploy just to validate configuration.
3. Inspect the workers.dev preview: homepage, topic routes, exercise, recorded audio, downloads, legal pages, custom 404/status and headers. Verify noindex on that preview hostname.
4. The main site's `baulingo.app` Custom Domain and WWW redirect are active and verified. The WWW redirect is a separate Worker because the OAuth login cannot edit zone Redirect Rules. Preserve its narrow route during maintenance; `_redirects` is not a domain redirect configuration.
5. Keep the existing GitHub Pages privacy URL reachable for the Android app. Its link and the sibling app's export script are separate app work. Do not overwrite the independent site with an older app export.
6. Record the deployed Git revision and smoke-test it. Retain the previous Cloudflare deployment for rollback if necessary; do not assume local validation proves public DNS or TLS.

The GitHub workflow installs the locked dependencies, checks Astro and TypeScript, runs the suite and uploads `dist/` as `baulingo-static-site`. Deployment is a separate operation. Product experiments ship inside the existing site. The WWW redirect Worker is hosting infrastructure.

### Astro release and rollback

1. Build from the exact revision intended for release. Record the revision, CI run or local verification, artifact and both payload totals. Keep the verified artifact available beyond CI retention. Preview it with `npm run preview` and, after the build completes, run the Wrangler dry run against the root `wrangler.json`.
2. Once publication is authorized, confirm the Cloudflare account and `baulingo-site` Worker in Wrangler. Record the active deployment and version IDs before running `npx --yes wrangler@4.156.0 deploy --config wrangler.json` from the checkout containing the verified `dist/`. Record the new version and run the live checks below. The apex Worker serves the static release and the WWW redirect keeps its separate deployment.
3. If live smoke checks find a release-blocking regression, restore the recorded previously active version of `baulingo-site` in the Cloudflare dashboard or run `npx --yes wrangler@4.156.0 rollback <PREVIOUS_VERSION_ID> --config wrangler.json` with the owner's rollback authorization. If that version is unavailable, deploy the retained prior artifact with its matching main Worker configuration. Recheck apex and WWW routing, legal pages, crawler headers, representative learning routes and lazy audio. Record the rollback and its reason. [Cloudflare rollback operations](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

### Search discoverability release checks

| Crawler purpose | Phase 7 artifact policy |
| --- | --- |
| Conventional and AI search | Public content is crawlable through the wildcard rule, including `OAI-SearchBot`. Indexable routes are in the sitemap. The 404 and workers.dev preview responses have noindex directives. Confirm how Cloudflare applies these rules before sign-off. |
| Model training | Preserve the existing wildcard behavior, which permits `GPTBot` at the artifact level. The owner's separate training policy and any Cloudflare override remain to be confirmed before applying a training-specific rule. |
| User-initiated retrieval and other crawlers | The wildcard permits public paths. Confirm the effective edge rules independently of the artifact policy. |

1. Inspect representative built pages across languages and learning formats with JavaScript disabled. Confirm readable educational content, ordinary related links, correct canonicals and reciprocal language equivalents, expected indexing and sitemap membership, and applicable structured data that matches visible content. Keep noindex on review and nonpublic previews. Record both payload budgets and the relevant page-transfer checks.
2. Compare the intended search, training and other crawler policies with the built `robots.txt` and the effective Cloudflare policy. Review managed robots settings, AI Crawl Control, WAF and bot rules for conflicts. Check the apex `robots.txt`, response status and indexing headers after an authorized deployment. Where verified crawler logs are available, confirm intended crawlers can reach representative public pages. A user-agent-only probe can test routing but cannot establish the result for a verified crawler. Record missing edge evidence separately. [Cloudflare crawler rules](https://developers.cloudflare.com/ai-crawl-control/configuration/ai-crawl-control-with-waf/) · [OpenAI crawler roles](https://developers.openai.com/api/docs/bots)
3. Recheck the approved campaign fields and identifiable AI referral segment through entry redirects, consent and subsequent engagement. Verify synthetic cases separately from post-deployment GA4 ingestion. Record limitations in the release notes and keep the existing sign-off and deployment authorization. [Attribution requirements](analytics.md#unified-consented-analytics-and-attribution)

#### Production search audit — 26 November 2026

All 297 live sitemap URLs returned HTTP 200 with matching self-canonicals and no `noindex` directives. All 517 hreflang links resolved to pages of the declared language with reciprocal links. The 48 pages with `WebPage` and `LearningResource` microdata had names. All 42 explicit language values matched the document language. The six course pages supplied descriptions. Checks also passed for linked destinations outside the sitemap, HTTPS and WWW redirects, index aliases, the Android app's legacy privacy URL and the noindex 404 response.

Search Console confirmed the apex sitemap submission on the domain property, with zero reported warnings and errors. Its last download was 20 November and its 41 submitted URLs reflect the previous sitemap. The Turkish and English homepages were indexed with matching user and Google canonicals. The Turkish DTZ mock exam was crawled and currently unindexed. The sampled Turkish A1 lesson was unknown to Google.

The live `robots.txt` permits all user agents and advertises the apex sitemap. Requests bearing Googlebot and OAI-SearchBot user agents received HTTP 200 without a Cloudflare challenge on the sampled public pages, sitemap and robots file. URL Inspection separately confirmed successful Google crawls of the two homepages and the DTZ exam. [Cloudflare crawler rules](https://developers.cloudflare.com/ai-crawl-control/configuration/ai-crawl-control-with-waf/) · [OpenAI crawler roles](https://developers.openai.com/api/docs/bots)

The owner's Cloudflare AI Crawl Control Security screenshot showed **Block Crawler** off for OAI-SearchBot and five allowed requests, zero unsuccessful, over the last seven days. The Free plan classifies AI crawler requests by user agent, so these counts can include audit probes and cannot verify OpenAI source IPs. The read-only CLI credential could not inspect separate WAF rules. [Cloudflare crawler detection](https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/#review-ai-crawler-activity)

## Evidence

- 18 automated checks: exercise/search behavior, canonical public paths, static routes/content, local references, deployment metadata, output boundary/size, response headers, errors, redirects, methods, downloads and the dedicated WWW redirect's path/query/hostname behavior.
- Chrome interaction checks: recorded audio, sentence feedback/hints/continuation, keyboard controls, search, downloads, dialog focus return and clean console.
- Eleven responsive widths from 320 to 1440 px; no horizontal or phrase-panel overflow.
- JavaScript-disabled navigation: topics, resources and search fallback. Direct practice links open the exercise when JavaScript is enabled.
- Fresh desktop/mobile screenshots stored locally under ignored `.dev/production-*.png`; photo compression preserves the approved composition and fonts preserve layout.
- Independent code review found no significant issues. The app telemetry paragraphs are unchanged; privacy changes concern the supplied contact address and website hosting.
- Cloudflare's local runtime parsed all four header rules and the redirect rule. HTTP checks passed for pages, actual 404 status, headers, downloads, canonical redirects and excluded files. Its slash redirects return 307; the local preview regression check matches that behavior. Subsequent live checks verified HTTPS, the main site's responses and the dedicated WWW redirect. Recheck public behavior after future deployments; the full DNS configuration remains unaudited.

## Primary references

- [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Static routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Cloudflare privacy](https://www.cloudflare.com/privacypolicy/)

## Local review workspace

Development mode now provides `/dev/review/` for recent change summaries, real website walkthroughs, isolated DTZ sample states and locally saved feedback. It is absent from the static build and disabled in production-style preview. Refresh rebuilds generated pages and sample answers in a fresh Node worker. The current suite has 30 passing tests. Browser checks verify all DTZ shortcuts, normal-attempt isolation, privacy/impressum return links, note persistence, draft retention after failures and pending-save edits, plus desktop/mobile layout. A fresh reviewer found and rechecked the corrected source/preview, legal-navigation and draft-race issues. No deployment was performed for this developer tool. See [the local review guide](development/review.md).

## Performance preparation — 31 October 2026

The owner authorized the PageSpeed fixes. Responsive hero images, smaller font subsets and content-versioned core asset caching are implemented locally and registered in the review workspace. The supplied live baseline remains mobile 97 / desktop 99; no new live score or deployment is claimed. See [measurements and verification](performance.md).
