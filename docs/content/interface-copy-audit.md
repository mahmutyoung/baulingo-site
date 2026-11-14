# Interface-copy audit — 14 November 2026

Status: **all 30 decisions implemented locally after owner approval; not deployed**. This audit follows saved comment `ca8aee87-acef-4f4a-9fe2-7ac432ded34d`. The request was to identify sentences such as “Kelime seçme alıştırması JavaScript ile çalışır.” and list them for review. The audit originally left public copy unchanged. The owner subsequently approved implementation; original saved comments and approval states remain untouched.

The main issue is explanatory overhead around the learning, particularly repeated course bookkeeping, implementation details and disclaimers. There is also an outdated download promise. Most main German examples and Turkish/English teaching explanations serve a clear learning purpose.

## Scope and method

- Inventoried all **42 non-legal HTML pages** in the current local public build, including the homepages, topic pages, vocabulary page, 25 writing destinations, DTZ simulation, exam overview, app information and 404. Privacy and Impressum were excluded from editorial-removal recommendations. Development review tools were excluded.
- Extracted **2,357 text-block occurrences / 1,103 distinct text-and-state units** from explanatory paragraphs, headings, labels, buttons and similar interface elements. These are text blocks, not a sentence count, and include learning text and navigation. The extraction does not count every dictionary table cell or every German exam passage as an editorial candidate.
- Preserved source-declared language, hidden, dialog, disclosure and no-JavaScript context. A hidden source element can be revealed by JavaScript; a static occurrence count is not a measurement of how often learners see it. Responsive visibility was not re-audited in a browser during this editorial check.
- Reviewed the longer paragraph inventory beyond keyword matches, then inspected static generators and browser controllers for runtime messages. An additional extraction recorded **51 candidate dynamic-string snippets**; nested template messages and their display conditions were inspected in source. This is not a claim that there are only 51 runtime strings.
- Checked each finding against its authored source, with current source line references below. Shared templates were counted as a single editorial decision, rather than reporting the same sentence as many independent findings.
- Full local inventory and source-extraction evidence are in ignored `.dev/copy-audit/inventory.json`, `inventory.txt`, `dynamic-strings.json` and `findings.json`. Every candidate, source location, reason and proposal was also printed in the terminal.

This is a source-backed editorial audit of the local website. It is not a live-domain check, a learning-outcome study, a legal review or a review of the correctness of the German curriculum. No unrelated test suites or deployments were needed for this documentation-only work.

## Decision rule

Keep text when it teaches German, gives a necessary next action, helps make a real choice, explains a consequential restriction, or helps recover from an error. Remove descriptions of implementation, visible layout, publication workflow and duplicated reassurance. Shorten useful technical messages into a consequence and an action. Consolidate information that is useful once but noisy when repeated.

A sentence does not need to contain German to be useful. “Yanıtların kaydedilemedi; çıkmadan önce indir” is valuable interface guidance. Conversely, merely saying the exercise uses JavaScript does not help someone perform it.

## Recommendation queue

**30 editorial decisions: 16 removals, 12 shorter rewrites, 2 consolidations.** Some entries identify a clause within a longer paragraph. Preserve the useful remainder and adjust connecting punctuation when implementing. Proposals may overlap within a shared paragraph; apply the decisions together rather than deleting the paragraph wholesale.

Start with R01/R02/R03/R06: the technical café note, stale download promise, taxonomy explanation and repeated completion disclaimer. R06 is generated on **24 lesson/reference pages**. The repeated sidebar tagline is generated on **25 writing destinations**. C01 is generated on **17 pages**; its guidance is pedagogically useful and should be consolidated rather than discarded. These are generated-page counts, not observed impressions.

## Remove

### R01 — Kelime seçme alıştırması JavaScript ile çalışır.

Original audit source: [scripts/pages.mjs:39](../../scripts/pages.mjs). Context: document.

Why: Explains the implementation rather than teaching or directing the learner.

Recommendation: Delete the sentence; retain the phrase, audio and Cümleyi kur action.

### R02 — Konuları bağlantılardan okuyabilir, çalışma notlarını indirebilirsin.

Original audit source: [index.html:67](../../index.html). Context: no-JavaScript only.

Why: Outdated: the website no longer publishes the resource downloads promised here.

