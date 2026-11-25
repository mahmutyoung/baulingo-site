import { englishExercises } from '../src/english-exercises.js';
import { escapeLearningText as escape } from '../src/learning-text.js';

export const englishHome = {
  path: '/en/',
  title: 'Learn German for Beginners: Grammar & Everyday Phrases',
  heading: ['Learn German.', 'Use it every day.'],
  description: 'Learn German with clear English explanations, everyday phrases and short practice tasks. Start with articles, word order or making an appointment.',
};
const homeAlternates = '<link rel="alternate" hreflang="en" href="https://baulingo.app/en/"><link rel="alternate" hreflang="tr" href="https://baulingo.app/">';

const lessons = [
  {
    slug: 'word-order', title: 'Where does the verb go?', summary: 'Build a clear German statement, even when you begin with a time or place.',
    content: `<p>In a German main statement, the finite verb normally occupies the second position. A position can contain several words, so count chunks of meaning rather than individual words.</p><ul class="topic-examples"><li><span lang="de" class="german-example">Ich arbeite heute.</span><span class="example-translation">I am working today.</span></li><li><span lang="de" class="german-example">Heute arbeite ich.</span><span class="example-translation">Today I am working.</span></li><li><span lang="de" class="german-example">Am Montag arbeite ich zu Hause.</span><span class="example-translation">On Monday I work at home.</span></li></ul><p>When a time phrase comes first, the subject follows the verb. English usually keeps the subject before the verb in a statement; German changes that order.</p><details><summary>Try it: put these chunks in order</summary><p lang="de">Heute / ich / lerne Deutsch.</p><p>One answer: <i lang="de">Heute lerne ich Deutsch.</i> The verb <i lang="de">lerne</i> is in the second position.</p></details>`
  },
  {
    slug: 'articles', title: 'Nouns and their articles', summary: 'Learn the article with the noun and notice how it can change in a sentence.',
    content: `<p>German nouns have a grammatical gender. The definite article is <i lang="de">der</i>, <i lang="de">die</i> or <i lang="de">das</i>; English uses “the” for all three. Gender is a property of the word, so learn each noun with its article.</p><ul class="topic-examples"><li><strong lang="de" class="german-example german-target">der Tisch</strong><span class="example-translation">the table</span></li><li><strong lang="de" class="german-example german-target">die Lampe</strong><span class="example-translation">the lamp</span></li><li><strong lang="de" class="german-example german-target">das Fenster</strong><span class="example-translation">the window</span></li></ul><p>Articles can also change with a noun’s role. For example, <i lang="de">der Tisch</i> becomes <i lang="de">den Tisch</i> as the direct object in <i lang="de">Ich sehe den Tisch.</i></p><details><summary>Try it: which word goes with Fenster?</summary><p>Answer: <i lang="de">das Fenster</i>. Practise the whole pair aloud.</p></details>`
  },
  {
    slug: 'appointments', title: 'Make an appointment', summary: 'Ask for a time and say when you are available.',
    content: `<p>A useful opening is <i lang="de">Ich möchte einen Termin vereinbaren.</i> It means “I’d like to make an appointment.” You can use it on the phone or in person.</p><ul class="topic-examples"><li><span lang="de" class="german-example">Haben Sie am Dienstag einen Termin frei?</span><span class="example-translation">Do you have an appointment available on Tuesday?</span></li><li><span lang="de" class="german-example">Am Vormittag habe ich Zeit.</span><span class="example-translation">I’m available in the morning.</span></li><li><span lang="de" class="german-example">Kann ich den Termin verschieben?</span><span class="example-translation">Can I reschedule the appointment?</span></li></ul><p>Use <i lang="de">Sie</i> for a polite conversation with someone you do not know. If you miss a detail, ask <i lang="de">Können Sie das bitte wiederholen?</i> (“Could you repeat that, please?”).</p><details><summary>Try it: ask to make an appointment</summary><p lang="de">Ich möchte einen Termin vereinbaren.</p></details>`
  }
];

function practiceLink(id, label = 'Build the sentence') {
  return `<a class="button button-primary" href="#sentence-example" data-practice="${id}" aria-haspopup="dialog">${label}</a>`;
}

