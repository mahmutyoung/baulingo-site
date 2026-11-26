import { grammarPath, levelPath } from '../src/mini-packs/routes.js';
import { escapeLearningText as e } from '../src/learning-text.js';

const languageScript = '<script type=module src="/src/language.js"></script>';

function webPage(language, route, title, description, stylesheet, body, script = '', index = true, alternateLinks = '') {
  return `<!doctype html><html lang="${language}"><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${e(title)}</title><meta name=description content="${e(description)}"><link rel="canonical" href="https://baulingo.app${route}">${alternateLinks}${index ? '' : '<meta name="robots" content="noindex">'}<link rel=stylesheet href="/${stylesheet}">${script}</head>${body}`;
}

const englishDescriptions = {
  A1: 'Introduce yourself, order at a café, tell the time and ask for directions in everyday German.',
  A2: 'Practise rearranging appointments, sorting out shopping problems and making plans in German.',
  B1: 'Describe experiences, explain your choices and respond to real-life situations in German.',
};

export function englishCourseMetadata(level, count) {
  const heading = `German ${level} Course`;
  return { path: levelPath(level, 'en'), heading, title: `${heading} – ${count} Free Lessons · Baulingo`, description: englishDescriptions[level] };
}

export function renderEnglishCourse(level, records, { path, title, heading, description, index, lessonLink, levelLink }) {
  const first = records[0].pack;
  const example = first.exercises.find(exercise => exercise.options.length);
  const links = Object.keys(englishDescriptions).map(code => code === level ? `<strong aria-current="page">${code}</strong>` : `<a href="${levelLink(code)}">${code}</a>`).join(' · ');
  const body = `<main class="reading-page"><p><a href="/en/#lessons">← English Topics</a></p><nav aria-label="Course level">${links}</nav>
<h1>${e(heading)}</h1><p>${e(description)}</p><p>${records.length} free lessons with English explanations. <a href="${grammarPath('en')}#${level.toLowerCase()}">Study ${level} grammar</a>.</p>
<p><a class="button button-primary" href="${lessonLink(first.id)}">Start the first lesson →</a></p>
<section class="exam-section"><h2>Sample exercise</h2><p>${e(example.prompt)}</p><ul lang="de">${example.options.map(option => `<li>${e(option)}</li>`).join('')}</ul><details><summary>See the answer</summary><p lang="de"><strong>${e(example.answers[0])}</strong></p><p>${e(example.explanation)}</p></details></section>
<h2>${level} lessons</h2><ol class="topic-index">${records.map(({ pack, title = pack.title }) => `<li><a href="${lessonLink(pack.id)}">${e(title)}</a></li>`).join('')}</ol></main>`;
  return webPage('en', path, title, description, 'style.css', body, languageScript, index);
}

export function grammarIndexMetadata(language) {
  const turkish = language === 'tr';
  const heading = turkish ? 'Almanca Gramer Kursu A1–B1' : 'German Grammar Course A1–B1';
  const description = turkish
    ? 'Artikeller, fiil çekimleri, edatlar ve cümle yapısını Türkçe açıklamalarla öğren. 53 dersin her birinde Almanca örnekler ve alıştırmalar var.'
    : 'Learn German grammar through 53 free lessons with examples and exercises. Work from articles and verb conjugation to German word order, cases and subordinate clauses.';
  return { path: grammarPath(language), title: heading + ' · Baulingo', heading, description };
}

export function renderGrammarIndex(page, library, urlFor, alternates) {
  const language = page.locale;
  const turkish = language === 'tr';
  const other = alternates.find(({ locale }) => locale !== language);
  const groups = ['A1', 'A2', 'B1'].map(level => {
    const items = library.filter(({ pack }) => pack.cefr === level);
    return `<section class="exam-section" id="${level.toLowerCase()}"><h2>${level} ${turkish ? 'gramer dersleri' : 'grammar lessons'}</h2>
<p><a href="${levelPath(level, language)}">${turkish ? 'Almanca ' + level + ' Kursu' : 'German ' + level + ' Course'}</a></p>
<ol class="topic-index">${items.map(({ pack, title }) => `<li><a href="${urlFor(pack.id, language)}">${e(title)}</a></li>`).join('')}</ol></section>`;
  }).join('');
  return webPage(language, page.path, page.title, page.description, 'style.css', `<main class="reading-page">
${other ? `<a class=language href="${other.path}" lang=${other.locale} hreflang=${other.locale} data-language-choice=${other.locale} data-match-language>${turkish ? 'English' : 'Türkçe'}</a>` : ''}
<h1>${e(page.heading)}</h1><p>${e(page.description)}</p><nav aria-label="${turkish ? 'Kurs düzeyi' : 'Course level'}"><a href="#a1">A1</a> · <a href="#a2">A2</a> · <a href="#b1">B1</a></nav>${groups}</main>`,
    languageScript + alternates.map(({ locale, path }) => `<link rel=alternate hreflang=${locale} href="https://baulingo.app${path}">`).join(''), page.index);
}

/**
 * @param {{ locale: string, path: string, title: string, heading: string, description: string, index?: boolean }} page
 * @param {{ back: string, label: string, info: string, example: string, translation: string, grammar?: boolean, related?: { path: string, title: string } }} preview
 * @param {string} [alternateLinks]
 */
export function renderLessonPreview(page, { back, label, info, example, translation, grammar, related }, alternateLinks) {
  const relatedLink = related ? `<p><a href="${related.path}">${e(related.title)}</a>` : '';
  const body = `<main id=main-content class=lesson-preview${grammar ? ' data-grammar' : ''}><a href="${back}">← ${label}</a>
<h1 id=lesson-title>${e(page.heading)}</h1><p>${e(info)}<p lang=de>${e(example)}<p>${e(translation)}${relatedLink}</main>`;
  return webPage(page.locale, page.path, page.title, page.description,
    'src/mini-packs/style.css', body, '<script type=module src="/src/mini-packs/player.js"></script>', page.index, alternateLinks);
}
