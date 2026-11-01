# Saved review comment follow-up

Updated: 1 November 2026. The owner requested application of every saved comment, approved the changes in chat and authorized a local commit. The original feedback stays in ignored `.dev/website-review.json`; this document records the resulting website behavior without altering those records.

| Saved request | Applied behavior |
| --- | --- |
| Collapsible phone navigation | Menu opens on phones; Escape, outside clicks and following a link close it. Navigation remains readable without JavaScript. |
| Remove free resources and “Kaydet, tekrar et” | Header link, homepage section, generated resource page and published downloads are removed. Original source files remain. |
| Remove unfinished B1 letter link | The exam column no longer includes it; the old homepage shortcut now links to the available DTZ simulation. |
| Remove final DTZ pre-start sentence | The specified sentence is absent from the introduction. |
| Remove language-dialog introduction | The old audience paragraph is removed; the dialog offers English. |
| English and visitor language | English browser settings select `/en/` initially; explicit English/Turkish choices are remembered when storage is available. A manual switch remains usable without storage. |
| Different content priorities by language | English has an independently authored homepage and lessons on appointments, articles and word order. Later owner instructions exclude an English app page. |
| Grammar/everyday links open pages | Those homepage links navigate directly to readable static pages. |
| Topic-appropriate practice | Turkish topic pages select relevant sentence tasks. English homepage and lessons use the same interactive builder with independently authored prompts and hints. |
| App information page and open-alpha link | `/uygulama/` introduces the app and links to the owner-provided Google Play listing. The popup is removed. |
| Desktop, phone and small-phone scope | Shared styles apply across widths; longer English sentence tasks use two tile columns on phones. |
| Edit/delete saved comments | Review notes have Edit and Delete controls; existing notes are preserved. |
| Comment only on main components | Review annotation candidates are sections, forms, articles, dialogs and other main containers. |
| Compact DTZ reading/speaking toolbar | Pinned state shows only the countdown or suggested duration and save/pause control. |
| Remove new-attempt link/button from results | DTZ results retain writing download without offering a new attempt. |
| Remove Needs changes button | Review actions are Approved and Save note; historical statuses remain readable. |

Browser verification during implementation covered English home/lesson layouts at 320, 390 and 1440 px, word selection/removal, incomplete/wrong/correct answers, hints, reset, coffee/tea continuation, Escape/focus return and readable no-JavaScript examples. The Turkish coffee/tea flow also passed. English homepage layout checks additionally covered 768 and 1024 px and actual audio playback. These were local checks, not live deployment checks.
