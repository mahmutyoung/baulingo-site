# Baulingo architecture migration

## Phase 6 unified analytics

Both builds use the same consent-gated transport and event-specific validation. The catalog supplies stable page, content and collection IDs. Direct exposure, explicit mini-pack selection, starts, resumes and completion are distinct. The original activity dimensions and browser-local learning records remain compatible.

Local Chrome exercised the transport on a synthetic HTTPS origin with the Google tag stubbed. Automated and browser checks covered duplicate and unknown tags, missing and synthetic referrers, locale and legacy mini-pack entry redirects, Back/Forward, visibility and idle time, A1 scoring, DTZ pause and resume, writing draft redaction and withdrawal. The local preview also kept the transport disabled after opt-in. [Measurement definitions and release boundary](analytics.md#unified-consented-analytics-and-attribution)

`npm test` passed all 103 tests, `npm run build` and `npm run test:astro` passed, and `npm run check:astro` reported zero diagnostics. Both builds publish 374 files. Core output is 1,997,777 bytes in the candidate and 1,999,039 in the legacy build. DTZ media uses 8,913,392 bytes in each build.

The next phase is release readiness. GA4 ingestion and account configuration remain release checks.

## Phase 5 remaining formats

The Astro candidate renders all 297 indexed URLs and generates the sitemap from the validated catalog. Six English and Turkish A1–B1 overviews use level collections with 17, 22 and 28 lessons in their existing order. Their paired pages have reciprocal language links. The A1 test keeps its 12 questions, scoring and review links. The catalog also covers topics, the café phrase, exam guides, both mock tests, the study lists, both writing courses and the app information page. The static legal documents and 404 continue through the legacy allowlist.

The German mock test includes an original reading example and answer in its initial HTML. The German writing course provides an authored excerpt and a working anchor for each of its 15 chapters before the interactive book loads. Full exercises continue to load through the existing archives. Both builds publish only the scoring and draft-export fields in the DTZ player module. Exam texts, options, answers and media references remain in the appropriate rendered exercise content. The German listening button and the Turkish and German audio-size notices use their respective translations.

Course and resource pages use [LearningResource microdata](https://schema.org/LearningResource) on their web pages. Tests check the marked-up names and descriptions against rendered copy, the declared language against catalog records, and the canonical and sitemap location of every indexed page. The self-paced courses use general learning-resource markup. Google's course-list feature has separate instructor and roster requirements. [Google course-list guidance](https://developers.google.com/search/docs/appearance/structured-data/course)

| Local check | Result |
| --- | --- |
| Types and candidate | `npm run check:astro` reported zero diagnostics. `npm run test:astro` passed. The candidate preserves 372 files and 297 indexed URLs. |
| Output budgets | Candidate core 1,992,534 bytes and legacy core 1,986,656 bytes, both below 2,000,000. DTZ media remains 8,913,392 bytes in each build, below the separate 10,000,000 cap. `npm test` passed all 100 tests and `npm run build` passed. |
| Chrome at 1440 and 390 px | Verified course sample disclosure, A1 validation and score focus, review links and reset, study-list filters, lazy exam audio, Turkish-to-German attempt resume, and recovery of Turkish and German writing drafts. A saved DTZ fixture produced the same 44/45 score, wrong-answer review and TXT export on both mock routes. |
| JavaScript disabled | Read the six course samples, A1 explanations, study-list examples, Turkish writing examples and translations, and the German mock example and writing excerpts. All 15 German writing chapter links have static targets. |
| Course transfers | The six overviews at 1440 and 390 px each transferred about 6.3–6.9 kB less than the legacy build using cold local Chrome loads. |
| Other transfers | Against the Phase 4 candidate at both widths, Turkish DTZ mock transfer fell from 329,383 to 303,717 bytes. German writing grew from 228,918 to 238,527 bytes with the static excerpts. The A1 test, study lists and Turkish writing index each added at most 210 bytes. |

Phase 6 covers the typed consented analytics contract and attribution in the [measurement guide](analytics.md#unified-consented-analytics-and-attribution). The release workflow still uses `npm run build` and `dist/`. Phase 5 verification used local builds.

## Phase 4 mini-pack pilot

**Status at the end of Phase 4:** Local candidate acceptance passed. The legacy workflow emitted `dist/`, and the pilot ran in `.dev/astro-dist/`.

- The catalog now owns both everyday reader entries and both grammar indexes as well as all 240 localized lesson pages. One [Astro reader template](../src/pages/[...reader].astro) serves the two everyday entry pages. Both grammar indexes take their lesson order and links from the validated collection. The two tracks use the [same existing player](../src/mini-packs/player.js), exercise logic and four unchanged archives.
- The catalog emits reciprocal and self `hreflang` links for every localized lesson. The static preview passes the grammar classification to the player, so the candidate chooses the archive independently of the URL prefix. The player keeps the title, canonical and alternate links synchronized after direct entry, legacy query entry and in-page navigation.
- The four archive filenames, all lesson IDs and existing URLs, static introductory content and examples, and in-memory progress semantics are preserved. Deep links continue to fetch the shared reader shell and the selected track/language archive. The legacy reader shell files remain the dependency-free build's inputs until that workflow retires.
- The candidate replaces the legacy string compaction for published JS and CSS with the pinned Oxc minifier through Vite and Lightning CSS. Files keep their public paths and JS module boundaries. Compared with the legacy build from the same checkout, compiled JS is 51,908 bytes smaller and compiled CSS is 2,076 bytes smaller. This provides space for reciprocal metadata and explicit track attribution without changing assets or budgets.

| Check | Phase 4 result |
| --- | --- |
| Strict types and candidate | `npm run check:astro` passed with zero diagnostics. `npm run test:astro` passed. There are 372 published files and 297 sitemap locations. The automation checks both index language pairs, all 240 lesson canonical and alternate sets, the preserved preview markup and the 53 grammar links in each index. |
| Browser parity | Chrome at 1440 and 390 px covered both tracks in both languages, a direct lesson URL, legacy topic and level entry, incorrect and correct answers, B1 scenario review, language switching, retained section/exercise progress, and canonical and hreflang updates on Back/Forward. Four lesson previews remained readable with JavaScript disabled. Shared-asset smoke checks also covered homepage interactions, DTZ audio and resume, and German writing draft recovery. |
| Visitor transfer | Six sampled mini-pack URLs at each width transferred approximately 16.6–18.8 kB less than the archived legacy baseline, including the new metadata. The pilot added no requests to those loads. The local setup uses the same cold-cache Chrome methodology recorded in Phase 1. |
| Output budgets | Candidate core is 1,999,318 bytes, with 682 bytes of headroom. DTZ media is 8,913,392 bytes, within its separate cap. The legacy build succeeds and its suite remains at 99 of 100. Its existing core budget failure now measures 2,002,675 bytes, 611 bytes above the Phase 3 legacy build because the shared player now also supports catalog-backed pages. |

The pilot reuses the existing learning engine and archives, and one template replaces the two candidate reader shells. Catalog-driven publishing adds static equivalents without increasing the sampled page transfers. The narrow total-output margin remains a constraint on expanding static educational content. Measure each remaining slice before expanding it. CI on GitHub, Cloudflare edge behavior and production analytics were outside local verification.

## Discoverability gates

AI search uses the existing publishing and analytics migration. These checks apply to upcoming slices and the final release review. Phase 4 evidence above predates this addition. [Publishing requirements](architecture.md#ai-search-discoverability)

| Phase | Acceptance evidence |
| --- | --- |
| 5. Remaining formats | Inspect rendered HTML with JavaScript disabled. Check logical headings, usable definitions, original examples and translations, and links to related material. Verify content identity, canonicals, locales and indexing. Generate and validate applicable structured data from the same records and compare it with visible content. Recheck both output budgets and representative page transfers. |
| 6. Unified analytics | Verify consented AI-referral classification, allowlisted campaign attribution and engagement by landing page and content ID. Test missing referrers, unknown and duplicate tags, locale redirects, in-page navigation and consent withdrawal. Keep URL queries and fragments out of analytics URLs. Document reporting limits and the release boundary. [Measurement contract](analytics.md#unified-consented-analytics-and-attribution) |
| 7. Release readiness | Check rendered HTML, ordinary links, structured data, sitemap, canonicals and indexing across representative routes and locales. Verify crawler policy in the candidate and record separate search and training decisions. Record any edge or analytics checks that require an authorized deployment. [Release verification](production.md#search-discoverability-release-checks) |

## Phase 3 content and publishing model

**Status at the end of Phase 3:** Local acceptance passed. The typed catalog owned candidate publishing metadata for two homepages and 240 mini-pack previews.

- [The publishing model](../src/publishing/model.ts) validates content, collections and page records. It catches duplicate IDs and paths, invalid routes, missing content, collection or canonical references, and incompatible translation and indexing policies. Paths belong to pages. Tests exercise English and Turkish equivalents at different path depths and reusable content in more than one collection.
- [The catalog](../src/publishing/catalog.ts) projects 120 stable lesson identities from the four existing libraries. The 67 everyday and 53 grammar items retain their own categories and collection order. Editorial metadata and examples come from the existing sources. Full exercise data remains in the existing libraries.
- [The static route](../src/pages/[...page]/index.html.ts) generates the English homepage and lesson previews from page records. The Turkish Astro homepage uses the same catalog. Both homepages generate reciprocal language links. The catalog resolves equivalent mini-pack pages by identity and the preview resolves its related lesson link from the matching localized page record.
- The candidate sitemap takes modeled locations from page records and inherits the other 55 indexed locations from the legacy sitemap. The URL set is unchanged. The shim exists until the remaining page families migrate. The preview route reuses the existing lesson renderer and JavaScript engine. Phase 4 owns the learner-facing mini-pack migration and publishing lesson-level hreflang in a way that remains correct through reader navigation.

| Check | Phase 3 result |
| --- | --- |
| Strict types and candidate | `npm run check:astro` passed with zero errors, warnings or hints. `npm run test:astro` passed the validation cases and build parity. The candidate preserves 372 public files, 297 unique sitemap URLs and all 240 legacy preview HTML files byte-for-byte. |
| Budgets | Candidate core remains 1,999,648 bytes, 352 bytes below the limit. DTZ media remains 8,913,392 bytes of 10,000,000. |
| Local browser | At 1440 and 390 px, checked homepage journeys, direct lesson entry, both track archives, section review, canonical attribution and language switching across everyday and grammar lessons. Checked readable German examples and canonicals on four lesson URLs with JavaScript disabled. The default `/favicon.ico` request returns 404 on both builds. |
| Legacy workflow | `npm run build` passed. All 372 files match the clean baseline after normalizing checkout line endings, and byte counts match the Phase 1 inventory. `npm test` remained at 99 of 100 with the established legacy core-size failure at 2,002,064 bytes. |

## Phase 2 Astro foundation

**Status at the end of Phase 2:** Local acceptance passed. The legacy production workflow still used `npm run build` and published `dist/`. The candidate was isolated in `.dev/astro-dist/`.

- Astro 7.4.13 renders the Turkish homepage through a shared typed layout. The candidate retains the homepage's copy, metadata, CSP, browser modules, navigation and assets. Strict checks cover Astro and TypeScript source; the existing JavaScript learning modules are reused.
- The candidate starts with the legacy allowlisted output, replaces the Turkish homepage and compiles the shared stylesheet with Lightning CSS 1.33.0 at its existing public path. The stylesheet compiler saves 726 bytes and Astro saves 1,690 homepage bytes. Native CSS parsing replaces the legacy stylesheet's string-based compaction for this candidate. The separate Astro CI job installs the pinned packages from the lockfile and runs the strict check and candidate acceptance test.
- Keep the legacy homepage source while it serves the production build. Retire that copy when the Astro homepage becomes the release renderer. Stop copying legacy routes and styles when their final consumers migrate. The main and WWW Cloudflare configurations remain release operations as documented in [production notes](production.md).

With Node 24 and npm 9.6.5 or later, run:

```powershell
npm ci
npm run check:astro
npm run test:astro
npm run preview:astro
```

`npm run test:astro` builds the candidate before comparing it with `dist/`. To build without running the assertions, use `npm run build:astro`.

| Check | Phase 2 result |
| --- | --- |
| Locked installation | A clean `npm ci` completed with Node 24.19.0 and npm 11.6.2 on Windows. |
| Strict types | `npm run check:astro` returned zero errors, warnings and hints. |
| Candidate build and automated parity | `npm run test:astro` passed. All 372 file paths are present. Only `index.html` and `style.css` differ from the legacy build. Homepage metadata, CSP and URL attributes match. Core is 1,999,648 bytes of 2,000,000 and DTZ media is 8,913,392 bytes of 10,000,000. |
| Legacy build and suite | `npm run build` passed. The legacy build matches the Phase 1 file sizes and retains its 2,064-byte core overage. `npm test` passed 99 of 100 with the same budget assertion as its sole failure. |
| Local Chrome at 1440 and 390 px | Checked the menu, keyboard search, dialog focus return, phrase audio, successful sentence practice, hint, language navigation and responsive hero. Local consent settings persisted and made no Google requests. With JavaScript disabled, navigation, topic search and the static practice link remained available. HTTP smoke checks covered redirects, discovery files, nested routes, real 404s and private paths. |
| Visual and transfer parity | Desktop screenshots were identical. Excluding the transient overlay scrollbar at the edge, mobile had 32 differing pixels with channel deltas of at most 2 around the search control. Cold transfer fell from 276,671 to 274,255 bytes at 1440 px and from 237,708 to 235,292 bytes at 390 px. The request counts and selected image candidates matched at each width. |

The legacy budget failure remains recorded. The Astro candidate has 352 bytes of core headroom. CI execution on GitHub, Cloudflare edge behavior and production analytics were outside local verification.

## Phase 1 baseline

Recorded 25 November 2026 from local `main` at `f844e2a`, with Node 24.19.0 and npm 9.4.1 on Windows. Scope covers the candidate static build and its local preview. The latest release identified in the [production notes](production.md) is `73d2647` from 15 November. The deployed revision, analytics ingestion and Cloudflare account settings were outside this baseline's verification.

**Baseline status:** The legacy core payload check was red at the end of Phase 1.

This document records the baseline, phase gates and migration status. The [target architecture](architecture.md#target-architecture) defines the intended system. The [roadmap](roadmap.md) governs product priorities and experiments. The [analytics guide](analytics.md) documents the existing contract and historical reports.

| Phase | Acceptance gate |
| --- | --- |
| 1. Baseline | Record the route, content, behavior, storage, analytics and performance baseline, including existing failures. |
| 2. Astro foundation | Pin compatible Astro tooling, add strict TypeScript checks and CI commands, and reproduce the approved homepage with a shared layout in a production-compatible static candidate. Verify parity while retaining the legacy production build. |
| 3. Content and publishing | Reuse educational data and validate stable content, collection and page metadata. Derive localized routes, sitemap and language relationships from authoritative page records. Catch duplicate IDs, path collisions and missing references. |
| 4. Mini-pack pilot | Preserve both tracks' IDs, content, SEO, navigation, checking and progress through the shared player. Verify browser parity and assess code complexity and transfer costs before migrating the other products. |
| 5. Remaining formats | Migrate each format in turn and verify its behavior, storage compatibility, static content and publishing parity before starting the next. |
| 6. Unified analytics | Verify typed event contracts, consent, attribution, study time and completion in the browser. Record GA4 definitions and reporting implications. External GA4 settings are outside the phase. |
| 7. Release readiness | Remove superseded implementations, verify the release candidate and document release and rollback steps. Deployment requires separate authorization. |

## Public routes and SEO

All 300 emitted HTML files are accounted for below. Locale counts from HTML are 165 Turkish, 130 English and 5 German. Brace lists expand to the literal alternatives shown. For routes with slugs, the linked source enumerates every leaf. The complete local comparison set comes from the 297 distinct URLs in `dist/sitemap.xml` plus `/privacy/`, `/impressum/` and `/404.html`.

| Page family | Routes | HTML files |
| --- | --- | ---: |
| Home | `/`, `/en/` | 2 |
| Turkish topics and phrase | `/konular/`, `/konular/{articles,cases,word-order,doctor,exams,kafede-siparis}/` | 7 |
| English editorial lessons | `/en/{word-order,articles,appointments}/` | 3 |
| Everyday mini-pack readers | `/konular/mini-paketler/`, `/en/mini-packs/` | 2 |
| Everyday level pages | `/konular/almanca-{a1,a2,b1}/`, `/en/german-{a1,a2,b1}/` | 6 |
| Everyday mini-pack lessons | A localized slug under each everyday level page. Each language has 17 A1, 22 A2 and 28 B1. `lessonPaths` in [the slug map](../src/mini-packs/routes.js) gives the exact paths. | 134 |
| Grammar course indexes | `/konular/almanca-gramer/`, `/en/german-grammar/` | 2 |
| Grammar mini-pack lessons | `/konular/almanca-gramer/{a1,a2,b1}/{slug}/`, `/en/german-grammar/{a1,a2,b1}/{slug}/`. Each language has 21 A1, 16 A2 and 16 B1. The same [slug map](../src/mini-packs/routes.js) enumerates these. The grammar level grouping uses anchors on each index. | 106 |
| A1 practice test | `/konular/almanca-a1-test/` | 1 |
| Exams and DTZ guides | `/sinavlar/`, `/dtz-sinavi/`, `/en/dtz-exam/`, `/de/dtz-pruefung/` | 4 |
| DTZ mock | `/dtz-deneme-sinavi/`, `/de/dtz-pruefung/modelltest/` | 2 |
| DTZ study lists | `/dtz-kelime-kalip-cumle/` | 1 |
| Turkish writing course | `/dtz-mektup-yazma/` plus 24 `/dtz-mektup-yazma/{id}/` entries from `writingLessons` in [writing content](../scripts/writing-content.mjs) | 25 |
| German writing course | `/de/dtz-pruefung/schreiben/` with 15 chapter anchors in [the writing book](../scripts/data/dtz-writing-book.json) | 1 |
| App, legal and error | `/uygulama/`, `/privacy/`, `/impressum/`, `/404.html` | 4 |

- All 300 files have a title, H1 and description. All 299 ordinary pages have a self-canonical on the HTTPS apex. Only `/404.html` has a robots noindex meta tag. Both legal pages are canonical and absent from the sitemap, and the sitemap contains every other ordinary HTML route. Keep indexing policy and sitemap inclusion separately representable.
- Enumerate the paths from the [sitemap generator](../scripts/pages.mjs) and the [publication manifest](../scripts/public-files.mjs). For a compact comparison fingerprint, sort the 300 exact path strings using JavaScript's default `sort()`, then SHA-256 the UTF-8 `JSON.stringify` of the array. At this revision it is `c60b15a69ef7b116e7579e44f7e3e1245b2bd753d4f028c910cac85dd610babb`.
- Ten documents declare HTML hreflang. The homepage, everyday reader and grammar index pairs and the three DTZ guides are reciprocal. The German mock declares a Turkish equivalent whose page lacks the reciprocal alternate. Individual mini-pack lessons and level pages lack static hreflang. The mini-pack player maps the visible language switch by pack ID and can rewrite title, description and canonical during navigation. Equivalent-language metadata belongs with page definitions when migrated. Retain independent English editorial lessons and distinguish equivalent pages from help or fallback destinations.
- Keep clean paths, internal links, relevant fragments and successful compatibility entries. The mini-pack reader supports legacy `?topic=<pack-id>` and `?level=<CEFR>` on the reader. A matching topic on the library route replaces the URL with the clean lesson path. Internal selection pushes history and Back/Forward restores the lesson. The homepage supports `?practice=<topic-id>` and the practice fragment, and its search form falls back to `/konular/`.
- `/index.html` redirects 301 to `/`. The local preview sends 307 for recognized nested directory/index aliases and preserves queries. Exact 200 asset rewrites preserve the original allowlisted asset paths and the old 1200 px hero path. `/robots.txt` points to `/sitemap.xml`; missing URLs return the custom 404 with HTTP 404. `/kaynaklar/`, checked legacy download paths and `/dev/review/` are absent from this candidate's public preview. The tracked study-note sources remain private. Learner writing TXT exports are generated in the browser.
- The manifest also enumerates the non-page HTTP surface. Output contains 30 JS modules, four stylesheets, seven gzip archives, four license files, ten SVGs, five WebPs, five WOFF2s, two MP3s, `/robots.txt` and `/sitemap.xml`. Use the built `_redirects` for all exact asset aliases and the built `_headers` for fingerprinted routes. The two control files and `.nojekyll` also count toward package size. The archive routes are `/src/mini-packs/{library,library-tr,grammar,grammar-tr}.gz` and `/src/dtz/{modelltest-de,schreiben-de,study-lists}.gz`.

## Content and learning behaviour

| Format and source | Existing behaviour and parity target |
| --- | --- |
| Turkish topics and phrase, English editorial lessons, [topic data](../src/topics.js) and [English generator](../scripts/english-pages.mjs) | Turkish-aware search, no-results recovery, accessible topic dialogs and focus return, readable explanations, German examples and translations, recorded café audio on demand, cross-links and a real static fallback. Explicit English and Turkish paths and the approved [homepage](design/homepage.md) remain intact. |
| Shared [sentence rules](../src/exercise.js), [English activities](../src/english-exercises.js) and [player](../src/sentence-builder.js) | Choose, return and order tiles, then check. Empty, wrong and correct feedback are distinct. Preserve hints, reset, continuation and focus behaviour. Activity state stays in memory. |
| Everyday and grammar [mini-packs](../src/mini-packs/) | The same learning format serves two subject categories. There are 67 everyday and 53 grammar identities with distinct localized variants for Turkish and English. Preserve existing `DE-…` IDs, authored level/order, German examples, localized instructions, exercises and explanations, optional challenges and scenario branches, finite answer normalization, answer reveal, manual review, section progress and related cross-track lessons. The player fetches one of four language/track gzip files. Each deep link gives static introductory material and one German example. Full reader progress is in page memory and survives in-page navigation only. |
| Turkish [A1 practice test](../scripts/course-pages.mjs) | 12 original three-option questions, explicit check, client-side score, Turkish explanations, retry and targeted real lesson recommendations. Questions are in static HTML. Test responses stay in memory. |
| Bilingual [DTZ mock](../src/dtz/content.js) and [rules](../src/dtz/rules.js) | One underlying exam with 20 scored listening and 25 scored reading questions. Ignore example items. Audio starts on demand and listening gates advancement. Reading and writing use absolute 45- and 30-minute deadlines, including expiry catch-up after reload. Writing prompt A/B shares a draft, speaking candidate A/B shows corresponding images, and pause/resume, validation, result review, scoped reset and TXT export remain available. Scores of 33 or more yield B1, 20–32 A2, and lower scores unter A2. Writing and speaking are self/partner review. Turkish static HTML contains the tasks. The German mock loads a gzip fragment and offers a static link to the Turkish tasks. |
| [DTZ study lists](../src/dtz-study.js) and [filters](../src/dtz-study-filter.js) | Source arrays contain 218 word, 180 phrase and 1,387 sentence/frame records, including 92/107/378 basic-tier records respectively. The listing distinguishes words, expressions, patterns and sentences. Preserve translated meanings, examples, stable review anchors, filter dependencies/counts, list tiers and list/table modes. Basic material is static. Expanded and full content use a gzip archive. Reading has no completion criterion. |
| [Turkish writing course](../scripts/writing-content.mjs), [writing rules](../src/writing/rules.js) and [letter rules](../src/writing/letter-rules.js) | 22 lessons and two reference pages, 47 task/model variants, six formats and 11 letter types. Preserve choice, matching, cloze and ordering checks, short responses, letter planning and revision, A/B practice drafts, manually reviewed tasks/lessons, optional clocks, model/phrase help, last meaningful unfinished work, TXT export and static writing prompts. Finite items can be graded; free writing is self-reviewed. |
| [German writing course](../scripts/dtz-hub.mjs) and [resource player](../src/dtz/german-resource.js) | Original 15-chapter, 47-exercise book with per-field drafts, model and self-check disclosures, 30-minute practice timer and TXT export. Static chapter navigation and help remain readable. The book and controls currently load from a gzip fragment. |

## Browser-local persistence

| Origin-scoped key | Existing contract to retain |
| --- | --- |
| `baulingo-language` | String `tr` or `en`. The bare homepage uses the saved choice or browser locale. Explicit paths keep their language. Switches map to a corresponding lesson, level or help destination when defined. |
| `baulingo.dtz.mock-01.v1` | Shared across Turkish and German mock routes. JSON v1 with `exam`, `startedAt`, `phase`, `deadline`, `answers` (scored question ID → zero-based choice), `writing` (up to 20,000 characters), `prompt`, `candidate`, `listeningFinished`. Preserve phase/deadline validation, corrupt-data recovery and a reset scoped to this key. |
| `baulingo-writing:v1` | JSON v1 `{version,last,lessons}`. Lesson ID entries hold `complete`, `note`, `selected`, `lastTask`, `deadline` and task-ID records. Task fields are `draft`, `revised`, `checks`, `plan`, `deadline`, `responses`, `letterParts`, `letterStep`, `letterPrevious`, `legacyChecks`, `guidanceVersion`, `reviewed` and `updatedAt`. Preserve field validation, old draft/plan/check interpretation, field-level merging across tabs, memory fallback, local reset and reference exclusion from completion totals. |
| `baulingo-dtz-schreibkurs:de:<task-id>`, `baulingo-dtz-schreibkurs:de:deadline` | German writing uses raw draft strings under stable task field IDs and an epoch-millisecond timer stored as a string. Empty drafts remove their keys. The German and Turkish writing stores are independent. |
| `baulingo.ga4-consent.v2`, `baulingo.ga4-consent.v1` | `granted` and `denied` choices. A v1 refusal still applies if v2 is unset. An old grant requires renewed consent. Withdrawal stops tracking and clears analytics cookies before a reload if tracking had been enabled. |

The application has no IndexedDB, sessionStorage, accounts or learner-data service. Mini-pack, sentence and A1 practice state remain in memory. Preserve storage-denial recovery and use synthetic legacy fixtures in future parity checks. The ignored development review store is separate from learner data.

## Existing measurement contract

[The GA4 adapter](../src/analytics.js) uses website stream `G-R1YH6T64JM` after opt-in on HTTPS `baulingo.app`. Review query, robots noindex and non-production host conditions prevent enablement. GA4 automatic page views and ad signals are disabled in code. Manual `page_view` uses origin plus pathname, sanitized referrer and title, with a consecutive-path guard. The independent Cloudflare beacon provides aggregate traffic/performance in the recorded deployment.

The adapter has an event allowlist and field-level validation. It does not enforce required fields per event. `activity_id`, `exercise_id` and `section_id` allow 1–64 ASCII alphanumeric or hyphen characters. Integer counts are bounded to 0–86,400. Accepted counts are `result_count`, `attempt_number`, `questions_answered`, `correct_answers` and `duration_seconds`. Enum fields are `activity_type` (sentence, dtz, mini_pack, writing, a1_test, topic, resource, audio, site), `content_category` (grammar, everyday_communication), `content_language` and `target_language` (tr, en, de), `level` (A1–C2), `outcome` (correct, incorrect), `completion_type` (checked, self_review, exam_result), `feedback` (helpful, not_helpful), and `error_code` (audio_failed, library_failed, resource_failed).

| Events | Observed trigger and counting rules |
| --- | --- |
| `topic_selected`, `level_selected`, `language_changed` | Topic dialog opens and mini-pack lesson renders; the latter includes initial, direct and history entry. Explicit mini-pack and study-list level selections and instrumented language choices have their own events. |
| `search_performed`, `search_no_results` | Homepage search emits a result count on submit or settled input, with a second event for zero results. Raw terms stay in the browser. |
| `learning_started`, `learning_resumed`, `learning_paused` | Sentence dialog/practice, A1 choices/check, mini-pack interaction, writing interaction and DTZ start begin time accounting. DTZ explicitly resumes and pauses. One in-memory active session suppresses repeat begins for the same activity ID and type. No general cross-reload deduplication. |
| `exercise_answered`, `exercise_retried` | Sentence, mini-pack and structured writing check actions emit repeatable outcomes, with per-session attempt ordinals where supplied. A1 submits per-question outcomes and a total. DTZ emits final answered receptive items at section transition. A1 and sentence reset and some repeated checks emit retry signals. |
| `hint_used`, `answer_revealed`, `audio_played`, `audio_completed` | Explicit sentence hint, mini-pack answer/model reveal, writing model open, and successful phrase/DTZ audio playback or end. Help and audio signals carry no score. |
| `section_completed`, `learning_completed`, `feedback_submitted` | Mini-pack reviews/practice sections are deduplicated in the reader's in-memory progress and the lesson emits self-review completion once for that reader state. Writing sections use task review, with manual lesson completion guarded in the current page. Sentence and A1 emit checked completion, and DTZ emits exam-result completion with receptive totals. Mini-pack usefulness offers at most one response per shown prompt after completion, and only with analytics enabled. |
| `study_time` | Integer-second deltas, one active context, visible time since trusted activity, capped at 60 seconds of inactivity. Flushes roughly every 30 seconds and on visibility change, pagehide or stop, attributed to the path saved when study began. Passive activity can be undercounted. |
| `download_clicked`, `app_store_clicked`, `learning_error` | Supported links or TXT-export actions and fixed audio/archive error categories. No raw error details. |

The current contract overloads activity IDs, hardcodes context in several callers, has no page or collection ID and conflates mini-pack rendering and selection. Explicit generalized content exposure and return-visit events do not exist. Analytics history requires a release boundary. Before the mini-pack taxonomy change, grammar used `activity_type=grammar` and older everyday events lack `content_category`. After adoption both use `activity_type=mini_pack` plus their category. Existing counts describe actions from consenting browsers, with retries and mixed completion types. Search Console is for organic impressions, clicks and landing pages. Use Looker Studio for reporting with schema/release notes and GA4 for consented behavior. Account configuration, report traffic and field measurements remain unverified in this phase.

## Migration decisions and invariants

1. **Static delivery.** Astro owns static rendering, routes, layouts/components and SEO. Adopt strict TypeScript for new content models, validation, rules and the eventual analytics contract. Keep the current dependency-free builder and its verified entry points during initial coexistence. Preserve native interactive modules and pure rules across migration slices. Consider a React island only when a specific player warrants component/state composition, with hydration limited to that player. No SSR, backend, database, authentication, global state framework, sitewide React or paid services.
2. **Independent identities.** Content has a stable ID with genuine shared metadata and localized educational variants. A collection orders references to content for a product/course/path and can reuse an item present elsewhere. A page has its own stable ID, path, content association, locale, title, H1, description, canonical, equivalent links and indexing policy. A player consumes its format-specific data and owns only interaction state. Use Astro content collections where they simplify authoring or validation. Reuse the mini-pack player across everyday and grammar and preserve their category split. Keep exam, writing, study lists and sentence schemas independent.
3. **Page authority and parity.** Derive sitemap, internal links and equivalent-language relationships from the authoritative page records as each family migrates. Preserve all listed paths, independent localized paths at arbitrary depth, meaningful anchors and no-JavaScript content, approved layout and wording, metadata intent and real error/redirect behavior. Any public path migration needs authorization and permanent redirects. Decide explicitly where richer static content should replace archive-dependent previews without duplicating the authoring source or exceeding either budget. Preserve the unrelated Android policy at the legacy GitHub Pages address.
4. **Learning parity.** Preserve authored IDs/content, answer normalization, feedback, timing/scoring and lazy audio, scoped local data, export, navigation/focus, accessibility and fallback readings. Check the original designs at desktop and mobile widths. Apply storage compatibility fixtures before switching production entry points.
5. **Typed measurement.** Use an event-specific typed schema with required fields and a validated dispatch boundary. Derive content/page IDs, format, category, collection context, CEFR and content language from authoritative records. Keep explicit selections, direct exposure, active engagement, starts and resumes distinct. Define event trigger, unit, identity and deduplication scope before changing reporting, including meaningful denominators for progress/accuracy, checked versus self-reviewed completion, optional usefulness, return visits and bounded errors. Reading/reference formats require no artificial completion. Bind deltas and outcomes to the correct page/content and attempt across navigation/resume. Unique attempt identifiers stay out of GA4 reporting dimensions. Keep the stream ID, consent, sanitization and Android boundaries. Annotate any schema or metric transition in [the analytics guide](analytics.md) with its reporting effect.
6. **Cutover and removal.** Use the legacy builder as the release entry point during the foundation phase. Once a slice passes its route, content, behavior and size checks, give each migrated URL one production renderer. Remove a legacy generator/template or archive path when its final consumer has migrated and parity is verified. Retain the publication allowlist and intentional compatibility URLs. Retire the old build entry only after all consumers, tests, dev review and Cloudflare delivery work through the replacement. No push, merge or deployment without scope authorization.

## Hosting and publication

- [Main worker](../wrangler.json) serves `dist/` as Cloudflare static assets with `auto-trailing-slash` and `404-page` handling on the existing free hosting. [WWW worker](../cloudflare/www-redirect/README.md) handles only `www.baulingo.app/*`, sends 301 to HTTPS apex with path/query intact, and deploys separately with its preview and workers.dev settings disabled.
- [The allowlist](../scripts/public-files.mjs) and builder admit only deliberate static/generated files. Source symlinks are rejected. Keep repo metadata, raw authoring archives, docs, tests, dev/review material, secrets, original PNG/TTF artwork and Android material outside the payload. Keep published license notices, local WOFF2/WebP, exact immutable fingerprint rules, public asset aliases, security headers/CSP, workers.dev noindex and audio byte ranges. The local server mirrors a subset of edge behavior.
- [CI](../.github/workflows/check.yml) uses Node 24 and runs tests then build, with an artifact on success. There is no automatic deployment. Keep Node's current `--test-isolation=none` for the Windows baseline. No strict type checker or Astro exists at this revision.

## Verification and remaining issues

| Check | Phase 1 result |
| --- | --- |
| `npm test` | 99 passed, 1 failed. The core-size assertion in [production.test.mjs](../tests/production.test.mjs) measured 2,002,064 bytes. All other tests, including local route and HTTP behavior, learning rules/state, references, consent/sanitization and WWW worker tests, passed. |
| `npm run build` | Exit 0. 372 files, 10,915,456 bytes total. Core 2,002,064 bytes against a strict 2,000,000-byte cap. Separately inventoried DTZ media 8,913,392 bytes against 10,000,000. Media consists of the 8,698,988-byte listening MP3 and the 85,410- and 128,994-byte speaking WebPs. The test exits on the core assertion before the separate media assertion. |
| Budget history | A clean scratch build of `beff7ba` measured 2,000,068 core bytes with the same media. The incoming analytics/compaction commits add a net 1,996 bytes. The analytics module alone grew 6,354 bytes in output, partially offset by existing JS/CSS compaction. The current build already uses regex-based compaction and gzip variant selection. Keep this visible as baseline debt and preserve the limits. |
| Route and metadata sweep | All 300 emitted HTML paths returned 200 when requested directly, including the emitted 404 document itself. Missing paths served HTTP 404. Verified root 301 and nested 307 query preservation, sitemap membership, canonicals, title/H1/description presence and the hreflang gaps above. |
| Desktop and mobile local smoke checks | Headless Chrome 156.0.8078.80 at 1440×1000 and 390×844. Verified phrase playback, sentence hint and correct feedback, Escape dismissal, mini-pack legacy entry and Back restoring in-page review state, DTZ lazy audio and Turkish-to-German stored-attempt resume, confirmed pause/reset, and German writing draft restoration after reload. No horizontal document overflow on sampled pages or runtime exceptions. |
| JavaScript-disabled and consent checks | Disabled JavaScript to verify the mini-pack German example and Turkish DTZ questions in the page DOM. Tested consent settings and the persisted grant/denial on local preview. No Google request was made, including after local opt-in. Production-host event delivery remains unverified. |
| Strict types, edge and live measurement | No type-check command at baseline. No Cloudflare dry run, deploy, live-domain/GA4 ingestion check, physical-device or screen-reader run was performed. |

### Representative page transfer

Cold loads over loopback with Chrome cache disabled, device pixel ratio 1, localhost production-style preview, and no learner action. Capture after document and relevant dynamic content are ready, fonts settle and a 250 ms wait. Values are bytes. Payload sums Resource Timing `encodedBodySize` for navigation and loaded resources. Transfer sums the corresponding `transferSize`, including Chrome's response-header estimate. Local preview does not apply edge HTML compression. The precompressed archives are counted as delivered. Numbers are reproducible comparison points for this setup and exclude production analytics and action-triggered requests such as exam audio.

| Page | HTML body | Desktop payload / transfer | Mobile payload / transfer |
| --- | ---: | ---: | ---: |
| `/` | 14,850 | 269,171 / 276,671 | 230,508 / 237,708 |
| `/en/` | 9,419 | 247,770 / 253,470 | 209,688 / 215,388 |
| `/konular/almanca-a1/kendini-tanit/` | 730 | 140,199 / 144,699 | 138,308 / 142,508 |
| `/en/german-a1/introduce-yourself/` | 756 | 150,257 / 154,457 | 150,257 / 154,457 |
| `/konular/almanca-gramer/a1/modal-fiiller/` | 991 | 122,105 / 126,305 | 122,105 / 126,305 |
| `/en/german-grammar/a1/modal-verbs/` | 921 | 121,261 / 125,461 | 121,261 / 125,461 |
| `/konular/almanca-a1-test/` | 11,819 | 190,274 / 193,874 | 190,274 / 193,874 |
| `/dtz-deneme-sinavi/` | 79,222 | 339,429 / 344,229 | 339,429 / 344,229 |
| `/dtz-kelime-kalip-cumle/` | 120,858 | 371,952 / 375,852 | 371,952 / 375,852 |
| `/dtz-mektup-yazma/` | 8,618 | 269,343 / 275,343 | 269,343 / 275,343 |
| `/de/dtz-pruefung/schreiben/` | 3,102 | 235,385 / 239,585 | 235,385 / 239,585 |

Phase 1 acceptance recorded the existing red budget check and SEO and fallback gaps. Phase 2 verified the parallel Astro candidate above.
