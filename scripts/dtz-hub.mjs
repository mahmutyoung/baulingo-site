import { dtzPageContent } from './dtz-page.mjs';
import { writingBook } from './writing-content.mjs';
import { escapeWriting as e, writingMarkdown } from './writing-format.mjs';

const origin = 'https://baulingo.app';
const routes = { de: '/de/dtz-pruefung/', en: '/en/dtz-exam/', tr: '/dtz-sinavi/' };
const test = routes.de + 'modelltest/';
const writing = routes.de + 'schreiben/';
const source = 'https://www.gast.de/de/forschung-entwicklung/entwicklung/auftraege/deutsch-test-fuer-zuwanderer-dtz/der-dtz-auf-einen-blick';
export const dtzHubRoutes = [...Object.values(routes), test, writing];

const guide = {
  de: {
    home: '/', skip: 'Zum Inhalt', title: 'DTZ-Prüfung A2–B1: Modelltest und Schreibkurs',
    description: 'Übe für den Deutsch-Test für Zuwanderer mit einem vollständigen Modelltest und einem kostenlosen Deutsch-Schreibkurs.',
    heading: 'DTZ-Prüfung A2–B1', intro: 'Bereite dich auf den Deutsch-Test für Zuwanderer vor. Übe alle vier Prüfungsteile im Modelltest oder trainiere gezielt, wie du klare Nachrichten und Briefe schreibst.',
    test: ['DTZ-Modelltest', '20 Höraufgaben mit Audio, 25 Leseaufgaben, zwei Schreibaufgaben zur Auswahl und drei Teile zum Sprechen.', 'Zum Modelltest'],
    writing: ['DTZ-Schreibkurs', '15 Kapitel und 47 Übungen. Lerne passende Anreden, plane vier Punkte und vergleiche eigene Texte mit Musterlösungen.', 'Zum Schreibkurs'],
    format: 'So ist der DTZ aufgebaut',
    parts: ['Höre kurze Aufnahmen und beantworte die Fragen.', 'Lies Alltagstexte und wähle die passende Antwort.', 'Wähle eine Aufgabe und schreibe zu vier vorgegebenen Punkten.', 'Stell dich vor, beschreibe ein Bild und plane gemeinsam etwas.'],
    scoring: 'Baulingo wertet Hören und Lesen automatisch aus. Beim Schreiben nutzt du Checklisten und Mustertexte. Sprechen übst du mit einer anderen Person.',
    official: 'Offizielle Informationen zum DTZ bei g.a.s.t.',
  },
  en: {
    home: '/en/', skip: 'Skip to content', title: 'DTZ Exam A2–B1: English Help, Mock Test and Writing Course',
    description: 'An English guide to using Baulingo’s free German DTZ mock test and complete writing course.',
    heading: 'DTZ exam guide in English', intro: 'The Deutsch-Test für Zuwanderer (DTZ) covers German at A2 and B1. Use this guide to work through the German mock test or practise writing a message step by step.',
    test: ['Full mock test in German', 'Select Modelltest starten, then Hörteil starten. The recording plays continuously. Finish listening and reading, choose writing task A or B, then practise speaking with a partner.', 'Open the German mock test'],
    writing: ['Complete writing course in German', 'Start with Person und Ton to choose the right tone. Next practise opening and closing a message, planning the four points and connecting sentences. Write first, use Selbstkontrolle to review, then open the model answer.', 'Open the German writing course'],
    format: 'What to do in each section',
    parts: ['Listen to the recording and answer as it plays. If you pause the test here, the recording starts again on return.', 'Read the texts and answer 25 questions. The 45-minute timer continues when you leave the tab.', 'Choose one of two tasks. Address all four points and include a greeting and sign-off. You have 30 minutes.', 'Introduce yourself, describe a picture and plan something together. Try it with a partner.'],
    scoring: 'Baulingo scores listening and reading automatically. For writing, compare your answer with a model. For speaking, review your response with a partner or teacher.',
    official: 'Official DTZ information from g.a.s.t. (German)',
  },
  tr: {
    home: '/', skip: 'İçeriğe geç', title: 'DTZ Sınavı A2–B1: Türkçe Açıklamalı Deneme ve Mektup Yazma',
    description: 'DTZ sınavına ücretsiz deneme ve Türkçe açıklamalı mektup yazma dersleriyle hazırlan.',
    heading: 'DTZ sınavına hazırlan', intro: 'Deutsch-Test für Zuwanderer (DTZ), A2 ve B1 düzeylerinde Almanca becerilerini ölçer. Türkçe yönergelerle dört bölümü dene veya mektup yazmaya odaklan.',
    test: ['DTZ deneme sınavı', 'Tam ses kaydıyla 20 dinleme ve 25 okuma sorusunu çöz. Ardından bir yazma görevi seç ve konuşma görevlerini bir çalışma arkadaşıyla yap.', 'Türkçe açıklamalı denemeye geç'],
    writing: ['DTZ mektup yazma kursu', 'Türkçe açıklamalarla uygun hitabı seç, dört maddeyi planla ve kendi mesajını yaz. Yanıtını kontrol listesi ve örnekle karşılaştır.', 'Türkçe açıklamalı kursa geç'],
    format: 'Dört sınav bölümü',
    parts: ['Kaydı dinlerken soruları yanıtla. Ara verirsen kayıt yeniden başlar.', 'Günlük hayattan metinleri oku ve 25 soruyu cevapla. Süre 45 dakikadır.', 'İki görevden birini seç. 30 dakika içinde dört maddeye yanıt veren bir mesaj yaz.', 'Kendini tanıt, bir resmi anlat ve bir çalışma arkadaşıyla plan yap.'],
    scoring: 'Baulingo’da dinleme ve okuma otomatik puanlanır. Yazını örnekle karşılaştır, konuşmanı bir çalışma arkadaşı veya öğretmenle değerlendir.',
    official: 'g.a.s.t. resmî DTZ bilgileri (Almanca)',
  },
};

