# Baulingo website architecture

The target is a static Astro site with strict TypeScript and browser-local learning. The production build uses HTML, CSS, native JavaScript and a custom static builder. The Astro candidate renders every indexed route and the sitemap from the validated catalog. Both builds derive reporting metadata from that catalog and share the browser modules and learning rules. The candidate build still takes allowlisted assets, legal pages and the 404 from the legacy build. [Migration handoff](migration.md)

Turkish speakers learning German remain the primary audience. The roadmap governs product priorities and experiments, and the approved homepage reference governs the layout and Turkish copy. [Roadmap](roadmap.md) · [Homepage reference](design/homepage.md)

## Purpose

Serve Turkish speakers learning German. Help them find an explanation in Turkish, understand a German example and try a short exercise. Keep useful content accessible without signup.

Use embedded interactions to learn which needs and learning experiences matter to this audience. Keep each experiment small enough to assess before expanding the product.

## Target architecture

| Responsibility | Target |
| --- | --- |
| Educational content | Strict TypeScript models and build-time validation. Use Astro content collections where they simplify authoring or validation. Reuse existing data and retain the schemas specific to mini-packs, examinations, writing and reference materials. |
| Publishing | Astro generates static HTML, localized routes, shared layouts and SEO metadata. Pages remain readable with JavaScript disabled. |
| Learning | Framework-independent rules own answers, scoring, timing and progress transitions. Native TypeScript enhances simple activities. A complex player can use a React island when its composition or state warrants it, with hydration scoped to the player. |
| Persistence | Browser-local storage retains learner progress, drafts and attempts. Existing keys, record formats and recovery behavior are compatibility requirements. Activity state that currently lives in memory stays there until a product requirement changes it. |
| Measurement | One typed learning event contract. Consented GA4 measures website behavior, Search Console reports organic discovery, and Looker Studio combines reporting views while retaining the meaning of each source. |
| Delivery | Cloudflare serves an explicitly bounded static artifact on the existing free hosting. The site has no runtime server, database, authentication or global state framework. |

### Content, collections, pages and players

| Concept | Owns |
| --- | --- |
| Content | A stable identity, localized educational material, and shared classification where applicable. Format-specific fields carry exercises, exam tasks, examples or other material. |
| Collection | An ordered set of content references for a course, product or learning path. The same item can appear in multiple collections without duplicating its material. |
| Page | A stable page ID, independently specified public path, locale, title, H1, description, content association, canonical, language equivalents and indexing policy. |
| Player | The presentation and interaction for a learning format, using the content's existing rules and state model. |

For example, `DE-A1-G09` is one A1 item in the `mini_pack` format and the `grammar` category. Its Turkish page is `/konular/almanca-gramer/a1/akkusativ-einen-ve-den/` and its English page is `/en/german-grammar/a1/the-accusative/`. Each page has its own metadata and path. Both use the same mini-pack player as the everyday communication track. [Existing route map](../src/mini-packs/routes.js)

### Publishing and SEO

Page records drive static route generation, internal links, the sitemap and reciprocal language equivalents. Localized URLs may use any required path depth. Course order, navigation placement and URL structure can evolve independently. Emit language equivalents for substantially equivalent pages and keep contextual help links separately. Validate unique IDs and public paths, referenced content and equivalent page IDs at build time.

Preserve existing public routes, linking behavior and indexing intent. Any route change requires owner approval and a permanent redirect. Keep explanations, examples and navigation in generated HTML. Interactive controls enhance that material. Use original localized editorial content where it exists and avoid extra pages for minor keyword variants.

#### AI search discoverability

