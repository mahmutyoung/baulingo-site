# Guided DTZ letter builder — design QA

final result: passed

## Approved target

The [owner's studio reference](docs/design/dtz-writing-studio-reference.png), 1487 × 1058 px, and the combined guided-format design approved in chat. See [design brief](docs/design/dtz-writing-studio.md). This adapts the reference's letter workspace and step guidance to all original non-simulation letter tasks. Nine steps include greeting, introduction, the four authored points, closing, name and review. Source content remains authoritative; the mockup's different four-step numbering and sample copy are not imported.

## Visual evidence

Ignored local captures: .dev/builder/final-1487.png, final-390.png and final-320.png. The paired .dev/builder/comparison.png shows reference and implementation at equal 1487 × 1058 density (deviceScaleFactor 1), both at the course-days writing point. The comparison and phone captures were opened and inspected. The approved local fonts/logo and ivory, forest, sage and gold palette remain. A large current instruction, single field and Geri / Devam et sit beside a letter-shaped, sectioned preview. Real Tabler outline icons accompany visible labels. The full original German letter model keeps normal paragraph formatting; Turkish teaching prose uses list items.

The preview shows only the learner's own text and explicit empty-section labels. It highlights the current section and allows returning to it. On mobile it is a visible Mektubumu gör disclosure; the field and relevant phrase suggestions remain in one column. Descriptive task names replace unexplained numbered buttons. The independent exam route retains the complete-letter editor.

## Repairs and verification

An initial mobile capture exposed an inherited top offset moving the relatively positioned sidebar into the lesson heading. The mobile offset is now reset; the browser suite asserts the sidebar does not overlap the work area at 320/390/800 px. Revised captures confirm readable separation. Code review found the full phrase toolbox was unavailable in final review; its control now remains visible beside the complete editor, and browser assertions verify access/insertion there. Context-phrase ranking prioritises the appropriate authored category before matching example keywords.

Browser checks cover all nine steps; section-to-draft composition; reload at a saved step; two independent tasks; full-letter edits and explicit transfer with a retained previous draft; old freeform drafts opening intact; relevant/all 64 phrase search and keyboard insertion; mobile preview-section navigation and insertion; 320/390/800/1024/1487 px overflow/spacing; unchanged A/B selection, clock and short exercises; unavailable-storage warning/export including structured work; and static no-JavaScript tasks/models/navigation. No runtime exceptions were observed.

All 81 Node tests and the public build pass, including the existing 2 MB core / 10 MB DTZ-media budgets and publication boundaries. The before/after educational-content fingerprint matches: 24 destinations, 47 tasks, 64 phrases, teaching wording, examples and model answers. These checks verify implementation, not learning outcomes or usability with the target audience.

No remaining P0/P1/P2 findings. No push or deployment was performed.

## Saved-comment follow-up

The later owner notes replace the standalone helper rail with a hidden inline-phrase source and remove initial privacy notices. The actual letter preview, all reference content and error feedback remain. Study filters now show two basic controls and four advanced controls; Liste / Tablo sits in a sticky level heading whose topic updates while scrolling. The controls work on desktop and phones. Browser captures in `.dev/review-followup/` were inspected at 390 and 1440 px, with automated layout/keyboard/scroll/filter checks also at 320 and 800 px. The complete guided-letter flow was rerun against main, including phrase insertion, saved/older drafts and denied-storage export. The original four notes are preserved and linked from the newest review entry.


## Scene-first presentation — 14 November 2026

Current captures are in ignored `.dev/scene-first/`; desktop writing/home/sticky and mobile writing/sticky captures were visually inspected. Chrome assertions cover 320/390/800/1440 px: required context, plain task headings, no horizontal page overflow, filters/views, larger sticky type, phrase search/insertion, saved draft reload, task-heading focus, simulation A choice, homepage dialog/focus return. All 24 writing destinations load without runtime errors. Reduced motion has no active animations; no-JavaScript study tables and writing context/editor remain visible. Optional planning/source panels were moved below guided editing after visual inspection showed they delayed reaching the main field. A simulation-only navigation bug was traced to an undefined force argument in classList.toggle; explicit Boolean values now prevent guided styling from hiding simulation navigation. No live-domain checks or deployment were performed.

Final verification: all 81 Node tests passed, the public build passed and `git diff --check` reported no whitespace errors. Additional Chrome checks covered three successive sticky topic changes at a stable 112px mobile heading height, all nine guided steps, the visible final checklist/editor, optional model reveal and final toolbox insertion followed by reload. Screenshots and browser runs are local verification only.


## German presentation — 14 November 2026

Local Chrome checks at 320/390/1440 px cover Turkish and English topic mentions, upright examples, translation language boundaries, page overflow, writing annotations, plain hint attributes, guided phrase insertion and German/translation sentence feedback. Captures in `.dev/german-convention/` were inspected for Turkish mobile and English desktop. The repeated study markup uses valid unquoted language/scope tokens and obsolete disclosure styles were removed to retain the existing 2 MB budget. No publication or live-domain verification.


## Interface-copy cleanup — 14 November 2026

All 30 approved audit decisions are applied. All 83 Node tests and the production build pass. Current scene/German suites passed again; dedicated native Chrome checks cover 320/390/1440 sidebar/counters/word-order/completion/timers, DTZ write/resume/result, blocked-audio retry, denied-storage warning/export/reset error and no-JavaScript fallbacks. The isolated browser contexts preserve the owner’s real storage. The 320px word-order capture was inspected; controls and the empty answer region are readable. Source dependencies on removed/sidebar prose were resolved explicitly. Full listening playback and live-domain behavior were not rechecked for this copy-only change. Nothing was committed or deployed.