function languages(current) {
  const names = { de: 'Deutsch', en: 'English help', tr: 'Türkçe yardım' };
  return `<p>${Object.entries(routes).map(([lang, route]) => lang === current
    ? `<strong lang="${lang}" aria-current="true">${names[lang]}</strong>`
    : `<a lang="${lang}" hreflang="${lang}" href="${route}"${lang === 'de' ? '' : ` data-language-choice="${lang}"`}>${names[lang]}</a>`).join(' · ')}</p>`;
}

function page(lang, route, title, description, body, options = {}) {
  const copy = guide[lang];
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)} · Baulingo</title><meta name="description" content="${e(description)}">
<link rel="canonical" href="${origin}${route}">
${options.alternates ?? ''}<meta name="theme-color" content="#FAF7F0">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<script type="module" src="/src/language.js"></script>
${options.css ? `<link rel="stylesheet" href="/${options.css}">` : ''}
${options.fragment ? '<script type="module" src="/src/dtz/german-resource.js"></script>' : ''}
</head><body><a class="skip" href="#main">${copy.skip}</a><div class="page">
<header class="header"><a class="brand" href="${copy.home}"><img src="/assets/logo.svg" alt="Baulingo" width="240" height="64"></a></header>
<main id="main" class="reading-page${options.mainClass ? ' ' + options.mainClass : ''}">${body}</main>
<footer class="footer"><p>Baulingo</p><div><a href="/impressum/" lang="de">Impressum</a><a href="/privacy/" lang="de">Datenschutz</a></div></footer>
</div></body></html>`;
}

function overview(lang) {
  const copy = guide[lang];
  const [mock, course] = lang === 'tr' ? ['/dtz-deneme-sinavi/', '/dtz-mektup-yazma/'] : [test, writing];
  const card = ([title, description, link], path) => `<article><h3>${e(title)}</h3><p>${e(description)}</p><a class="button button-primary" href="${path}">${e(link)} →</a></article>`;
  const skills = ['Hören', 'Lesen', 'Schreiben', 'Sprechen'];
  const alternates = Object.entries(routes).map(([code, path]) => `<link rel="alternate" hreflang="${code}" href="${origin}${path}">`).join('');
  const englishWritingHelp = lang === 'en' ? `<section id="writing-help" class="exam-section">
