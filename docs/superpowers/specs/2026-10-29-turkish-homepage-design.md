# Turkish-first Baulingo homepage

Historical design brief. The owner later supplied a different screenshot and requested its exact layout and wording. [The latest reference](../../design/homepage.md) supersedes the visual contract below. Keep this document as the record of the original implementation brief.

The owner selected the last Turkish concept on 29 October 2026 and asked us to build it. The selected visual is `exec-03984818-2a3f-43b8-ae25-fc05edf2154f.png`. It is a 1374 × 1145 reference, stored locally under the Codex generated images folder.

## Purpose and scope

Help Turkish speakers understand a useful German phrase and practise it immediately. Turkish is the first interface language. Keep German examples in German. Put Turkish explanations, everyday situations and A1–B1 needs at the centre. Exam packages remain planned. Downloads require no signup.

Build one responsive homepage in the existing public website repository. Preserve the current privacy document and its address. Keep app telemetry, native app code, accounts, paid services and public deployment outside this change.

## Approaches and selection

The owner saw three approaches: a conversation-led homepage, a topic-led library and a practice-led homepage. They selected the practice-led homepage: “Türkçe anla. Almanca kullan.” The sentence activity is the primary experience. Explanations and topic discovery support it.

## Visual contract

- Ivory `#FAF7F0`, forest `#193C34`, sage `#78866A`, gold `#E7C875`, charcoal `#252820`, white `#FFFFFF`.
- Newsreader bold/semibold headings and Lato body/UI, served locally with their licences. Retain the approved logo.
- Quiet navigation, centred introduction, then a wide two-column exercise/photo area. Stack the exercise and photo on phones.
- Three large word tiles, three answer positions, a gold check button and a hint action. Keep the photograph as the main visual.
- Two concise Turkish explanations, then an open topic row and search. Avoid extra marketing cards and invented statistics.
- Visible focus, controls at least 44 px, keyboard operation, text feedback and reduced motion support.

## Behaviour

The first task asks the learner to construct “Einen Kaffee, bitte.” Clicking a word adds it to the answer. Clicking a selected word returns it. Check empty, incomplete, wrong and correct answers with clear Turkish feedback. Hints suggest the next step. Reset allows another attempt. A second authored tea request provides a working continuation without claiming curriculum mastery.

Topic links open readable topic details. Search matches Turkish text with and without diacritics, supports keyboard selection and gives a useful empty state. A resources dialog offers actual original text study notes. Exam content is clearly marked as being prepared. Do not invent store links or finished exam courses.

## Implementation decisions

Keep the existing static HTML/CSS site and add browser JavaScript modules. No dependency installation or framework is needed for this bounded first page. This preserves the current GitHub Pages structure and remains suitable for a static Cloudflare deployment. The owner selected a real website in this repository, so a separate Product Design prototype starter would duplicate the deliverable.

Use pure exercise/search rules with focused Node tests. Keep DOM rendering separate. The public build must copy an explicit allowlist into `dist/`; it must exclude docs, tests, repository metadata and development tools. Provide a local preview command. No publication or DNS changes are part of this pass.

## Acceptance

The chosen layout is recognisable at the reference size. The core exercise, hint, correction, continuation, search, topics and downloads work. At 320–1440 px there is no horizontal overflow. The existing privacy page remains byte-for-byte unchanged. Browser checks cover keyboard controls, dialogs, console errors and desktop/mobile screenshots.
