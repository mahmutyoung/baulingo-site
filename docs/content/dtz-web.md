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

## DTZ çalışma listeleri

Yerel çalışma sayfası ham istatistik tabloları yerine gözden geçirilmiş 69 kelime, 19 bağımsız ifade ve özgün bankadan 258 cümle sunar; kişi adı içeren iki cümle çıkarılmıştır. Kelime türü, konu ve sınav bölümü filtreleri tarayıcıda çalışır; JavaScript kapalıyken bütün listeler okunur. Kelime ve ifadelerin sınav bölümü, incelenen kaynaklarda ilgili biçimin görüldüğü bölümlerdir; örnek cümlelerde bankanın bölüm etiketidir. Kaynak analiz ve tablo bilgileri german-exam-obsidian Sentence Game Word Frequency, Chunk Frequency ve Universal Sentence Bank kayıtlarındadır. Bu derleme tüm DTZ kelime dağarcığını kapsadığını veya gelecekte hangi ifadenin çıkacağını iddia etmez.

## Expanded phrase list

The local study page now has 80 authored phrase entries across ten situations. Each has a Turkish meaning, a complete German example and a stable row ID. Existing topic/section filters apply to these entries; each row can receive an individual comment in development review. Phrase selection is editorial, not a frequency or exam-probability ranking.

## CEFR-first study lists

The study page now groups A1, A2 and B1 first, then situations, with word, phrase and sentence-frame tables within each situation. A1 adds 24 authored entries per content type. Existing A2/B1 sentence levels and frame families are retained from the original seed bank; word/phrase levels are editorial labels for the chosen examples. Current totals: 93 words, 104 phrases and 282 sentence/frame entries. The generator is `scripts/study-page.mjs`; the browser filter handles level, situation, content kind, word type and exam section. Existing word/phrase/sentence anchors remain usable.

Level design uses the [Council of Europe global scale](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale/) as guidance; individual item labels are teaching assignments, not official CEFR certification.

## Study list sizes

The level-first lists now offer cumulative Temel, Genişletilmiş and Full liste selections, independently of CEFR level. Each item has explicit `listTier` metadata. The initial selection rule uses the first two entries per level/situation/content type for Temel, the next three for Genişletilmiş, and remaining entries for Full. These are starting selections in current editorial order, not frequency-based rankings. Genişletilmiş includes Temel; Full includes all 479 current entries. The default/reset selection is Temel.

## Expansion from the frame tables

The current collection has 218 words, 180 reusable phrases and 1,387 sentence/frame examples. A1 has 60 entries per content type. The phrase bank incorporates all 120 entries from `docs/content/dtz-frames/phrase-frames.md`, plus the 60 authored A1 phrases. Word additions are editorial vocabulary entries with Turkish meanings and authored examples informed by the source situations; the 2,062 raw inflected word forms are not presented as a finished dictionary.

The sentence collection imports 1,299 of the 1,300 original ladder rows, preserving `sourceLadder`, `sourceFrame` and `sourceLevel`, and keeps 28 original seed examples not present verbatim in the ladder plus 60 A1 examples. A2.1/A2.2 map to A2; the bridge A2-B1 and B1.1/B1.2 rows map to B1. Frames identify a communicative family; its examples may rephrase the pattern. One source greeting’s surname was changed to Weber to preserve the existing website convention.

List sizes now use up to four entries per level/situation/content type for Temel and up to eight for Genişletilmiş. Sentence selection prioritises different frame families before close variants. Full liste includes all 1,785 current entries. The cumulative totals are 318 / 551 / 1,785. Generated markup shares group context and uses compact per-item metadata; JavaScript restores the filter attributes while all examples remain readable in static HTML. This keeps the existing 2 MB core publication limit.

## Expression and sentence-pattern distinction

Public terminology is now Kelimeler / İfadeler / Cümle kalıpları. Source arrays retain all full text and provenance. `entryKind` classifies complete fixed formulas and lexical combinations as expressions; variable sentence structures use stable `frameId` values that normalise placeholder naming. Sentence lists select structures and retain their examples together. The live counters count distinct structure keys separately from example sentences. Non-sentence greetings, closings and short ordering formulas are shown with expressions, not counted as sentence patterns. The remaining 1,387 source examples are preserved verbatim, alongside the complete examples associated with the original 180 phrase records. Old category anchors remain supported.

Sentence patterns use the same three-column table format as words and expressions: Cümle kalıbı / Türkçe anlamı / Örnek. Turkish template meanings are authored in `scripts/sentence-meanings.mjs`. Long text wraps inside its cell without truncation; on phones the three labelled cells stack. Filters hide the whole pattern row when none of its complete examples match. Compact filter metadata shares the pattern context while preserving individual record identifiers and every example.

Study filters now depend on earlier selections in this order: CEFR level, list size, situation, content type, word type and exam section. Each dropdown contains only choices with matching content in that context. Incompatible downstream selections clear; compatible selections remain. Word type is hidden for expressions and sentence patterns. Reset and level links use the same rules.

The owner’s saved review requested removal of “Der neue Drucker funktioniert nicht.” under “Mit {product} gibt es ein Problem.” The website record `sentence-081` (`LADDER-081-1`) is removed; this explicit omission accounts for the reduced source and list totals. The original source documents remain intact. `/sinavlar/` now groups the DTZ mock test and study lists; both pages link back to that overview.