Recommendation: Delete the download claim. Keep a simple route to readable topic pages.

### R03 — Düzeyler, örnekleriyle birlikte içerik seçimini kolaylaştıran öğretim etiketleridir.

Original audit source: [scripts/study-page.mjs:34](../../scripts/study-page.mjs). Context: document.

Why: Internal explanation of the content taxonomy; no useful next action.

Recommendation: Delete the note.

### R04 — her yapının altında tam örnek cümleler bulunur.

Original audit source: [scripts/study-page.mjs:34](../../scripts/study-page.mjs). Context: document.

Why: Describes the visible page structure. The examples already demonstrate it.

Recommendation: Remove this clause; retain the actual distinction between expressions and sentence patterns.

### R05 — Aşağıdaki iki özet de seçimden önce okunabilir.

Original audit source: [scripts/writing-page.mjs:39](../../scripts/writing-page.mjs). Context: writing simulations / selected stage.

Why: Narrates visible layout rather than helping choose.

Recommendation: Delete this sentence; keep Her maddesine bir şey yazabileceğin görevi seç.

### R06 — Bu işareti sen koyarsın; otomatik puan değildir. Yardımcı kaynaklar ders ilerlemesine katılmaz.

Original audit source: [scripts/writing-page.mjs:45](../../scripts/writing-page.mjs). Context: enhanced lesson completion.

Why: Repeated explanation of progress bookkeeping. The completion control itself is explicit.

Recommendation: Remove the caption from individual lesson/reference endings; keep any necessary progress explanation once.

### R07 — Açıklamaları aşağıda okuyabilirsin.

Original audit source: [index.html:151](../../index.html). Context: no-JavaScript inside practice dialog.

Why: The dialog does not contain the promised lesson explanations below this note.

Recommendation: Delete this direction; keep the actual static German example.

### R08 — Seçtiğin parçalar burada görünecek.

Original audit source: [scripts/writing-task-page.mjs:13](../../scripts/writing-task-page.mjs). Context: empty word-order exercise; also generated by src/writing/activities.js.

Why: Empty-area narration. The word bank and task instruction already explain what to do.

Recommendation: Remove the visual placeholder sentence; retain the answer region and accessible feedback.

### R09 — Hesap veya e-posta gerekmez. Tüm bölümler ücretsizdir.

Original audit source: [scripts/dtz-page.mjs:32](../../scripts/dtz-page.mjs). Context: document.

Why: Repeated reassurance far below the same free/no-membership message in the introduction.

Recommendation: Delete the bottom paragraph; retain the entry-point statement and reset action.

### R10 — Görevler, görseller ve ses Baulingo’nun özgün DTZ denemesinden alınmıştır. Sınav görevleri Almancadır; çevresindeki yönergeler Türkçedir.

Original audit source: [scripts/dtz-page.mjs:33](../../scripts/dtz-page.mjs). Context: document.

Why: Provenance/import history and a description of languages already visible.

Recommendation: Remove these two sentences; retain access to official exam information and one clear independent-practice statement.

### R11 — Diğer sınav hazırlık paketleri henüz planlama aşamasındadır.

Original audit source: [scripts/dtz-page.mjs:33](../../scripts/dtz-page.mjs). Context: document.

Why: Roadmap detail in an unrelated exam-information footer.

Recommendation: Delete here. Keep availability labels wherever an unfinished package is actually listed.

### R12 — Bu sırada günlük istek kurma, artikeller ve cümle sırası gibi temel konularla çalışabilirsin. Bu alıştırmalar resmî sınav soruları değildir.

Original audit source: [src/topics.js:54](../../src/topics.js). Context: static exam topic and topic dialog.

Why: Generic cross-promotion plus another disclaimer alongside existing destination links.

Recommendation: Remove this paragraph; retain useful destination links and the relevant exam-result limitation.

### R13 — Hazırlık içeriği, ilgili sınavın görevleri ve değerlendirme ölçütleri incelendikten sonra yayımlanacak.

Original audit source: [src/topics.js:53](../../src/topics.js). Context: static exam topic and topic dialog.

Why: Describes the publishing process and future work rather than available learning.

Recommendation: Delete this sentence; retain Goethe, telc ve DTZ aynı sınav değildir.

### R14 — Tüm kalıplar bağlantısını da kullanabilirsin.