function practiceDialog() {
  return `<dialog class="content-dialog practice-dialog" id="practice-dialog" aria-labelledby="exercise-title">
<div class="dialog-top"><span class="dialog-brand">Sentence practice</span><button class="close-button" type="button" data-close>Close</button></div>
<section class="exercise-workspace" aria-labelledby="exercise-title"><div class="exercise">
<h2 id="exercise-title" tabindex="-1">Build a sentence</h2><p class="translation" id="translation"></p><p class="question">How would you say it in German?</p>
<p class="visually-hidden" id="exercise-instructions">Choose the words in order. Select a word in your answer to return it.</p>
<ol class="answer-slots" id="answer-slots" aria-label="Your sentence" aria-describedby="exercise-instructions"></ol>
<div class="word-bank" id="word-bank" role="group" aria-label="Available words" lang="de"></div>
<div class="exercise-actions"><button class="button button-primary" id="check-answer" type="button">Check sentence</button><button class="text-button hint-button" id="hint-toggle" type="button" aria-expanded="false" aria-controls="hint">Show hint</button></div>
<p class="hint" id="hint" hidden></p><div class="exercise-response"><p class="feedback" id="feedback" role="status" aria-live="polite" aria-atomic="true"></p><button class="text-button reset-button" id="reset-exercise" type="button" hidden>Start again</button></div>
</div></section></dialog>`;
}

function page(title, description, path, { alternateLinks = '', canonicalPath = path, index = true }, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Baulingo</title><meta name="description" content="${description}"><link rel="canonical" href="https://baulingo.app${canonicalPath}">${index ? '' : '<meta name="robots" content="noindex">'}
${alternateLinks}
<meta name="theme-color" content="#FAF7F0"><meta property="og:type" content="website"><meta property="og:site_name" content="Baulingo"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="https://baulingo.app${path}"><meta property="og:locale" content="en_GB"><meta property="og:image" content="https://baulingo.app/assets/cafe-hero.webp"><meta property="og:image:alt" content="A café counter, a place to practise ordering in German"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><script type="module" src="/src/analytics.js"></script><script type="module" src="/src/navigation.js"></script><script type="module" src="/src/english-practice.js"></script></head><body><a class="skip" href="#main">Skip to content</a><div class="page"><header class="header"><a class="brand" href="/en/" aria-label="Baulingo home"><img src="/assets/logo.svg" alt="Baulingo" width="240" height="64"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" hidden>Menu <span aria-hidden="true">☰</span></button><nav id="main-navigation" class="navigation" aria-label="Main menu"><a href="/en/#lessons">Lessons</a><a href="/en/#everyday">Everyday German</a></nav>${path === '/en/' ? '<button class="language" type="button" data-language-open aria-haspopup="dialog">English <img src="/assets/icons/caret-down.svg" width="16" height="16" alt=""></button>' : ''}</header><main id="main" class="${path === "/en/" ? "english-home" : "reading-page"}">${body}</main><footer class="footer"><p>Baulingo</p><div><a href="/en/">Home</a><a href="mailto:mahmutyoung@gmail.com">Contact</a><a href="/impressum/" lang="de">Impressum</a><a href="/privacy/" lang="de">Datenschutz</a></div></footer></div>${practiceDialog()}${path === '/en/' ? `<dialog class="content-dialog" id="language-dialog" aria-labelledby="language-title">
<div class="dialog-top"><span class="dialog-brand">Baulingo</span><button class="close-button" type="button" data-close>Close</button></div>
<h2 id="language-title">Language / İçerik dili</h2>
<p><a href="/?lang=tr" lang="tr" data-language-choice="tr">Türkçe</a></p><p>English</p>
</dialog>` : ''}</body></html>`;
}

