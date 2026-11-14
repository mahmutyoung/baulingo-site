# Scene-first UI implementation plan

> Execute inline using the executing-plans workflow. The owner approved the scene-first proposal and requested implementation, saved-comment follow-up and animation.

**Goal:** Show each scene's required content immediately and reserve disclosures for optional help.

**Architecture:** Keep static generators, native modules and existing storage intact. Use normal sections/headings for primary material, existing scene navigation for selection and CSS/Web Animations for motion.

**Tech Stack:** Static HTML, CSS, native JavaScript, Node 24.

**Spec:** Approved scene-first proposal in the conversation; existing homepage and writing design briefs.

## Constraints and review focus

- Preserve educational text, task IDs, storage and the approved homepage.
- Preserve all existing local changes and saved comment records; no commit or deployment.
- Required context must remain readable on mobile and without JavaScript.
- Switching scenes must preserve keyboard focus and drafts.
- Sticky heading transitions must avoid scroll/layout feedback and respect reduced motion.
- Retain optional answer reveal, original sources and old draft access.

## Tasks

- [x] Replace primary study, writing-task, navigation and reference disclosures with sections; remove generated wrappers hiding goals/context/review.
- [x] Put guided task context before the editor and preview below it on mobile; retain optional model/source/plan help.
- [x] Address the newest comment: remove level chips, enlarge sticky heading, animate heading/topic transitions. Preserve earlier comment fixes.
- [x] Add restrained scene, dialog, homepage and interaction motion with reduced-motion overrides.
- [x] Run Node tests and build; inspect browser flows at mobile/desktop widths, storage, keyboard and no-JS behavior.
- [x] Update core docs and prepend a review entry with honest verification notes.

## Execution record

Working in the current checkout because the requested UI extends uncommitted approved review work here. No branch, push or publication requested. Browser verification will use native Chrome debugging if the in-app browser is unavailable; no Playwright dependency is needed.

Browser evidence: `.dev/check-scene-first.mjs`, screenshots `.dev/scene-first/`. No runtime errors; all 24 writing destinations checked. An existing simulation class toggle with undefined force was corrected after reproducing hidden navigation. Optional planner/source were moved after the editor following capture review.