Original audit source: [src/writing/letter-builder.js:145](../../src/writing/letter-builder.js). Context: phrase loading only.

Why: Repeated instruction pointing at a control already beside the loading message. A real load failure has its own recovery message.

Recommendation: Remove this sentence from the loading placeholder; retain a brief loading status and actionable error fallback.

### R15 — A2’den B1’e, kendi hızında.

Original audit source: [scripts/writing-page.mjs:20](../../scripts/writing-page.mjs). Context: document.

Why: A repeated sidebar tagline adds little beside lesson navigation and the current lesson.

Recommendation: Remove from the sidebar; retain level/context on the course landing page.

### R16 — Yalnızca bu tarayıcıda saklanır.

Original audit source: [scripts/dtz-page.mjs:28](../../scripts/dtz-page.mjs). Context: document.

Why: Repeats the storage-scope message inside every writing counter view.

Recommendation: Remove this suffix; retain the counter and one concise scope notice near saving.

## Shorten into useful guidance

### S01 — Baulingo tarafından hazırlanmış bağımsız bir denemedir; resmî DTZ sınavı değildir. Otomatik sonuç yalnızca dinleme ve okumayı kapsar. Yazma ve konuşma otomatik değerlendirilmez.

Original audit source: [scripts/dtz-page.mjs:20](../../scripts/dtz-page.mjs). Context: document.

Why: The result limitation matters, but three sentences interrupt entry.

Recommendation: Resmî sınav değildir. Yalnızca dinleme ve okuma puanlanır.

### S02 — Almanca sınavının akışına hazırlan. Tam dinleme kaydı, 45 soru, yazma ve konuşma görevleriyle sınav akışını dene.

Original audit source: [scripts/dtz-page.mjs:19](../../scripts/dtz-page.mjs). Context: document.

Why: Repeats sınav akışı twice beside the section overview.

Recommendation: Dinleme, okuma, yazma ve konuşmayla DTZ’ye hazırlan.

### S03 — Yanıtların ve yazın yalnızca bu tarayıcıda saklanır; bize gönderilmez. İstersen kayıtlarını silebilirsin. Dinleme sırasında sayfadan ayrılırsan döndüğünde kaydı baştan dinlersin.

Original audit source: [scripts/dtz-page.mjs:22](../../scripts/dtz-page.mjs). Context: document.

Why: Mixes repetitive privacy/storage narration with an important consequence of leaving listening.

Recommendation: Keep Dinleme sırasında ayrılırsan kayıt baştan başlar. Put Taslağın bu tarayıcıda saklanır. once near saving; leave full privacy details on the privacy page.

### S04 — Bu sonuç yalnızca bu denemenin dinleme ve okuma bölümlerine aittir; resmî DTZ sonucu veya genel Almanca seviye belgesi değildir. Yazma ve konuşma için öğretmen değerlendirmesi gerekir.

Original audit source: [scripts/dtz-page.mjs:30](../../scripts/dtz-page.mjs). Context: results only.

Why: Results need a scope statement, but the current wording is long.

Recommendation: Dinleme ve okuma sonucu; resmî seviye belgesi değildir. Yazma ve konuşmayı bir öğretmenle değerlendir.

### S05 — Bu cümleler otomatik puanlanmaz. Aşağıdaki örnekle karşılaştır.

Original audit source: [scripts/writing-task-page.mjs:30](../../scripts/writing-task-page.mjs). Context: free short-answer tasks.

Why: Lead with the learner’s task; explain scoring once at the course entry point.

Recommendation: Yanıtını örnekle karşılaştır.

### S06 — Önceki sürümde yazdığın metin korundu. İstersen bu alanı düzenleyebilirsin.

Original audit source: [scripts/writing-task-page.mjs:30](../../scripts/writing-task-page.mjs). Context: only when an earlier free response exists.

Why: Version history is implementation detail; preserving earlier work matters.

Recommendation: Önceki yanıtın korundu.

### S07 — Görevleri, seçenekleri ve örnek yanıtları okuyabilirsin. Alanlara yazdıkların JavaScript olmadan kaydedilmez veya kontrol edilmez; çalışmalarını kâğıtta da yapabilirsin.

Original audit source: [scripts/writing-page.mjs:20](../../scripts/writing-page.mjs). Context: no-JavaScript only.