Use the same Astro pages and SEO metadata for conventional and AI search. For each indexable learning page, render enough of the lesson in HTML for a learner to understand and use it without JavaScript. Use headings, paragraphs, lists and tables according to their meaning. Give clear definitions, original German examples, translations in the page language and practical explanations where relevant. Use ordinary HTML links to related concepts and reuse the existing content IDs, descriptive URLs, canonicals and language equivalents. Avoid keyword stuffing, manufactured FAQs, duplicate pages and unverified ranking techniques. The existing static build is the publishing engine for this work. [Google Search AI guidance](https://developers.google.com/search/docs/appearance/ai-features)

Generate structured data at build time from validated page and content records where the type accurately describes visible content. Compare the markup with the rendered page and validate it against the applicable schema and search feature. An eligible breadcrumb trail is one example. Keep JavaScript optional for reading, and preserve the site's CSP and output budgets. No separate AI publishing engine, vector database, paid API or runtime LLM dependency is required. [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Treat crawler access, indexing and training permissions as separate controls. Record the intended policy for each relevant crawler purpose and verify the deployed `robots.txt`, indexing directives and effective Cloudflare access together. `OAI-SearchBot` and `GPTBot` are examples of separate search and training controls. Apply training permissions according to the owner's policy. [OpenAI crawler roles](https://developers.openai.com/api/docs/bots) · [Cloudflare crawler rules](https://developers.cloudflare.com/ai-crawl-control/configuration/ai-crawl-control-with-waf/)

### Learning and measurement

Retain the existing answer checks, exam deadlines and scoring, lazy audio, writing drafts, progress, keyboard behavior and local exports. Migrate each format through its normal entry points with stored-data fixtures and browser parity checks. Where content is shared with the Android app, use a controlled export and keep the website build and app release independent.

Derive analytics context from the content and page records, including content ID, page ID, format, subject category, collection context, CEFR and content language. Define each event's trigger, required parameters, unit and deduplication scope. Distinguish direct exposure from explicit selection and active engagement, start from resume, and checked completion from self-review. Attribute outcomes and time to the right page, lesson and attempt through navigation and resume. Reading and reference material can be measured without a completion event.

Keep GA4 measurement ID `G-R1YH6T64JM` and the existing consent behavior. Exclude raw searches, answers and drafts from event payloads, and keep unique attempt IDs out of reporting dimensions. Document metric changes and their release boundary before comparing historical and new data. Android analytics remains independent. [Analytics operations](analytics.md)

Measure identifiable AI referrals and their later content engagement through the same consented GA4 contract. Keep campaign attribution separate from clean page URLs by mapping approved signals to controlled fields. [Attribution requirements](analytics.md#unified-consented-analytics-and-attribution)

### Source layout and migration

```text
src/
  content/       Educational sources and format validation
  publishing/    Validated page records and collection references
  pages/         Static routes and page composition
  layouts/       Shared HTML and SEO metadata
  components/    Reusable presentation
  learning/      Learning rules and players
  analytics/     Event contracts and GA4 adapter
  styles/        Shared styles
public/          Explicitly published static assets
tests/           Build, learning and publication checks
docs/            Architecture and migration handoff
```

Create these directories as migrated code needs them. Keep the legacy production build during the Astro foundation phase. Once a route family switches, give it one production renderer and remove the corresponding legacy template or archive when its final consumer has migrated and parity is verified. Use both mini-pack tracks to test whether the structure improves maintenance without increasing visitor costs before migrating other formats.

Publish only the verified static artifact. Preserve the Cloudflare apex and separate WWW redirect, security headers, cache rules, and public asset aliases. Keep the legacy Android privacy URL available. Measure deployment size separately from page transfers. The 2 MB core and 10 MB DTZ media caps remain in force. The baseline core overage is recorded in the handoff, which also carries the phase gates and exact next task. [Migration handoff](migration.md) · [Production operations](production.md)

## Current site shape

- Home: the supplied “Almancada aradığın cevap.” layout, topic search, a short phrase preview and three learning paths.
- Grammar: articles, cases and word order, explained in Turkish.
- Everyday German: situations such as appointments, shopping and speaking to a doctor.
- Mini-packs: [Turkish Topics](../konular/mini-paketler/index.html) and [English Topics](../en/mini-packs/index.html) each link to 67 authored A1–B1 lessons. The shared reader fetches one gzip archive for the selected language. Progress stays in page memory.
- Turkish course pages at `/konular/almanca-a1/`, `/konular/almanca-a2/` and `/konular/almanca-b1/` render course links and a sample exercise from the same mini-pack data. The A1 practice test uses original questions, client-side scoring and lesson recommendations.
- English course pages at `/en/german-a1/`, `/en/german-a2/` and `/en/german-b1/` link to all the English packs. Both languages have stable lesson slugs, matching canonicals in their static previews and sitemap entries. The shared reader opens the full lesson from a clean URL or a legacy topic query.
- Gramer Kursu and German Grammar Course are separate 53-lesson tracks. They use the same reader in teaching order, separate gzip archives by language, and readable topic URLs. Each grammar pack links to the source-designated everyday lesson, which links back to the grammar packs that use it.
- Language switches share one English/Turkish preference in browser storage. The preference applies on the bare homepage. Explicit language URLs retain their own content. Switching maps to the same lesson or level when available and to the relevant course or help page otherwise.
- Free resources: removed from the pending website output at the owner’s request; source downloads remain in the repository.
- Exam preparation: `/sinavlar/` is the local static overview, leading with DTZ simulation and study cards; a secondary disclosure contains the guide to exam audiences. Other preparation packages remain planned.
- DTZ-Prüfung: `/de/dtz-pruefung/` links the German Modelltest and the complete original German writing book. The German test uses the same exam player and browser attempt as the Turkish test. The English and Turkish help pages link to the resources with instructions in their respective languages.
- About, contact and privacy: basic public information.
- Embedded experiments: short interactions within the homepage or relevant existing content, using the same visual language and site deployment.

Each published learning page follows one pattern: learner question → short Turkish explanation → German examples → optional practice → related topics.

## Embedded experiment architecture

Experiments live inside the website's normal learner experience. The earlier separate experiment page, project and subdomain proposal is superseded. The dedicated WWW redirect Worker is infrastructure, not an experiment deployment.

Use the roadmap's question → experience → evidence → decision cycle for each experiment. Keep its content, answer rules, presentation and any measurement logic separate so that the interaction can change without coupling it to a tracking provider. Specify the measurement method when the selected experiment is implemented. The opt-in website GA4 adapter now captures limited sentence/DTZ activity events after consent, but is not a general experiment pipeline or evidence of actual learner demand. Cloudflare automatically injects its Web Analytics beacon for aggregate traffic and browser performance. The site CSP permits its unversioned and versioned script paths and same-origin RUM reporting; see [analytics operations](analytics.md).

The existing short sentence activity provides an initial interaction pattern. Extend it incrementally while preserving the selected homepage layout and Turkish wording. Ship experiments with the main website. Aggregate website analytics does not collect exercise or preference events; native app telemetry remains a separate concern.

## Current implementation

The study page keeps basic level/content filters separate from a native advanced disclosure holding the existing four other filters. `src/dtz-study-filter.js` retains the original dependency/count rules, synchronizes per-level view buttons and updates sticky level/topic context using a throttled scroll handler. Writing phrase data is held in a hidden library rather than a visible sidebar; the builder moves that library into its inline toolbox when requested. Initial privacy notices are omitted, while real storage failures, corrupt data and failed resets explicitly reveal their feedback.

The guided writing presentation now adds `src/writing/letter-rules.js` for pure composition/synchronization and `letter-builder.js` for the step UI, sectioned preview, relevant patterns and labelled Tabler icons. Existing task IDs and educational data remain unchanged. `rules.js` validates bounded `letterParts`, `letterStep` and `letterPrevious`; `player.js` persists these through the same merge/save/error/export path. Section edits synchronize generated drafts but preserve independently edited full letters; explicit transfer backs up the previous text. Simulations retain their original editor. The normal public allowlist includes the two modules, icon sprite and MIT license. Redundant false reference attributes were omitted from generated navigation to preserve the existing 2 MB core budget.

The local DTZ writing course now uses a compact studio presentation matching the [owner's reference](design/dtz-writing-studio.md). `scripts/writing-page.mjs` renders grouped lesson navigation and the phrase-toolbox shell; `src/writing/studio.js` enhances stages, single-task navigation, disclosures, phrase search/insertion and live draft preview. It loads the existing static phrase reference rather than maintaining or publishing a duplicate phrase dataset. `src/writing/player.js` and the existing rules continue to own persistence and answers. All educational content remains unchanged and readable statically. This presentation update awaits publication.

Local developer review uses `/dev/review/` with a maintained change catalog, the real website in a sandboxed same-origin preview, DTZ sample-state shortcuts and local feedback. Refresh rebuilds generated output in a fresh Node worker; approvals are bound to current source and matching preview versions. Review assets/middleware and feedback are excluded from the public static build. Normal production-style preview keeps review routes disabled and frame protections intact. See [review instructions](development/review.md).

The DTZ simulation is implemented locally at `/dtz-deneme-sinavi/` as a new page within the main static build; publication is pending. `scripts/import-dtz.mjs` exports only the existing app's exam data and three media files. `src/dtz/content.js` holds that snapshot, `src/dtz/rules.js` owns pure state/scoring/deadline rules, `src/dtz/player.js` enhances the static output from `scripts/dtz-page.mjs`, and `dtz.css` extends the site's design. Normal builds do not read the app repository. The current attempt is stored only in localStorage; drafts and answers are never submitted. The core output retains its 2 MB budget, with the owner's separately approved 10 MB allowance for exact, lazy-loaded DTZ media. See [the port notes](content/dtz-web.md) for scope, provenance and verification. Other exam packages remain planned.

The repository has static HTML/CSS, browser modules, generated topic and English pages, a production-output preview, an explicit public-file build and focused tests. The Astro candidate reuses these site modules for its homepage. The native app and live website have independent release histories. [Migration handoff](migration.md) · [Production notes](production.md)

## Static asset optimization

The build generates content-hashed copies of explicit core assets with `scripts/assets.mjs`, rewrites HTML/CSS references and appends exact immutable-cache rules. Dynamic hashes remain constrained to allowlisted source names. Mutable URLs retain revalidation, and DTZ media is not duplicated. Responsive hero copies and local font subsets are generated offline; normal Node builds use tracked assets. See [performance notes](performance.md).

## DTZ letter-writing course

The 3 November audit fixes distinguish 22 learning lessons and two reference tools. `scripts/writing-guidance.mjs` defines the real task types/points/outcomes; `scripts/writing-phrases.mjs` holds Turkish reference meanings and examples. `scripts/writing-format.mjs` handles escaped source markdown; `scripts/writing-task-page.mjs` renders task-specific controls and annotated models; `src/writing/activities.js` checks finite answers separately from the course storage/DOM controller. Local v1 state retains old drafts and adds bounded responses, task review, meaningful resume and field-level storage merges. See [owner review notes](content/dtz-writing-review.md).

The owner-requested Turkish writing course is prepared locally at `/dtz-mektup-yazma/`, with 24 static pages (22 lessons and two reference tools), 47 source task/model alternatives and 11 letter types. Build-only source data feeds Turkish adaptation and static generation; pure browser rules and a DOM controller add checks, local drafts, explicit completion, export and optional clocks. No server storage or exercise-event measurement is added. Large image/font output is deduplicated behind exact static rewrites to retain the 2 MB core budget. See [writing implementation notes](content/dtz-writing.md). Publication is pending.

## Shared sentence builder

`src/sentence-builder.js` renders the word-selection exercise for both languages. `src/exercise.js` owns pure selection and checking rules; `src/english-exercises.js` supplies independently authored English tasks and hints. `app.js` opens Turkish practice, and `src/english-practice.js` handles English practice dialogs and focus return. English lessons retain readable examples without JavaScript.

Study content on mobile defaults to horizontally scrollable tables, with a Liste / Tablo switch above the results. The switch preserves the active filters; static content remains readable without JavaScript.


Scene-first presentation (14 November): study situations, lesson groups, writing tasks and phrase reference groups render as static sections. The writing studio retains scene/task selection but leaves goals and required context visible; review is a section rather than a disclosure. The guided builder moves required context before its workspace and keeps the letter preview visible on all widths. Optional models, plans, sources and old drafts remain disclosures. Sticky study headings reserve fixed space and use an is-stuck class for type transitions; topic changes animate only when text changes. Shared CSS and focused builder transitions respect reduced motion. No new dependencies, public files or storage formats were introduced.


Language presentation: `src/learning-text.js` provides explicit phrase segmentation and safe HTML/DOM rendering, reused by static topic generators, topic dialogs and guided writing. German annotations stay separate from original topic/search strings. Example translations inherit the page language, not German. The helper is explicitly public; other publication boundaries and the 2 MB core budget remain. See [the convention](design/language-presentation.md).


Interface-copy cleanup (14 November): the writing studio moves the progress bar independently of sidebar prose. The guided builder finds its word-counter paragraph via `[data-word-count]` rather than editor sibling order. Word-order output remains an accessible live region with empty initial text. No storage, scoring or route schema changed; recovery feedback remains separate from concise normal storage-scope notes.
