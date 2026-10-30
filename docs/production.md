# Production preparation

Verified locally on 30 October 2026. The approved homepage layout and Turkish copy remain authoritative. This work has not published the site or changed DNS.

## Build and verify

Use Node 24; normal builds need no installed packages.

```powershell
npm test
npm run build
npm run preview
```

Preview http://127.0.0.1:4173. `npm run dev` also builds before serving; it does not watch for edits. The preview serves `dist/`, not repository files. It mirrors common security headers, downloads, slash redirects and real 404 responses. Cloudflare controls its own edge cache, TLS and hostname rules.

`scripts/public-files.mjs` is the publication boundary. Source photos and TTF files stay in Git but are excluded from deployment; the build publishes WebP/WOFF2 and their licenses. Adding a file under `assets/` does not automatically publish it. Source symlinks are rejected. The automated public-output budget is 2 MB; the current output is approximately 1.2 MB, down from 6.6 MB. Runtime needs no database, cookies, analytics, remote fonts or third-party scripts.

Optional asset re-encoding uses `scripts/optimize-assets.py` with the pinned Python dependencies documented in its header. Normal builds use the tracked encoded files. Image dimensions and font glyph coverage are preserved.

Learning content remains in `src/topics.js`; build-time templates in `scripts/pages.mjs` generate `/konular/`, individual topic pages, the café phrase page and `/kaynaklar/`. Homepage links open the existing dialogs when JavaScript is available and navigate to readable pages otherwise. Search falls back to the topic index without JavaScript. The interactive sentence exercise requires JavaScript. A normal click retains the approved interaction; opening a topic in another tab uses its real URL.

The build includes canonical metadata, social preview metadata on the homepage, robots.txt, sitemap.xml, a custom 404 and security headers. Mutable asset names revalidate instead of receiving an unsafe immutable cache policy. `_headers` allows inline styles for the existing privacy page; the homepage's meta CSP is stricter. Preview workers.dev hostnames receive noindex. Authentication is separate from indexing; preview URLs are not private.

## Cloudflare validation and publication

`wrangler.json` configures static assets only, auto trailing slashes and `404-page` fallback. It includes no account, custom-domain route or paid service. Wrangler 4.156.0 accepted this command without deployment:

```powershell
npx --yes wrangler@4.156.0 deploy --dry-run --outdir .dev/wrangler-dry-run
```

To validate with Cloudflare's local runtime:

```powershell
npx --yes wrangler@4.156.0 dev --local --port 4174
```

Before public launch:

1. Confirm the Cloudflare account remains on the agreed free plans and review the supplied publisher details at `/impressum/` and website hosting disclosure at `/privacy/`. No claim of comprehensive legal compliance is made by the build checks.
2. Obtain explicit publication authorization, authenticate Wrangler and deploy the verified `dist/`. Do not run a normal deploy just to validate configuration.
3. Inspect the workers.dev preview: homepage, topic routes, exercise, recorded audio, downloads, legal pages, custom 404/status and headers. Verify noindex on that preview hostname.
4. Connect `baulingo.app` as a Custom Domain after the preview passes. Configure the `www` → apex redirect in Cloudflare dashboard rules, preserving path and query; `_redirects` is not a domain redirect configuration. Confirm HTTPS and canonical URLs on the real domain.
5. Keep the existing GitHub Pages privacy URL reachable for the Android app. Its link and the sibling app's export script are separate app work. Do not overwrite the independent site with an older app export.
6. Record the deployed Git revision and smoke-test it. Retain the previous Cloudflare deployment for rollback if necessary; do not assume local validation proves public DNS or TLS.

The GitHub workflow runs tests, builds and saves an artifact; it does not deploy automatically. No experiment subdomain was selected.

## Evidence

- 15 automated checks: exercise/search behavior, canonical public paths, static routes/content, local references, deployment metadata, output boundary/size, response headers, errors, redirects, methods and downloads.
- Chrome interaction checks: recorded audio, sentence feedback/hints/continuation, keyboard controls, search, downloads, dialog focus return and clean console.
- Eleven responsive widths from 320 to 1440 px; no horizontal or phrase-panel overflow.
- JavaScript-disabled navigation: topics, resources and search fallback. Direct practice links open the exercise when JavaScript is enabled.
- Fresh desktop/mobile screenshots stored locally under ignored `.dev/production-*.png`; photo compression preserves the approved composition and fonts preserve layout.
- Independent code review found no significant issues. The app telemetry paragraphs are unchanged; privacy changes concern the supplied contact address and website hosting.
- Cloudflare's local runtime parsed all four header rules and the redirect rule. HTTP checks passed for pages, actual 404 status, headers, downloads, canonical redirects and excluded files. Its slash redirects return 307; the local preview regression check matches that behavior. Public hostname rules, DNS and TLS still require launch verification.

## Primary references

- [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Static routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Cloudflare privacy](https://www.cloudflare.com/privacypolicy/)
