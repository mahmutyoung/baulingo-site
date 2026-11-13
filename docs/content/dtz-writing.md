# DTZ letter-writing course

Implemented locally on 2 November 2026 at `/dtz-mektup-yazma/`; not deployed. The owner requested integrating their separate `dtz-writing-book-web`, then chose Turkish guided lessons with practice and self-paced writing.

Update, 3 November: the owner requested fixing the Product Design audit and will perform the final review. The course distinguishes 22 lessons and two reference tools. All 47 task IDs remain; task-specific matching, choice, cloze, ordering and short-writing fields replace generic letter editors where appropriate. The 21 full-letter tasks have real point-linked plans, checks and annotated model excerpts. The 64 reference entries include Turkish meanings and contextual examples. See the [owner review checklist](dtz-writing-review.md).

The source snapshot stays intact. Course models c4-t3 and c12-t1 were adapted to satisfy their instructions (two listed conjunctions; explicit acceptance reason). Distractors were revised for relevant learning errors. Register and capitalization explanations were clarified against GfdS/Duden; the basic DTZ writing structure was checked against g.a.s.t. These checks do not certify educational outcomes or official exam equivalence.

Existing v1 drafts, revisions and plans remain accessible and exportable, including legacy short-task text. Old general checkboxes are retained separately instead of becoming new point checks. Structured responses, task review and last edited task are validated locally. Resume selects meaningful unfinished work, excluding references. Text edits reopen a completed lesson; checkboxes alone never complete it. Saves merge changed task fields against latest storage to retain other tabs' drafts. When storage fails, subsequent edits remain in the downloadable memory state. Save/failure messages sit beside the writing fields. A/B briefs precede selection; JavaScript shows one selected editor, while static tasks remain accessible without it.

## Content and provenance

`scripts/data/dtz-writing-book.json` is the explicit build-only snapshot of the owner's `dtz-writing-book-web/book-data.js`. Its `sha256` records the imported file's hash. The source has an introduction plus fourteen chapters. All 47 answer/model disclosures are represented as separate writable activities, including the six A/B simulation alternatives. Eleven letter types have individual lessons; the three simulations have separate pages, producing 24 lessons overall. The source website and Obsidian book were only read, not modified.

`scripts/writing-content.mjs` supplies Turkish explanations, task briefs and new short answer activities. The original German exercise prompts and model answers remain in the private snapshot. The visible course adapts the two model passages noted above and provides Turkish task-specific scaffolding. Teaching explanations are adapted, not presented as a full sentence-for-sentence translation. `scripts/writing-page.mjs` escapes source markdown into static pages. The snapshot and generator are never published; normal builds need no sibling checkout or dependencies.

## Learner behavior

The course links from the homepage exam column, topic/search entry and `/sinavlar/`. Learners can choose any lesson, read Turkish guidance, check a choice/cloze/order answer, plan and write in German, use self-checks, compare with a model and revise a sentence. Source exercises include short responses and full letters. Reference and learning-plan lessons are tools rather than artificial quizzes.

`src/writing/rules.js` keeps normalization, state validation, explicit completion and absolute deadlines separate from `src/writing/player.js`. The browser stores `baulingo-writing:v1` only: drafts, plans, checkboxes, revisions, learning notes, selected tasks, last lesson, optional deadlines and deliberate completion. Saving text never means mastery/completion. A/B drafts are independent. The optional clock survives reload while storage works and never locks writing at expiry. A UTF-8 text download exports work; scoped reset deletes only this course key after confirmation. Data is never submitted or sent to an AI service or analytics. Aggregate page analytics remains separate; no learner demand or learning outcome is measured here.

Blocked or failed storage leaves the current page usable and warns that navigation/reload loses unsaved work. Models, German prompts, course links and Turkish guidance are static and usable without JavaScript; writing fields and automatic checks require JavaScript. Free writing receives no automatic grade or official level.

## Build budget

The existing core 2 MB budget is unchanged. Large WebP/WOFF2 assets publish only their fingerprinted bytes, retaining original addresses through exact same-origin `200` rewrites in generated `_redirects`. This uses [Cloudflare's supported static-asset proxying](https://developers.cloudflare.com/workers/static-assets/redirects/). Local preview handles only these exact allowlisted aliases with revalidation. Source files remain intact; small icons/audio and the separate DTZ media allowance are unchanged. This avoids duplicate large assets to make room for static lessons.

## Verification

See [production notes](../production.md) for recorded checks. Development walkthrough: newest **DTZ mektup yazma: Türkçe ve kendi hızında** entry at `/dev/review/`. Local-only screenshots and browser checks live in `.dev/`.
