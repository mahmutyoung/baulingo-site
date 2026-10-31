# Production preparation

Prepared and verified on 30 October 2026. The approved homepage layout and Turkish copy remain authoritative. The owner subsequently deployed the main site and connected `baulingo.app`; live checks confirm its homepage matches the verified static build.

The [long-term roadmap](roadmap.md) owns product priorities. The next product milestone is one embedded demand/preference experiment with a defined evidence method. This document records delivery operations and verification; no measurement pipeline has been added by the roadmap update.

## Live deployment

`https://baulingo.app` serves the main static site. Its homepage, topic/legal pages and downloads return 200; missing pages return 404. Public responses include security headers and do not include the preview noindex header.

The owner authorized and authenticated the WWW redirect setup. Wrangler's OAuth permission grants Worker routing, but the zone Redirect Rules API returns 403. A dedicated [WWW redirect Worker](../cloudflare/www-redirect/README.md) now serves only `www.baulingo.app/*`, returning 301 directly to HTTPS apex with the path/query preserved. Version: `12357254-9074-4dcb-acb0-c3b5218ca07c`. Live HTTP/HTTPS, nested-path, encoded-path and query checks pass. The apex stays on `baulingo-site`; no DNS edits or paid-plan changes were made for this redirect.

The local Wrangler login is stored by Wrangler outside the repository. No credentials are committed. The WWW Worker has a separate explicit deployment command; the main site's Git-linked build does not deploy it.

## Build and verify

### DTZ simulation — local implementation, not deployed

The owner requested the app's original full DTZ simulation on the website and approved a separate 10 MB lazy-media allowance, retaining the 2 MB core limit. `/dtz-deneme-sinavi/`, its homepage/topic/resource entries, local-only attempt storage and the corresponding website privacy disclosure are implemented locally. These DTZ changes have not been published; the analytics version recorded above remains the live release. The independent app and legacy GitHub Pages policy are unchanged. See [content/provenance and verification notes](content/dtz-web.md). The port is a technical adaptation, not an assertion of official certification or completed human editorial/audio review.

25 tests pass locally, including DTZ content/state/scoring/deadline boundaries, static output and audio ranges. Chrome checks pass for the complete four-section flow and 45/45 result, with real media loading/decoding and seek-to-end completion; reload/deadlines, local draft persistence, keyboard, audio failure/retry, storage denial, corrupt-state deletion, no-JavaScript fallback and 320/390/768/1440 px layouts. There were no answer/draft POSTs in the full local flow. A fresh read-only reviewer found no important bugs and independently ran the five pure DTZ tests. These are local checks, not live DTZ verification.

### Analytics deployment

On 30 October 2026 the owner authorized publication of Cloudflare analytics support and the website privacy disclosure. The zone API confirms the Free Website plan. Final main-site version: `f08cba0f-c32c-4a16-aaa8-df1a22d063f0`, deployed from working-tree changes based on `57d04316378916291ac92765ca78b4ec74411440` (no commit or push requested). Initial version `22138c30-76a8-4dbf-9f1b-21f8dcbe8bc1` allowed only the unversioned beacon; a live browser revealed Cloudflare's versioned script path, so both CSP policies were corrected and redeployed. Live Chrome checks now confirm the automatically injected script loads (HTTP 200) and homepage/topic-index RUM POSTs succeed (HTTP 204) without CSP or network errors. A network trace locates this check in Germany. Non-browser fetches did not receive an injected beacon, so raw HTML checks alone are insufficient. The refreshed Wrangler login can access the zone and Worker, but Web Analytics inspection returns HTTP 403 because the login lacks account-settings permissions. A subsequently supplied read-only token in the ignored local `.env` permits RUM configuration and GraphQL reporting checks. Automatic collection and the ruleset are enabled, with one active inclusive host `*` / paths `["*"]` rule. The reporting API confirms four page views (two homepage, two topic index) on 30 October 2026, consistent with verification traffic. No account settings were changed; narrower hostname/path exclusions remain proposed and regional options were not established. The dashboard UI was not inspected. No manual beacon was added. [Analytics configuration](analytics.md) records the remaining account checks and useful review views.

Use Node 24; normal builds need no installed packages.

```powershell
npm test
npm run build
npm run preview
```

Preview http://127.0.0.1:4173. `npm run dev` also builds before serving; it does not watch for edits. The preview serves `dist/`, not repository files. It mirrors common security headers, downloads, slash redirects and real 404 responses. Cloudflare controls its own edge cache, TLS and hostname rules.

`scripts/public-files.mjs` is the publication boundary. Source photos and TTF files stay in Git but are excluded from deployment; the build publishes WebP/WOFF2 and their licenses. Adding a file under `assets/` does not automatically publish it. Source symlinks are rejected. The automated core-output budget remains 2 MB. The owner approved a separate 10 MB limit for the exact three-file DTZ media allowlist; its original audio/images total 8,913,392 bytes. Exam audio is requested only when listening starts, not when the homepage or landing page opens. The static site needs no database, learning-state cookies or remote fonts. DTZ attempts/drafts use localStorage only; Cloudflare automatically injects its Web Analytics script for aggregate traffic and performance measurement.

Optional asset encoding uses `scripts/optimize-assets.py` with its pinned Python dependencies. It generates responsive WebP copies and Latin/Turkish/German WOFF2 subsets from retained original sources. The Lato-derived subsets have their own Baulingo Sans names and published modification/license notice. Normal builds use tracked outputs without Python. See [performance notes](performance.md).

Learning content remains in `src/topics.js`; build-time templates in `scripts/pages.mjs` generate `/konular/`, individual topic pages, the café phrase page and `/kaynaklar/`. Homepage links open the existing dialogs when JavaScript is available and navigate to readable pages otherwise. Search falls back to the topic index without JavaScript. The interactive sentence exercise requires JavaScript. A normal click retains the approved interaction; opening a topic in another tab uses its real URL.

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

The GitHub workflow runs tests, builds and saves an artifact; it does not deploy automatically. Product experiments are embedded in the main website and ship with its normal deployment to understand visitor demand and preferences. They do not need a separate experiment page, project or subdomain. The WWW redirect Worker is hosting infrastructure.

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
