# Homepage design QA

final result: passed

## Reference and evidence

- Source visual truth: `docs/design/homepage-reference.png`, supplied directly by the owner.
- Source pixels: 1374 × 1145.
- Implementation screenshot: `.dev/desktop.png`, 1374 × 1145.
- CSS viewport: 1374 × 1145; device scale factor 1. No density scaling.
- Full-view comparison: `.dev/current-comparison-final.png`, source on the left, implementation on the right.
- Focused phrase-strip comparison: `.dev/phrase-comparison-final.png`.
- Additional browser evidence: `.dev/mobile.png`, `.dev/mobile-topic.png`, `.dev/tablet-final.png`, `.dev/resources.png` and `.dev/exercise-success.png`.
- State: initial Turkish homepage with closed dialogs. Interaction captures show their named states.

## Comparison history

The first comparison found two substantive differences: the heading wrapped onto three lines, pushing the lower sections down; the narrow phone phrase strip overflowed. The heading size was corrected to preserve the reference's two lines. The phone phrase/meaning/action now use separate rows. The second comparison aligned the hero boundary at y=589 and resource banner near y=949; the source banner starts near y=945.

Independent review identified a phrase/meaning overlap around 1024 px. The phrase panel now changes to two columns at 1250 px and a full-width phrase row at 1000 px. Post-fix browser checks verify both page width and the phrase content width at 320, 390, 700, 768, 1001, 1024, 1100, 1150, 1250, 1374 and 1440 px. No overlap or page overflow remains in those checks.

## Required fidelity surfaces

- Typography: local Newsreader display faces and Lato UI text. The main heading uses the supplied two-line composition. Turkish wording, punctuation and section headings match the reference. Font rasterisation has small differences from the generated mock.
- Layout rhythm: matching header, search-led split hero, overlapping phrase strip, three open topic columns and resource banner. The responsive layout keeps all controls available.
- Colours: dark forest headings, ivory background, sage panel and gold actions were checked against the source. Small photographic texture differences remain.
- Images: the actual approved logo is retained. Two standalone photos were reconstructed from the reference. Printed worksheet text stays in the background asset. Icons use licensed Phosphor files.
- Content: the supplied visible Turkish copy is preserved. Existing topic, resource and exercise details remain behind the visible controls. No finished exam package is advertised.

## Behaviour checked in Chrome

Recorded German audio loads and plays. The exercise opens, handles empty/wrong/correct answers, supports keyboard selection, returns words, shows hints and continues to the tea request. Topics open and close with Escape and return focus. Turkish search, keyboard result selection, empty results and recovery work. Resource downloads return real UTF-8 notes. Language and about controls open their dialogs. No browser runtime or console errors were recorded in the core interaction run.

The local preview excludes private/development routes, including encoded traversal attempts. The existing privacy page remains accessible. Unit tests cover the exercise/search rules and canonical public paths.

## Findings and follow-up

No actionable P0/P1/P2 issue remains in the checked layout and states.

P3: the mock's photographic texture, icon strokes and font rasterisation are not pixel-identical to browser output. The legal/contact footer sits below the supplied crop. These do not change the selected structure or wording.

This is local visual/interaction verification. Public hosting, domain configuration and native app behaviour are outside this pass.