Why: Describe the usable fallback and lack of saving without a technical mini-explanation.

Recommendation: Örnekleri okuyup çalışmalarını kâğıtta yapabilirsin. Buraya yazdıkların kaydedilmez.

### S08 — JavaScript kapalı: tüm görevleri ve cevap anahtarını aşağıda okuyabilirsin. Otomatik süre, kayıt ve puanlama çalışmaz. Dinleme için ses kontrolünü kullan.

Original audit source: [scripts/dtz-page.mjs:25](../../scripts/dtz-page.mjs). Context: no-JavaScript only.

Why: Keep meaningful fallback capabilities and limitations; remove engine terminology.

Recommendation: Görevleri ve cevapları okuyabilir, ses kaydını dinleyebilirsin. Bu görünümde süre tutulmaz; yanıtların kaydedilmez.

### S09 — Alıştırma için JavaScript'i aç. Bu cümlenin Almancası:

Original audit source: [index.html:151](../../index.html). Context: no-JavaScript inside practice dialog.

Why: The fallback already supplies the answer; focus on the German rather than setup instructions.

Recommendation: Keep Bu cümlenin Almancası: and its German example; remove the setup sentence.

### S10 — Kısa, belirli yanıtlı sorular otomatik kontrol edilir. Serbest cümleler ve mektuplar otomatik puanlanmaz; örnek ve kontrol listesiyle karşılaştırılır. Resmî DTZ sonucu verilmez.

Original audit source: [scripts/writing-page.mjs:24](../../scripts/writing-page.mjs). Context: document.

Why: Course-entry expectations are useful, but can be framed as what the learner does.

Recommendation: Kısa sorularda yanıtını kontrol edebilirsin; mektuplarını örnek ve kontrol listesiyle karşılaştırırsın.

### S11 — Varsayılan olarak kendi hızında çalışırsın. Süreli denemek istersen iki görevi okumadan önce 30 dakikayı başlat. Süre dolunca yazın korunur; devam edebilirsin.

Original audit source: [scripts/writing-page.mjs:39](../../scripts/writing-page.mjs). Context: writing simulations only.

Why: Varsayılan is configuration vocabulary. The optional clock and its effect are useful.

Recommendation: Süresiz çalışabilir veya 30 dakikalık denemeyi başlatabilirsin. Süre dolunca yazın korunur; devam edebilirsin.

### S12 — Önceki genel kontrol listesindeki … işaret korundu. Aşağıdaki yeni, göreve özel maddeler ayrıca kontrol edilir.

Original audit source: [src/writing/player.js:117](../../src/writing/player.js). Context: legacy checklist recovery only.

Why: Exposes migration mechanics; only preservation and the next check matter.

Recommendation: Önceki kontrol işaretlerin korundu. Bu görevin listesini yeniden gözden geçir.

## Keep once, where it helps

### C01 — Uzunluktan önce istenen bilgileri karşılamaya odaklan.

Original audit source: [scripts/writing-task-page.mjs:30](../../scripts/writing-task-page.mjs). Context: document.

Why: This is real learning guidance, but repeating it under each letter counter creates noise.

Recommendation: Teach it once in the relevant planning lesson or brief contextual help; retain every word counter.

### C02 — İstediğin dersten başla. Kaydettiğin yarım çalışma varsa “Devam et” seni o çalışmaya götürür. Bir çalışmayı veya dersi bitirdiğinde kendin işaretlersin; bu işaret bir seviye puanı değildir.

Original audit source: [scripts/writing-page.mjs:24](../../scripts/writing-page.mjs). Context: document.

Why: Mixes entry guidance, resume behavior and another progress disclaimer.

Recommendation: Keep İstediğin dersten başla. Use a clear resume action for unfinished work. Explain completion behavior once, only if needed.

## Keep these messages and boundaries

