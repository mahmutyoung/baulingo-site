# Homepage performance improvements

The owner authorized performance fixes after reviewing mobile 97 / desktop 99 in the supplied PageSpeed report. Preserve the approved artwork, typography and layout; use the existing free static hosting.

1. Generate 480/800/1200 px WebP variants of the same hero. Add sizes/srcset, retain eager high-priority LCP loading and the original fallback, and correct intrinsic dimensions.
2. Subset the five WOFF2 fonts from original TTF sources. Preserve extended Latin, Turkish/German, combining marks, used punctuation/symbols, shaping features and licenses. Normal builds use tracked results and need no Python.
3. Create content-hashed copies of explicit core assets and rewrite built HTML/CSS references. Only fingerprinted URLs get immutable caching. Mutable URLs retain revalidation; DTZ media is not duplicated.
4. Test responsive candidates, font sizes/glyphs, hash integrity, publication boundaries and cache headers. Retain 2 MB core / 10 MB DTZ limits. Update the review build fixture for new builder modules.
5. Register a review entry, inspect responsive browser output/resource selection, run tests/build and request fresh review. Record measured byte savings; do not invent Lighthouse scores or deploy without authorization.

Completed locally: responsive source selection, subset outlines/metrics/glyph coverage, renamed OFL-derived Baulingo Sans metadata, exact immutable headers and cache boundaries verified. All33 tests pass. Fresh code review found and rechecked the reserved-name fix; no important issues remain. Source metadata timestamps are preserved. No deployment or new PageSpeed result is claimed.
