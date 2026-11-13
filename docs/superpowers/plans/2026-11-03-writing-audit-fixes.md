# Writing course audit fixes

User authorization: “fix all. I will do the last review.” Implement the 3 November Product Design audit locally, preserving the approved brand, original task/model IDs, existing saved work, free access and 2 MB core budget. The owner performs the final educational review. No publication, push or commit is requested.

## Approved changes and files

- `scripts/writing-guidance.mjs`: task-specific structured exercises, learning outcomes, required prompts, real planning points and explained model excerpts. `scripts/writing-phrases.mjs`: Turkish meanings and contextual examples for every reference phrase.
- `scripts/writing-content.mjs`: attach guidance, improve distractors, correct Turkish task briefs and clarify language rules. Preserve the source snapshot.
- `src/writing/rules.js`: persist bounded structured responses alongside legacy drafts, validate task review/last-task state, resume meaningful unfinished work. `src/writing/activities.js`: reusable keyboard-accessible checked choice/cloze/matching/ordering controller.
- `scripts/writing-page.mjs`, `src/writing/player.js`, `writing.css`: show necessary stimulus inline; use short fields for short tasks, point-linked plans/checks and annotated models for letters; compare A/B topics before choosing an editor; show save/failure status at editors; exclude reference pages from lesson progress; retain static reading and previous drafts.
- Core docs and newest `dev/review/changes.json` entry: synchronized behavior and an owner review checklist, without claiming teacher validation or learner outcomes.

## Verification tasks

- [x] Add regression tests for response migration, unfinished-task resume, reference exclusion, structured exercise checking and required inline prompts; verify failure before implementation.
- [x] Implement content guidance, rules, rendering and browser behavior without deleting prior drafts.
- [x] Run the full Node suite and build; retain public-path boundaries and 2 MB budget.
- [x] Inspect fresh desktop/mobile screenshots; exercise all task types, relevant feedback, planning/model mappings, A/B choice, local state/reload/export, denied storage, keyboard and no-JavaScript reading. Confirm LAN preview on port 4173.
- [x] Document actual verification and the owner's final review checklist. Leave code ready to review; do not claim an actual learner pilot or assistive-technology certification.

Execution evidence: 74 passing Node tests; successful build within2MB; browser checks described in production notes. Read-only technical review findings were fixed with regressions, including visible short-revision persistence and changed-field storage merges. Ordering announcement and explicit `weil` instructions were fixed. A subsequent quota-failure regression confirms later memory edits are exported. No commits, pushes or deployments were performed. The owner is the final content reviewer.
