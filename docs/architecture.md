# Baulingo website: shape and architecture

Status: live static foundation with incremental development. The owner asked for the general shape and architecture, followed by small implementation steps. The latest supplied [homepage reference](design/homepage.md) is authoritative for layout and copy. Product experiments are embedded in the main website to understand visitor demand and preferences.

The [long-term roadmap](roadmap.md) owns product stages, audience priorities and experiment decisions. This document describes how to support that direction with the current implementation.

## Purpose

Serve Turkish speakers learning German. Help them find an explanation in Turkish, understand a German example and try a short exercise. Keep useful content accessible without signup.

Use embedded interactions to learn which needs and learning experiences matter to this audience. Keep each experiment small enough to assess before expanding the product.

## Site shape

- Home: the supplied “Almancada aradığın cevap.” layout, topic search, a short phrase preview and three learning paths.
- Grammar: articles, cases and word order, explained in Turkish.
- Everyday German: situations such as appointments, shopping and speaking to a doctor.
- Free resources: removed from the pending website output at the owner’s request; source downloads remain in the repository.
- Exam preparation: `/sinavlar/` is the local static overview, leading with DTZ simulation and study cards; a secondary disclosure contains the guide to exam audiences. Other preparation packages remain planned.
- About, contact and privacy: basic public information.
- Embedded experiments: short interactions within the homepage or relevant existing content, using the same visual language and site deployment.

Each published learning page follows one pattern: learner question → short Turkish explanation → German examples → optional practice → related topics.

## Embedded experiment architecture

Experiments live inside the website's normal learner experience. The earlier separate experiment page, project and subdomain proposal is superseded. The dedicated WWW redirect Worker is infrastructure, not an experiment deployment.

Use the roadmap's question → experience → evidence → decision cycle for each experiment. Keep its content, answer rules, presentation and any measurement logic separate so that the interaction can change without coupling it to a tracking provider. Specify the measurement method when the selected experiment is implemented; no experiment event pipeline exists yet. Cloudflare automatically injects its Web Analytics beacon for aggregate traffic and browser performance. The site CSP permits its unversioned and versioned script paths and same-origin RUM reporting; see [analytics operations](analytics.md).

The existing short sentence activity provides an initial interaction pattern. Extend it incrementally while preserving the selected homepage layout and Turkish wording. Ship experiments with the main website. Aggregate website analytics does not collect exercise or preference events; native app telemetry remains a separate concern.

## Current foundation and optional future architecture

The current implementation uses static HTML/CSS and native JavaScript modules. Learning pages are generated from structured topic data; exercise rules are separate from DOM rendering. Continue with this foundation for embedded experiments. The earlier Astro + TypeScript direction remains an optional future content migration when justified by the content library. Render learning pages as static HTML and add browser interaction where an activity needs it. React islands remain an option for richer exercises later.

The following tree is an optional future content structure, not the current repository layout:

```text
src/
  pages/        Routes and page composition
  layouts/      Shared page and learning-page layouts
  components/   Header, navigation, topic links and resource previews
  content/      Turkish explanations and reviewed page metadata
  exercises/    Exercise data, answer rules and small browser players
public/
  assets/       Approved images, fonts and icons
  downloads/    Retained source files; no longer published
```

Keep content, answer rules and presentation separate. A page selects an exercise; it does not define its answer logic. Keep one reviewed source for content shared with the app. Use a controlled export when sharing becomes necessary. Do not copy the private application into this public repository.

Turkish remains the first audience. The owner also requested independently authored English content under `/en/`, with its own homepage and three lessons. `scripts/english-pages.mjs` generates those pages; `src/language.js` handles the initial browser preference and explicit language choices. The English header uses the same language chooser style as the Turkish homepage, showing the current language and a down arrow. English has no app information page.

Build static output into `dist/` for the agreed Cloudflare hosting. The main site is live at `baulingo.app`; a dedicated WWW Worker redirects to the apex. Embedded experiments share the main site's build and deployment. Accounts, progress sync and server features can be added when a defined learner need requires them.

## Implementation sequence

1. Preserve the live shared layout, topic-page pattern, search, downloads and sentence activity as the starting foundation.
2. Define the first embedded experiment brief and the evidence method described in the roadmap's immediate milestone.
3. Implement that small interaction using the existing site modules, then review its feedback, accessibility and mobile use.
4. Use the result to choose the next content or practice improvement. Add deeper exam preparation after its requirements are reviewed. Introduce accounts, backend services or a framework migration when the selected product work requires them.

## Current implementation

Local developer review uses `/dev/review/` with a maintained change catalog, the real website in a sandboxed same-origin preview, DTZ sample-state shortcuts and local feedback. Refresh rebuilds generated output in a fresh Node worker; approvals are bound to current source and matching preview versions. Review assets/middleware and feedback are excluded from the public static build. Normal production-style preview keeps review routes disabled and frame protections intact. See [review instructions](development/review.md).

The DTZ simulation is implemented locally at `/dtz-deneme-sinavi/` as a new page within the main static build; publication is pending. `scripts/import-dtz.mjs` exports only the existing app's exam data and three media files. `src/dtz/content.js` holds that snapshot, `src/dtz/rules.js` owns pure state/scoring/deadline rules, `src/dtz/player.js` enhances the static output from `scripts/dtz-page.mjs`, and `dtz.css` extends the site's design. Normal builds do not read the app repository. The current attempt is stored only in localStorage; drafts and answers are never submitted. The core output retains its 2 MB budget, with the owner's separately approved 10 MB allowance for exact, lazy-loaded DTZ media. See [the port notes](content/dtz-web.md) for scope, provenance and verification. Other exam packages remain planned.

The repository has static HTML/CSS, browser modules, generated topic and English pages, a production-output preview, an explicit public-file build and focused tests. The sentence activity, topic dialogs, recorded audio and text downloads work on the live site. Continue from these pieces rather than rebuilding the homepage. No Astro migration or native app changes have been made. See [production notes](production.md) for deployment verification.

## Static asset optimization

The build generates content-hashed copies of explicit core assets with `scripts/assets.mjs`, rewrites HTML/CSS references and appends exact immutable-cache rules. Dynamic hashes remain constrained to allowlisted source names. Mutable URLs retain revalidation, and DTZ media is not duplicated. Responsive hero copies and local font subsets are generated offline; normal Node builds use tracked assets. See [performance notes](performance.md).

## Shared sentence builder

`src/sentence-builder.js` renders the word-selection exercise for both languages. `src/exercise.js` owns pure selection and checking rules; `src/english-exercises.js` supplies independently authored English tasks and hints. `app.js` opens Turkish practice, and `src/english-practice.js` handles English practice dialogs and focus return. English lessons retain readable examples without JavaScript.

Study content on mobile defaults to horizontally scrollable tables, with a Liste / Tablo switch above the results. The switch preserves the active filters; static content remains readable without JavaScript.
