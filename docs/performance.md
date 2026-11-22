# Homepage performance — 31 October 2026

## Cloudflare report investigation — 4 November 2026

The owner supplied `.dev/performance/cloudflare-performance-report.pdf`, covering 2–3 November. Its `/en/` chart shows two LCP samples, one good and one poor; P75 is 6,712 ms. The affected element is the already fingerprinted 1200px café hero. Reported subparts are TTFB 1,491 ms, discovery delay 463 ms, transfer 0 ms and render delay 4,759 ms. CLS is good for the displayed samples; INP has no data. Two observations cannot establish a sitewide user distribution.

Fresh isolated foreground Chrome checks on the live English homepage observed cold desktop LCP 224–748 ms, ordinary emulated-phone LCP 304–332 ms, and warm repeats 144–180 ms. Matching the exact 1200px image produced 272–404 ms. A separate controlled 4xCPU / 1.6Mbps phone run produced 2,280 ms. These local-browser observations are not a new PageSpeed score or a replacement for field data. The 6.7s delay was not reproduced.

Live HTML/CSS responses report Cloudflare HIT and revalidation; the hero is high-priority/eager with responsive candidates, WebP and immutable hashed caching. Warm browser resource timing confirms reuse. Optimized fonts are also live. Therefore the historical “locally prepared, not deployed” note below no longer describes these particular live assets; the full release/version was not audited here. No production code or Cloudflare settings were changed for this investigation.

The next useful evidence is the slow element's Browser/OS/Country breakdown and a longer sample window, followed by a performance trace on an affected device if it recurs. Investigate render delay/TTFB before changing image compression. Full evidence and captures are kept locally in `.dev/performance/diagnosis-2026-11-04.md`. Metric interpretation follows [Cloudflare's subpart documentation](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/) and [Google's LCP guidance](https://web.dev/articles/optimize-lcp/).

## Historical preparation

Update, 2 November: adding static writing lessons required avoiding duplicate large assets to preserve the 2 MB core budget. WebP/WOFF2 files now publish their fingerprinted copy once; exact `200` rewrites retain original URLs with revalidation. The local preview mirrors these allowlisted aliases. Source files and the homepage's visual assets are unchanged. See [writing-course build notes](content/dtz-writing.md).

Status: implemented locally, not deployed. No new live PageSpeed score has been measured.

## Baseline

The owner's [mobile report](https://pagespeed.web.dev/analysis/https-baulingo-app/hzou6x13gb?form_factor=mobile) shows performance 97, FCP 0.8 s, LCP 2.6 s, blocking time 0 ms and layout shift 0. The [desktop report](https://pagespeed.web.dev/analysis/https-baulingo-app/hzou6x13gb?form_factor=desktop) shows 99, FCP 0.2 s, LCP 0.9 s, blocking time 10 ms and layout shift 0. Both report accessibility, best practices and SEO at 100. There is no real-user field data; these are laboratory runs.

The café image is the LCP element. The report estimates responsive-image savings of about 198 KiB mobile / 165 KiB desktop. Smaller stylesheet and Cloudflare-beacon warnings are lower priority. Estimates are not the measured byte reductions below.

## Changes

- The café artwork ships at 480, 800 and 1594 px (38,004, 76,086 and 106,502 bytes), selected using sizes/srcset. The 1594 px WebP is smaller than the former 1200 px encoding. Publishing one large copy keeps the bilingual mini-packs within the core budget. The old 1200 px URL serves the 1594 px copy through an exact rewrite. The LCP image remains eager/high-priority.
- Local WOFF2 fonts are subset for Latin/Latin Extended A, combining marks, Turkish/German, punctuation, arrows and selected symbols. The two main body faces shrink from 425 KB to about 92 KB. Original retained glyph coverage is verified, and sample Latin/Turkish/German outlines/advance widths match the original TTFs. The Lato-derived subsets are named **Baulingo Sans** internally and in CSS to respect Lato's reserved name. Original attribution/license and the modification notice are published together in `assets/BaulingoSans-OFL.txt`. Newsreader retains its existing name/license. Original TTFs and unmodified full Lato WOFF2 files stay outside the public allowlist.
- `scripts/assets.mjs` writes content-hashed copies of explicit core image/font/icon/phrase assets under `assets/cache/` and rewrites built HTML/CSS references. Mutable originals stay available where allowlisted; only generated fingerprints get immutable caching. The three DTZ media files are not duplicated and audio remains lazy loaded.

Run `python scripts/optimize-assets.py` only when regenerating assets. Its pinned optional Pillow/fontTools dependencies can live in ignored `.dev/pydeps`. Original PNG/TTF sources remain unchanged. Font timestamps are preserved for reproducible output. Normal Node builds need no Python or installed dependencies.

## Caching and publication

The level pages and A1 practice test fit the core budget by omitting optional HTML quotes and end tags from generated DTZ study and writing pages. The browser receives the same content and DOM.

The 134 lesson previews fit by publishing each fingerprinted core asset once and sharing the writing course's task IDs across pages. Exact asset rewrites retain the old paths. Static writing navigation continues to list every lesson, with progress indicators added by the writing player.

The grammar import keeps the 2 MB cap by generating font subsets for site content and the supported keyboard alphabets, sharing the Turkish writing lesson navigation, and loading the full DTZ study lists from a gzip archive. With JavaScript disabled, the study page renders the basic lists, and the writing index and lesson pagination remain readable. The full study archive retains all lists and filters.

The builder appends exact immutable header rules for generated paths. It does not add a broad immutable wildcard or conflicting global Cache-Control directive. Cloudflare's normal `public, max-age=0, must-revalidate` default remains on mutable pages/assets; known fingerprints receive `public, max-age=31536000, immutable`. Missing hashes do not receive a year-long error TTL. The local preview mirrors this policy.

The resolver accepts fingerprints only for explicit allowed source names, not arbitrary files in the cache directory. Original compatibility copies and responsive variants count toward the existing 2,000,000-byte core budget; the complete prepared core remains below it. The DTZ media budget is unchanged at 8,913,392 / 10,000,000 bytes. Deployment size includes compatibility copies; browser requests use the rewritten optimized URLs.

References: [Cloudflare default/custom headers and merging rules](https://developers.cloudflare.com/workers/static-assets/headers/), [responsive images](https://web.dev/articles/serve-responsive-images), [font guidance](https://web.dev/articles/font-best-practices), [OFL webfont naming guidance](https://openfontlicense.org/webfonts-and-reserved-font-names/).

## Verification and release

Automated checks cover responsive candidates, font size bounds, content hashes, cache-path boundaries, exact/non-conflicting headers, missing hashes, both payload budgets and the review worker's fresh-generator fixture. Browser checks cover 390 px 1×/2× and 1440 px image selection, font loading, cached repeat visits, overflow, existing dialogs and lazy DTZ audio. Screenshots/resource traces stay in ignored `.dev/performance-*` files.

Review **Faster homepage, same design** at `/dev/review/`. No app changes, paid services, commit, push or deployment were made. After authorized publication, recheck live asset/cache behavior and rerun both PageSpeed modes. Baseline scores must not be replaced by predicted results.
