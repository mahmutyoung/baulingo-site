# DTZ Writing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the owner's writing book as Turkish guided lessons with self-paced practice.

**Architecture:** A build-only snapshot preserves source material. Structured Turkish lesson data and pure rules feed a static page generator; a browser controller adds practice and local persistence.

**Tech Stack:** Node 24, static HTML/CSS, native JavaScript modules, Node tests.

**Spec:** `docs/superpowers/specs/2026-11-02-dtz-writing-design.md`

## Global Constraints

- Preserve the homepage and the existing 2 MB core output budget.
- Turkish guidance and feedback, German tasks and models; no free-writing scores.
- No sibling-project runtime dependency, accounts, external AI or exercise telemetry.
- Publication and pushes require separate authorization; implement locally here.

## Review Focus

- Corrupt/denied/full storage retains usable current-page drafts and reports loss of persistence.
- A blank saved draft or an opened model never counts as a completed lesson.
- Simulations retain separate A/B drafts; reload does not restart an active clock.
- Static content and links remain readable without JavaScript.
- Mobile navigation, keyboard feedback and long German text remain usable at 320 px.

### Task 1: Content and learning state

Files: `scripts/data/dtz-writing-book.json`, `scripts/writing-content.mjs`, `src/writing/rules.js`, `tests/writing.test.mjs`.

- [x] Write tests for answer checking, corrupt-state recovery, completion, task isolation and practice deadlines; run and confirm missing-feature failure.
- [x] Import the source snapshot with SHA-256 provenance, author Turkish lesson guides and activities, preserve every original model/task, implement pure validation/checking rules.
- [x] Run `node --test --test-isolation=none tests/writing.test.mjs`; expect all passing.

### Task 2: Static course and browser practice

Files: `scripts/writing-page.mjs`, `src/writing/player.js`, `writing.css`, `scripts/pages.mjs`, `scripts/public-files.mjs`, `index.html`, `src/topics.js`.

- [x] Add build tests for static lesson discovery, original content, escaped output and publication boundaries; confirm failure.
- [x] Build course index and lesson pages with Turkish learn/try/write/check/revise flow, explicit completion, local resume/export/reset and optional persisted practice clock.
- [x] Link from existing exam content and homepage; add exact public paths and sitemap entries.
- [x] Run `npm test` and `npm run build`; expect all checks green, including output size and references.

### Task 3: Review and handoff

Files: `dev/review/changes.json`, `docs/content/dtz-writing.md`, relevant architecture/roadmap/handoff/production notes and website privacy disclosure.

- [x] Add the newest review entry and document provenance, feature limits and local-only storage.
- [x] Inspect desktop/mobile rendered pages, keyboard, wrong/correct answers, reload, denied storage, A/B switching, expiry, downloads and no-JavaScript content.
- [x] Review the diff independently of implementation, run `git diff --check`, full tests and build, record actual evidence. Do not deploy or push.

## Execution record

All three tasks completed locally; no commits/pushes/deployment were requested for this feature. Full suite: 66/66, build and diff checks pass. Browser evidence and limits are in `docs/production.md`.

The first build exceeded 2 MB because large assets were emitted twice. Exact allowlisted static `200` aliases now preserve original URLs while publishing one fingerprinted WebP/WOFF2 copy. The asset-byte/revalidation regression failed before implementation and passes afterward. This retains the specified budget rather than increasing it; live edge verification is deferred until an authorized deployment.

Final independent review found Turkish answer-language and countdown live-region issues; both were fixed with a markup regression. Mobile-to-desktop navigation was reproduced as hidden and fixed with a failing-then-passing browser regression. No reviewer minors are deferred. Human editorial/official exam certification and actual assistive-technology output are not claimed.
