# DTZ Mock Exam 01 website port

Implemented locally on 30 October 2026 at `/dtz-deneme-sinavi/`. Not deployed as part of this task. The owner requested the full existing app simulation as a free traffic resource, and approved a separate lazy-loaded media allowance.

## Content and provenance

The controlled export reads `german-exam-app/src/features/mock-exam/dtzMockExam.ts` and exactly three original media files. [Source hashes](dtz-source.json) record the imported snapshot. Regenerate explicitly with `node scripts/import-dtz.mjs`; pass a source repository path as its first argument if needed. Normal builds need neither the app repository nor installed dependencies. Do not copy whole app/vault directories or add application telemetry.

The editorial source is `german-exam-obsidian/Projects/Mock Exam/Content`. Its README identifies the tasks, synthetic audio and generated images as original independent material. This port preserves German task wording, answer ordering, examples, 20 listening / 25 reading items, two writing choices and both speaking images. The speaking introduction/planning scenario is taken from the app screen. Turkish instructions explain the web experience. Source editorial documentation recommends human language, assessment, accessibility and audio-quality review; this port's technical tests are not a claim that such editorial review was performed. No release-approval manifest was found at the path mentioned by the editorial overview.

The practice interpretation retains 20/45 for A2 and 33/45 for B1 in listening/reading only. Writing and speaking receive no automatic grade. The page explains that this is an independent practice exam, not an official DTZ result or certificate. The format and thresholds were checked against [g.a.s.t.'s DTZ overview](https://www.gast.de/de/forschung-entwicklung/entwicklung/auftraege/deutsch-test-fuer-zuwanderer-dtz/der-dtz-auf-einen-blick).

## Delivery and interaction

- Static HTML contains all tasks and answers in collapsible review sections. Without JavaScript the tasks remain readable, with a normal audio control and an explanation that scoring, storage and timers are unavailable.
- The enhanced player presents listening, reading, writing, speaking and results sequentially. Examples are excluded from scores. No pause/seek controls are offered during the continuous listening attempt; media failures offer an explicit restart. Reloading unfinished listening requires replay from the beginning and preserves answers.
- Reading/writing use absolute 45/30-minute deadlines. Time continues during a break or in a background tab. If a deadline expires, the next deadline is derived from the original expiry so reloading cannot grant extra time.
- Only the current attempt is stored under `baulingo.dtz.mock-01.v1` in localStorage. It contains answers, writing draft, prompt/candidate choices, phase and timing. No answers, drafts or recordings are transmitted. The privacy notice describes this. Learners can reset, clear local data or download their draft. Blocked storage retains an in-memory attempt with a warning.
- Cloudflare aggregate analytics can report page traffic after publication. It cannot measure exam starts, completions, choice changes, usefulness or learning outcomes. No new event pipeline was added.

## Size and hosting

The original MP3 is 8,698,988 bytes and decodes to approximately 24 minutes 10 seconds. The two WebP images add 214,404 bytes. `dtzMediaFiles` is an exact three-file allowlist with a separate 10,000,000-byte test limit. All remaining public output retains the 2,000,000-byte core limit. The MP3 has no active source until the learner explicitly starts listening; speaking images are lazy loaded. This changes build size checks, not the hosting plan or billing. Everything ships with the main static site on the existing free Cloudflare plan.

## Local verification

25 automated tests cover the existing site plus content counts/examples, answer validation, receptive score boundaries, restore rejection, absolute deadlines, static DTZ HTML/discovery and audio byte ranges. Browser checks exercise real audio loading/playback and seek to its end to test completion without waiting 24 minutes; this is not a full human listening review. They cover 45 selected answers and a 45/45 result, reload/resume, timer expiry, writing/prompt persistence, candidate switching, no answer/draft POSTs, corrupt-state deletion, blocked storage, audio error/retry, keyboard radio selection, no-JavaScript fallback and widths 320/390/768/1440. Screenshots and browser scripts/results remain in ignored `.dev/`.

No commit, push, deployment, new analytics service or app change is part of the local implementation. Publication needs its own authorization and live checks.

The local reading and speaking toolbars compact when pinned by scrolling. Reading retains the countdown and save/pause control; speaking retains its suggested duration and save/pause control. Full labels return on scrolling up.