export function englishPages({ alternateLinks = homeAlternates, canonicalPath = englishHome.path, index = true } = {}) {
  const pages = new Map();
  pages.set(englishHome.path.slice(1) + 'index.html', page(escape(englishHome.title), englishHome.description, englishHome.path, { alternateLinks, canonicalPath, index }, `
<section class="hero en-hero" aria-labelledby="intro">
  <div class="hero-copy"><h1 id="intro">${englishHome.heading.map(escape).join('<br>')}</h1><p class="hero-description">Make sense of German grammar.<br>Find the words for real conversations.</p><p class="en-intro">Short, free lessons for English speakers, with examples you can use straight away.</p><a class="button button-primary" href="#lessons">Find your first lesson</a><div class="quick-topics"><a href="/en/articles/"><span lang="de">Der, die, das</span></a><a href="/en/word-order/">German word order</a></div></div>
  <div class="hero-visual"><img class="hero-photo" src="/assets/cafe-hero.webp" srcset="/assets/cafe-hero-480.webp 480w, /assets/cafe-hero-800.webp 800w, /assets/cafe-hero.webp 1594w" sizes="(max-width:700px) 100vw, 54vw" width="1594" height="987" alt="A café counter with a server holding a cup of coffee" fetchpriority="high"><div class="en-phrase"><p>Start with a small conversation.</p><strong lang="de">Einen Kaffee, bitte.</strong><p>A coffee, please.</p><audio controls preload="none" src="/assets/audio/einen-kaffee-bitte.mp3" aria-label="Listen to Einen Kaffee, bitte"></audio><p class="en-phrase-action">${practiceLink('en-coffee')}</p></div></div>
</section>
<section class="needs en-lessons" id="lessons" aria-labelledby="lessons-title"><h2 id="lessons-title">What would you like to work on?</h2><p class="needs-description">Choose a question. Read an explanation. Try it yourself.</p><div class="path-grid">
<article class="learning-path"><div class="path-icon"><img src="/assets/icons/book-open.svg" width="34" height="34" alt=""></div><div class="path-content"><h3>German noun genders</h3><p>English has “the”. German has <i lang="de">der</i>, <i lang="de">die</i> and <i lang="de">das</i>. Learn nouns with their articles.</p><ul class="path-links"><li><a href="/en/german-grammar/">German Grammar Course →</a></li><li><a href="/en/articles/">Understand <span lang="de">der, die, das</span> →</a></li></ul></div></article>
<article class="learning-path"><div class="path-icon"><img src="/assets/icons/file-text.svg" width="34" height="34" alt=""></div><div class="path-content"><h3>German sentence order</h3><p>Where does the verb go? See what happens when you begin with “today”.</p><ul class="path-links"><li><a href="/en/word-order/">Practise German word order →</a></li></ul></div></article>
<article class="learning-path" id="everyday"><div class="path-icon"><img src="/assets/icons/chat-circle.svg" width="34" height="34" alt=""></div><div class="path-content"><h3>Everyday conversations</h3><p>Ask for an appointment, explain when you’re free and ask someone to repeat.</p><ul class="path-links"><li><a href="/en/appointments/">Make an appointment in German →</a></li><li><a href="/en/mini-packs/">Explore 67 A1–B1 mini-packs →</a></li><li><a href="/en/german-a1/">A1 course</a> · <a href="/en/german-a2/">A2 course</a> · <a href="/en/german-b1/">B1 course</a></li><li><a href="/en/dtz-exam/">DTZ exam help →</a></li></ul></div></article>
</div></section>
<section class="en-practice" aria-labelledby="practice-title"><div><h2 id="practice-title">Build your first German sentence</h2><p>English usually keeps the subject before the verb. In a German statement, a time expression can come first, followed by the verb.</p></div><div><p>Say “Today I’m learning German.”</p>${practiceLink('en-word-order', 'Build the sentence')}<noscript><p id="sentence-example">Example: <span lang="de" class="german-example">Heute lerne ich Deutsch.</span></p><p>Café request: <span lang="de" class="german-example">Einen Kaffee, bitte.</span></p></noscript></div></section>
<section class="en-questions" aria-labelledby="questions-title"><h2 id="questions-title">Getting started with German</h2><details><summary>Where should I start as a beginner?</summary><p>Pick a situation you need, such as making an appointment, and learn a complete phrase. Then look at how it works: the noun’s article, the verb and the word order. Start with our <a href="/en/appointments/">German appointment phrases</a>.</p></details><details><summary>How can I remember der, die and das?</summary><p>Learn each noun together with its article: <i lang="de">der Tisch</i>, <i lang="de">die Lampe</i>, <i lang="de">das Fenster</i>. Say the pair aloud and use it in a short sentence. Our <a href="/en/articles/">guide to German articles</a> shows the basics.</p></details><details><summary>Are the lessons free?</summary><p>Yes. You can read every English lesson and try the short practice tasks without an account.</p></details></section>`));
  for (const resource of englishResources()) pages.set(resource.path.slice(1) + 'index.html', resource.render(resource));
  return pages;
}

/** @returns {import('../src/publishing/resources.ts').ResourceDefinition[]} */
export function englishResources() {
  return lessons.map(lesson => {
    const key = `en-${lesson.slug}`;
    const body = `<p><a href="/en/">← All English lessons</a></p><article><h1>${lesson.title}</h1><p class="dialog-subtitle">${lesson.summary}</p>${lesson.content.replace(/<details>[\s\S]*?<\/details>/g, '')}<p>${practiceLink(key)}</p><noscript><p id="sentence-example">Example: <span lang="de" class="german-example">${englishExercises[key].sentence}</span></p></noscript></article>`;
    return {
      key, format: 'topic', locale: 'en', path: `/en/${lesson.slug}/`,
      title: lesson.title + ' · Baulingo', heading: lesson.title, description: lesson.summary,
      render: (record, alternates) => page(record.title.slice(0, -' · Baulingo'.length),
        record.description, record.path, { alternateLinks: alternates, index: record.index }, body),
    };
  });
}
