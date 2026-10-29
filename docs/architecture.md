# Baulingo website: shape and architecture

Status: proposed foundation. The owner asked for the general shape and architecture, followed by incremental implementation. The latest supplied [homepage reference](design/homepage.md) is authoritative for layout and copy. The current homepage is a local visual/interaction draft.

## Purpose

Serve Turkish speakers learning German. Help them find an explanation in Turkish, understand a German example and try a short exercise. Keep useful content accessible without signup.

## Site shape

- Home: the supplied “Almancada aradığın cevap.” layout, topic search, a short phrase preview and three learning paths.
- Grammar: articles, cases and word order, explained in Turkish.
- Everyday German: situations such as appointments, shopping and speaking to a doctor.
- Free resources: descriptive pages and direct downloads.
- Exam preparation: a later section with reviewed, exam-specific content.
- About, contact and privacy: basic public information.

Each published learning page follows one pattern: learner question → short Turkish explanation → German examples → optional practice → related topics.

## Proposed architecture

Use the earlier Astro + TypeScript direction when the content foundation is introduced. Render learning pages as static HTML. Use Markdown for reviewed explanations and structured data for exercises. Add browser interaction only where an activity needs it. React islands are an option for richer exercises later.

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

Build static output into `dist/` for the agreed Cloudflare hosting. Account setup, deployment and DNS remain separate steps. Accounts, progress sync and server features can be added when a defined learner need requires them.

## Build in small steps

1. Establish the shared layout, typography, spacing and navigation.
2. Build one complete learning page to settle the content model and page pattern.
3. Connect one reusable exercise and review its feedback and accessibility.
4. Expand topics, downloads and search using that pattern. Add exam content after its requirements are reviewed.

## Current draft

The repository currently has static HTML/CSS, browser modules, a local preview, a public-file build and focused tests. The sentence activity, topic dialogs and text downloads are draft examples. Preserve them as reference material while establishing the foundation. No Astro migration, public deployment, DNS changes or app changes have been made.
