# Baulingo website: shape and architecture

Status: live static foundation with incremental development. The owner asked for the general shape and architecture, followed by small implementation steps. The latest supplied [homepage reference](design/homepage.md) is authoritative for layout and copy. Product experiments are embedded in the main website to understand visitor demand and preferences.

## Purpose

Serve Turkish speakers learning German. Help them find an explanation in Turkish, understand a German example and try a short exercise. Keep useful content accessible without signup.

Use embedded interactions to learn which needs and learning experiences matter to this audience. Keep each experiment small enough to assess before expanding the product.

## Site shape

- Home: the supplied “Almancada aradığın cevap.” layout, topic search, a short phrase preview and three learning paths.
- Grammar: articles, cases and word order, explained in Turkish.
- Everyday German: situations such as appointments, shopping and speaking to a doctor.
- Free resources: descriptive pages and direct downloads.
- Exam preparation: a later section with reviewed, exam-specific content.
- About, contact and privacy: basic public information.
- Embedded experiments: short interactions within the homepage or relevant existing content, using the same visual language and site deployment.

Each published learning page follows one pattern: learner question → short Turkish explanation → German examples → optional practice → related topics.

## Embedded experiment roadmap

Experiments live inside the website's normal learner experience. The earlier separate experiment page, project and subdomain proposal is superseded. The dedicated WWW redirect Worker is infrastructure, not an experiment deployment.

For each experiment, first name the learner question it will answer: which topic visitors need, which activity they choose or what they prefer after trying it. Then define the smallest embedded interaction and the evidence needed to decide whether to expand, adjust or stop it. Choices, completion and optional explicit feedback are candidate signals; the measurement approach must be specified when that experiment is implemented.

The existing short sentence activity provides an initial interaction pattern. Extend it incrementally while preserving the selected homepage layout and Turkish wording. Ship experiments with the main website. No website measurement pipeline has been implemented by this architecture update; native app telemetry remains a separate concern.

## Proposed architecture

The current implementation uses static HTML/CSS and native JavaScript modules. Learning pages are generated from structured topic data; exercise rules are separate from DOM rendering. Continue with this foundation for embedded experiments. The earlier Astro + TypeScript direction remains an optional future content migration when justified by the content library. Render learning pages as static HTML and add browser interaction where an activity needs it. React islands remain an option for richer exercises later.

```text
src/
  pages/        Routes and page composition
  layouts/      Shared page and learning-page layouts
  components/   Header, navigation, topic links and resource previews
  content/      Turkish explanations and reviewed page metadata
  exercises/    Exercise data, answer rules and small browser players
public/
  assets/       Approved images, fonts and icons
  downloads/    Published learning files
```

Keep content, answer rules and presentation separate. A page selects an exercise; it does not define its answer logic. Keep one reviewed source for content shared with the app. Use a controlled export when sharing becomes necessary. Do not copy the private application into this public repository.

Keep Turkish as the first language. Use a route/content structure that can later support language folders without building language switching now. Final route names should be settled before publishing a learning library.

Build static output into `dist/` for the agreed Cloudflare hosting. The main site is live at `baulingo.app`; a dedicated WWW Worker redirects to the apex. Embedded experiments share the main site's build and deployment. Accounts, progress sync and server features can be added when a defined learner need requires them.

## Build in small steps

1. Establish the shared layout, typography, spacing and navigation.
2. Build one complete learning page to settle the content model and page pattern.
3. Connect one reusable exercise and review its feedback and accessibility.
4. Expand topics, downloads and search using that pattern. Add exam content after its requirements are reviewed.

## Current implementation

The repository has static HTML/CSS, browser modules, generated topic/resource pages, a production-output preview, an explicit public-file build and focused tests. The sentence activity, topic dialogs, recorded audio and text downloads work on the live site. Continue from these pieces rather than rebuilding the homepage. No Astro migration or native app changes have been made. See [production notes](production.md) for deployment verification.
