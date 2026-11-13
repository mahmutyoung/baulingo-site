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

All 79 Node tests and the public build pass, including the existing 2 MB core / 10 MB DTZ-media budgets and publication boundaries. The before/after educational-content fingerprint matches: 24 destinations, 47 tasks, 64 phrases, teaching wording, examples and model answers. These checks verify implementation, not learning outcomes or usability with the target audience.

No remaining P0/P1/P2 findings. No push or deployment was performed.