<h2>Writing help in English</h2><p>Read the situation before you write. Identify who will receive the message, then make a short note for each of the four points.</p>
<dl><dt><strong lang="de">Anrede</strong></dt><dd>The greeting. Use <span lang="de">Sehr geehrte Frau …</span> in a formal message and <span lang="de">Liebe …</span> for a friend.</dd>
<dt><strong lang="de">Schreibanlass</strong></dt><dd>The reason you are writing. Say it in your first sentence, then address the requested points.</dd>
<dt><strong lang="de">Grußformel</strong></dt><dd>The closing. <span lang="de">Mit freundlichen Grüßen</span> is a formal closing. Put your name on the next line.</dd></dl>
<p>For example, <span lang="de">„Könnten Sie mir bitte einen neuen Termin geben?“</span> means “Could you please give me a new appointment?” Give a specific day or time if the task asks for one.</p>
<p><a href="${writing}#03-vier-punkte-planen">Practise planning the four points</a></p></section>` : '';
  return page(lang, routes[lang], copy.title, copy.description, `${languages(lang)}<h1>${copy.heading}</h1><p>${copy.intro}</p>
<section class="exam-section" aria-label="DTZ"><div class="exam-materials">${card(copy.test, mock)}${card(copy.writing, course)}</div></section>
<section id="pruefungsteile" class="exam-section"><h2>${copy.format}</h2><dl>${skills.map((skill, i) => `<dt><strong lang="de">${skill}</strong></dt><dd>${copy.parts[i]}</dd>`).join('')}</dl><p>${copy.scoring}</p><p><a href="${source}">${copy.official}</a></p></section>${englishWritingHelp}`, { alternates });
}

const chapterNav = `<ol class="topic-index">${writingBook.chapters.map(chapter =>
  `<li><a href="#${chapter.slug}">${e(chapter.shortTitle)}</a></li>`).join('')}</ol>`;
const mockFallback = `<h1>DTZ-Modelltest A2–B1</h1><p>Ein vollständiger Modelltest mit 20 Höraufgaben, 25 Leseaufgaben, einer Schreibaufgabe und Sprechtraining. Hören und Lesen werden automatisch ausgewertet.</p>`;
const courseIntro = `<h1>DTZ-Schreibkurs A2–B1</h1><p>Arbeite mit 15 Kapiteln und 47 Übungen. Lerne von kurzen Sätzen bis zum vollständigen Brief. Schreibe zuerst selbst, prüfe deinen Text und vergleiche ihn dann mit der Musterlösung.</p>`;

export function dtzHubPages() {
  const pages = new Map(Object.keys(routes).map(lang => [routes[lang].slice(1) + 'index.html', overview(lang)]));
  const back = `<p><a href="${routes.de}">← DTZ-Prüfung</a></p>`;
  const mockHelp = `<p><a href="${routes.en}#pruefungsteile" lang="en" data-language-choice="en">English test instructions</a> · <a href="/dtz-deneme-sinavi/" lang="tr" data-language-choice="tr">Türkçe yönergeli deneme</a></p>`;
  const courseHelp = `<p><a href="${routes.en}#writing-help" lang="en" data-language-choice="en">English writing help</a> · <a href="/dtz-mektup-yazma/" lang="tr" data-language-choice="tr">Türkçe açıklamalı yazma kursu</a></p>`;
  pages.set(test.slice(1) + 'index.html', page('de', test, 'Kostenloser DTZ-Modelltest A2–B1',
    'Vollständiger Übungstest zum Deutsch-Test für Zuwanderer. Höre, lies, schreibe und übe das Sprechen.', `${back}${mockHelp}