| Text or category | Where | Why it stays |
| --- | --- | --- |
| “Kaydedildi.” and actual saving-failure messages | Writing editors | Learners need to know whether their work is saved. Show a warning when saving fails; explain the download escape route. |
| One concise browser-only storage statement | Near saving/export | There is no account or cross-device synchronisation. This affects whether work can be resumed elsewhere. Full privacy detail belongs on the privacy page. |
| Delete confirmations and failed-reset feedback | DTZ/course reset actions | Deletion changes learner data; the action needs a clear scope and consequence. |
| Listening replay warning when leaving/resuming | DTZ listening | The recording restarts. This changes how the learner should act. |
| Timer continues after leaving; deadline/section-change messages | DTZ timed sections | Otherwise learners may misunderstand a consequential exam behavior. |
| Audio loading, playback failure and retry instructions | Audio controls | These explain actual state and how to continue. |
| Phrase-library failure with a working reference link | Inline phrase help | A recovery route is useful; repeating that route during routine loading is unnecessary. |
| One concise practice/result limitation | Exam entry and result | The website must distinguish independent practice and partial scoring from an official exam result. It need not repeat the full disclaimer at every task. |
| Current availability labels beside unfinished content | Wherever unfinished material is listed | Preserve the boundary between implemented content and planned packages. Do not suggest unavailable preparation is ready. |
| “Örneği açmadan…”; answer explanations; required message points | Learning tasks | These guide learning and self-checking; they are not technical filler. |
| Level descriptions, expression/pattern distinction and advanced-filter definitions | Study page | These help learners choose suitable content. R03/R04 remove only taxonomy/layout narration. |
| Sentence-selection instructions, hints, empty-search guidance and accessible labels/status regions | Practice/search | These help first-time and keyboard/screen-reader users complete the activity. Do not remove their controls or accessibility behavior when trimming copy. |
| English lesson explanations and current homepage identity/copy | English pages and approved homepage | No comparable implementation-heavy explanatory paragraph was found in the English lesson prose. Preserve teaching and approved brand content. Only the flagged Turkish homepage fallback claims need trimming. |
| Privacy and Impressum content | Legal pages | Outside this editorial-removal audit; the technical content there has a separate purpose. |

## Implementation boundaries for a follow-up

- Edit source templates/modules, never `dist/`.
- Retain German examples, translations, answers, task IDs, user drafts, storage schemas and accessible interaction behavior.
- Preserve a concise useful fallback where JavaScript is unavailable; do not leave an unexplained non-working control or imply text will be saved.
- Update the newest local review entry when there is an actual UI/copy change. Preserve the original comment and its approval status.
- After copy implementation, run the existing tests and build, then inspect the affected default, fallback and error states. The build and publication budgets remain unchanged.

## Verification of this audit

Every finding's lookup phrase was checked against an existing source file and its line number computed from current source. The source links in this report were checked for local resolution. `git diff --check` was run. These checks describe the original audit. The implementation and verification record follows.


## Applied cleanup and verification

The owner approved implementation after the functional-dependency review. All 16 removals, 12 shorter rewrites and 2 consolidations are applied locally. Original source-line references above identify the audit baseline; current lines may differ.

- Removed the sidebar tagline together with its JavaScript reference, so missing paragraphs cannot insert literal null text.
- Retained the word-order answer/live region, keyboard controls and saved answer value. Removed the placeholder from both generator and runtime renderer.
- Retained both writing counters. Guided writing finds its counter paragraph through the word-count element rather than relying on the editor's next sibling.
- Kept length-vs-required-information advice once in the visible Dört maddeyi planla learning text. Kept concise browser-only draft scope once by course export and DTZ writing export; preserved actual saving errors separately.
- Kept original answers, German examples, task IDs, storage format and existing drafts. Approved homepage changes are confined to the flagged fallback text.

Verification: all 83 Node tests and the public build pass, including publication boundaries and size budgets. Existing Chrome suites cover 320/390/800/1440 px, all 24 writing destinations, all nine guided steps, final review, phrases, draft reload, focus, study filters/sticky headings, reduced motion and static content. Dedicated `.dev/check-copy-cleanup.mjs` checks blank/selected/undo word-order answers, word counters, completion persistence, optional writing timers, DTZ writing count/draft reload/result, blocked-audio recovery, denied-storage warning and in-memory export, failed reset and no-JavaScript homepage/writing/audio fallbacks. Checks use isolated browser contexts and do not modify the owner's real drafts. Screenshots are in ignored `.dev/copy-cleanup/`.

The final code review identified the missing course storage-scope notice; it was restored once beside export and included in the final browser checks. No other functional regression was found. No deployment, commit or live-domain verification was performed.
