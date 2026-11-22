import { grammarPath, grammarLesson, lessonPath, lessonPaths, levelPath } from '../src/mini-packs/routes.js';
import { escapeLearningText as e } from '../src/learning-text.js';

export const englishLevelPaths = ['A1', 'A2', 'B1'].map(level => levelPath(level, 'en'));
const languageScript = '<script type=module src="/src/language.js"></script>';

function webPage(language, route, title, description, stylesheet, body, script = '') {
  return `<!doctype html><html lang="${language}"><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${e(title)} · Baulingo</title><meta name=description content="${e(description)}"><link rel="canonical" href="https://baulingo.app${route}"><link rel=stylesheet href="/${stylesheet}">${script}</head>${body}`;
}

const englishDescriptions = {
  A1: 'Introduce yourself, order at a café, tell the time and ask for directions in everyday German.',
  A2: 'Practise rearranging appointments, sorting out shopping problems and making plans in German.',
  B1: 'Describe experiences, explain your choices and respond to real-life situations in German.',
};

function englishLevelPage(level, library) {
  const route = levelPath(level, 'en');
  const records = library.filter(({ pack }) => pack.cefr === level);
  const first = records[0].pack;
  const example = first.exercises.find(exercise => exercise.options.length);
  const links = Object.keys(englishDescriptions).map(code => code === level ? `<strong aria-current="page">${code}</strong>` : `<a href="${levelPath(code, 'en')}">${code}</a>`).join(' · ');
  const heading = `German ${level} Course`;
  const body = `<main class="reading-page"><p><a href="/en/#lessons">← English Topics</a></p><nav aria-label="Course level">${links}</nav>
<h1>${heading}</h1><p>${englishDescriptions[level]}</p><p>${records.length} free lessons with English explanations. <a href="${grammarPath('en')}#${level.toLowerCase()}">Study ${level} grammar</a>.</p>
<p><a class="button button-primary" href="${lessonPath(first.id, 'en')}">Start the first lesson →</a></p>
<section class="exam-section"><h2>Sample exercise</h2><p>${e(example.prompt)}</p><ul lang="de">${example.options.map(option => `<li>${e(option)}</li>`).join('')}</ul><details><summary>See the answer</summary><p lang="de"><strong>${e(example.answers[0])}</strong></p><p>${e(example.explanation)}</p></details></section>
<h2>${level} lessons</h2><ol class="topic-index">${records.map(({ pack, title = pack.title }) => `<li><a href="${lessonPath(pack.id, 'en')}">${e(title)}</a></li>`).join('')}</ol></main>`;
  return [route.slice(1) + 'index.html', webPage('en', route, heading + ' – ' + records.length + ' Free Lessons', englishDescriptions[level], 'style.css', body, languageScript)];
}

function grammarHome(language, library) {
  const turkish = language === 'tr';
  const route = grammarPath(language);
  const other = turkish ? 'en' : 'tr';
  const title = turkish ? 'Almanca Gramer Kursu A1–B1' : 'German Grammar Course A1–B1';
  const intro = turkish
    ? 'Artikeller, fiil çekimleri, edatlar ve cümle yapısını Türkçe açıklamalarla öğren. 53 dersin her birinde Almanca örnekler ve alıştırmalar var.'
    : 'Learn German grammar through 53 free lessons with examples and exercises. Work from articles and verb conjugation to German word order, cases and subordinate clauses.';
  const groups = ['A1', 'A2', 'B1'].map(level => {
    const items = library.filter(({ pack }) => pack.cefr === level);
    return `<section class="exam-section" id="${level.toLowerCase()}"><h2>${level} ${turkish ? 'gramer dersleri' : 'grammar lessons'}</h2>
<p><a href="${levelPath(level, language)}">${turkish ? 'Almanca ' + level + ' Kursu' : 'German ' + level + ' Course'}</a></p>
<ol class="topic-index">${items.map(({ pack, title }) => `<li><a href="${lessonPath(pack.id, language)}">${e(title)}</a></li>`).join('')}</ol></section>`;
  }).join('');
  return [route.slice(1) + 'index.html', webPage(language, route, title, intro, 'style.css', `<main class="reading-page">
<a class=language href="${grammarPath(other)}" lang=${other} hreflang=${other} data-language-choice=${other} data-match-language>${turkish ? 'English' : 'Türkçe'}</a>
<h1>${title}</h1><p>${intro}</p><nav aria-label="${turkish ? 'Kurs düzeyi' : 'Course level'}"><a href="#a1">A1</a> · <a href="#a2">A2</a> · <a href="#b1">B1</a></nav>${groups}</main>`,
    languageScript + ['en','tr'].map(lang => `<link rel=alternate hreflang=${lang} href="https://baulingo.app${grammarPath(lang)}">`).join(''))];
}

export function lessonPages(libraries, grammar) {
  const pages = new Map();
  for (const [language, library] of Object.entries(libraries)) {
    const german = language === 'tr' ? 'Almanca' : 'German';
    for (const { pack, related } of [...library, ...grammar[language]]) {
      const route = lessonPath(pack.id, language);
      if (!route || pages.has(route.slice(1) + 'index.html')) throw Error('Invalid lesson route: ' + pack.id);
      const isGrammar = grammarLesson(pack.id);
      const example = isGrammar ? pack.grammar.example : pack.vocabulary[0].example;
      const back = isGrammar ? grammarPath(language) + '#' + pack.cefr.toLowerCase() : '../';
      const relatedLink = isGrammar ? `<p><a href="${lessonPath(related[0].id, language)}">${e(related[0].title)}</a>` : '';
      const info = isGrammar ? pack.grammar.explanation : pack.objective;
      const body = `<main id=main-content class=lesson-preview><a href="${back}">← ${german} ${pack.cefr}</a>
<h1 id=lesson-title>${e(pack.title)}</h1><p>${e(info)}<p lang=de>${e(example.de)}<p>${e(example[language])}${relatedLink}</main>`;
      pages.set(route.slice(1) + 'index.html', webPage(language, route, `${pack.title} · ${german} ${pack.cefr}`, pack.objective,
        'src/mini-packs/style.css', body, '<script type=module src="/src/mini-packs/player.js"></script>'));
    }
  }
  if (pages.size !== lessonPaths.length) throw Error('Lesson routes do not match the libraries');
  for (const level of Object.keys(englishDescriptions)) pages.set(...englishLevelPage(level, libraries.en));
  for (const language of Object.keys(grammar)) pages.set(...grammarHome(language, grammar[language]));
  return pages;
}