<div data-dtz-fragment="modelltest">${mockFallback}</div>
<noscript><p>Für die Auswertung und die Uhr brauchst du JavaScript. <a href="/dtz-deneme-sinavi/">Aufgaben und Hördatei öffnen</a>.</p></noscript>`, {
      css: 'dtz.css', mainClass: 'dtz-main', fragment: true,
      alternates: `<link rel="alternate" hreflang="de" href="${origin}${test}"><link rel="alternate" hreflang="tr" href="${origin}/dtz-deneme-sinavi/">`,
    }));
  pages.set(writing.slice(1) + 'index.html', page('de', writing, 'DTZ Schreiben A2–B1: Vollständiger Briefkurs',
    '15 Kapitel mit 47 Schreibübungen, Satzbausteinen und Musterbriefen für den Deutsch-Test für Zuwanderer.', `${back}${courseHelp}${courseIntro}
<nav aria-label="Kapitel">${chapterNav}</nav><div class="writing-body" data-dtz-fragment="schreiben"></div>
<noscript><p>Aktiviere JavaScript, um die deutschen Kapitel und die Schreibfelder zu öffnen. <a href="/dtz-mektup-yazma/">Deutsche Aufgaben und Mustertexte mit türkischer Erklärung lesen</a>.</p></noscript>`, {css: 'writing.css', fragment:true}));
  return pages;
}

function bookText(markdown) {
  // The course supplies its own chapter navigation. Render only the source's supported markup.
  return writingMarkdown(markdown.replace(/^.*\[\[[^\n]*\]\].*\n?/gm, '').replace(/^> \[!\w+\] (.*)$/gm, '> **$1**'))
    .replace(/<\/?h4>/g, heading => heading.replace('4', '3'))
    .replace(/<li>\[ \] (.*?)<\/li>/g, '<li><label><input type="checkbox"> $1</label></li>');
}

export function dtzGermanWritingContent() {
  return writingBook.chapters.map((chapter, index) => {
    const markdown = chapter.markdown.replace(/^# .*\n/, '').replace(/## Inhalt\n[\s\S]*?(?=## Dein Ziel)/, '');
    let task = 0;
    const blocks = markdown.split(/<details>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/g);
    const parts = [bookText(blocks[0])];
    for (let i = 1; i < blocks.length; i += 3) {
      task++;
      const id = `c${index}-t${task}`;
      const responseLabel = index === 12 ? `Dein Text für Aufgabe ${task % 2 ? 'A' : 'B'}` : `Deine Antwort · Übung ${task}`;
      parts.push(`<label class="dtz-writing-label" for="german-${id}">${responseLabel}</label>
<textarea id="german-${id}" data-writing-response="${id}" rows="5" maxlength="20000"></textarea>
<details class="writing-answer"><summary>${e(blocks[i])}</summary>${bookText(blocks[i + 1])}</details>${bookText(blocks[i + 2])}`);
    }
    const following = writingBook.chapters[index + 1];
    const next = following ? `<p><a href="#${following.slug}">Weiter: ${e(following.shortTitle)} →</a></p>` : '';
    const timer = index === 12 ? '<p><button class="button button-primary" type="button" data-writing-clock>30-Minuten-Uhr starten</button> <output aria-label="Verbleibende Zeit" data-writing-time role="timer">30:00</output></p>' : '';
    return `<section class="exam-section" id="${chapter.slug}" data-chapter="${chapter.slug}" tabindex="-1"><h2>${e(chapter.title)}</h2>${timer}${parts.join('')}${next}</section>`;
  }).join('');
}

export const dtzGermanArchives = [
  ['src/dtz/modelltest-de.gz', () => dtzPageContent('de')],
  ['src/dtz/schreiben-de.gz', dtzGermanWritingContent],
];
