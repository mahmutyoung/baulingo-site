# Production readiness — 2026-10-30

Source of truth: `docs/design/homepage.md` and `docs/design/homepage-reference.png`.

Preserve the approved layout, Turkish copy, typography and existing learning interactions. Keep the site static and dependency-free at runtime. Use Cloudflare Free; no publication, domain changes, app telemetry changes or invented publisher address.

1. Add build/output regression tests for real topic routes, crawlable homepage links, canonical metadata, sitemap, 404, deployment headers and a bounded public asset payload. Observe failures before implementation.
2. Encode existing photos as WebP and fonts as WOFF2 without changing their dimensions, glyphs or layout. Keep original source assets and licenses; publish only the required files.
3. Generate static topic and resources pages from existing content, progressively enhance homepage links into the existing dialogs, add SEO and a real 404. Use explicit public file lists and reject symlinks in the build.
4. Add Cloudflare static deployment configuration, security headers and a production-output preview; verify routes, methods, headers, downloads and traversal handling. Add CI tests/build without automatic deployment.
5. Run browser interaction and responsive checks, compare the homepage to the baseline, request a fresh code review, fix significant findings and record results. Commit coherently to local Git.

The owner supplied the public postal address during implementation. The Impressum and website hosting privacy wording are prepared. Launch still requires review of those public details, explicit deployment authorization and live Cloudflare/domain checks.

## Execution record

- Build/output tests were added before implementation and failed against the original build. Preview behavior tests likewise failed before the new server existed; all 15 checks now pass.
- Existing photographs encoded as WebP and full fonts as WOFF2. Explicit public manifest reduced total output from about 6.6 MB to 1.2 MB. Original source files retained.
- Static topic/resource pages, ordinary links with dialog enhancement, metadata, 404, headers, deployment configuration and CI implemented.
- Approved homepage visually checked in Chrome, primary controls checked, eleven responsive widths passed, JavaScript-disabled navigation checked.
- Wrangler 4.156.0 deployment dry run passed without publication. Independent code review found no significant issues.
- Cloudflare local-runtime checks passed for routes, errors, headers, downloads and exclusions. Preview slash status aligned to the observed 307 with a failing-then-passing regression check.
- No app changes, domain changes or public deployment. Detailed commands and launch checks: `docs/production.md`.
