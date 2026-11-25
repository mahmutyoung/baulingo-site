import type { APIRoute, GetStaticPaths } from 'astro';
import { englishPages } from '../../../scripts/english-pages.mjs';
import { renderEnglishCourse, renderGrammarIndex, renderLessonPreview } from '../../../scripts/lesson-pages.mjs';
import { renderA1Test, turkishCourseContent } from '../../../scripts/course-pages.mjs';
import { turkishPage } from '../../../scripts/pages.mjs';
import { escapeLearningText } from '../../learning-text.js';
import { a1TestPage, catalog, courseLessons, coursePages, grammarIndexLessons, grammarIndexPages, homeEn, lessonPages, lessonPreview } from '../../publishing/catalog.ts';
import { outputFile, siteOrigin } from '../../publishing/model.ts';
import type { PageRecord } from '../../publishing/model.ts';
import { resourcePages, resourceRenderers } from '../../publishing/resources.ts';

export const getStaticPaths = (() => [homeEn, ...grammarIndexPages, ...coursePages, ...lessonPages, a1TestPage, ...resourcePages].map(page => ({
  params: { page: page.path.slice(1, -1) },
  props: { page },
}))) satisfies GetStaticPaths;

function markLearningResource(html: string, page: PageRecord, course = false) {
  const scope = ' itemscope itemtype="https://schema.org/WebPage https://schema.org/LearningResource"';
  const markup = html.replace(/<main\b([^>]*)>/, `<main$1${scope}>`);
  return course
    ? markup.replace('<h1>', '<h1 itemprop=name>').replace('</h1><p>', '</h1><p itemprop=description>')
    : markup.replace(scope + '>', () => scope + `><meta itemprop=name content="${escapeLearningText(page.heading)}"><meta itemprop=inLanguage content=${page.locale}>`);
}

export const GET: APIRoute<{ page: PageRecord }> = ({ props: { page } }) => {
  const canonicalPath = catalog.canonical(page).path;
  const alternates = catalog.alternates(page);
  const course = coursePages.find(({ id }) => id === page.id);
  const renderResource = resourceRenderers.get(page.path);
  let html;
  if (page.id === homeEn.id) {
    html = englishPages({
      canonicalPath,
      index: page.index,
      alternateLinks: alternates.map(other =>
        `<link rel="alternate" hreflang="${other.locale}" href="${siteOrigin}${other.path}">`).join(''),
    }).get(outputFile(page.path));
  } else if (page.id === a1TestPage.id) {
    const a1Course = coursePages.find(other => other.level === 'A1' && other.locale === 'tr')!;
    html = renderA1Test(courseLessons(a1Course), turkishPage, {
      ...page, path: canonicalPath, title: page.title.slice(0, -' · Baulingo'.length),
    }, (id: string) => catalog.pages.get(`${id}:tr`)!.path, a1Course.path, page.index);
    html = markLearningResource(html, page);
  } else if (course) {
    const options = {
      ...page, path: canonicalPath,
      lessonLink: (id: string) => catalog.pages.get(`${id}:${course.locale}`)!.path,
      levelLink: (level: string) => coursePages.find(other => other.level === level && other.locale === course.locale)!.path,
    };
    const entries = courseLessons(course);
    html = course.locale === 'en'
      ? renderEnglishCourse(course.level, entries, options)
      : turkishPage(page.title.slice(0, -' · Baulingo'.length), page.description, canonicalPath,
        turkishCourseContent(course.level, entries, options), !page.index);
    const alternateLinks = alternates.map(other =>
      `<link rel=alternate hreflang=${other.locale} href=${siteOrigin}${other.path}>`).join('');
    html = markLearningResource(html.replace(/(<link rel="canonical"[^>]+>)/, '$1' + alternateLinks), page, true)
      .replace(/<\/li>(?=<li>|<\/ol>|<\/ul>)/g, '');
  } else if (renderResource) {
    html = renderResource({ ...page, path: canonicalPath }, alternates.map(other =>
      `<link rel="alternate" hreflang="${other.locale}" href="${siteOrigin}${other.path}">`).join(''));
    if (page.contentId || page.collectionId) html = markLearningResource(html, page);
  } else if (page.collectionId === 'grammar') {
    html = renderGrammarIndex({ ...page, path: canonicalPath }, grammarIndexLessons(page), (id: string, locale: string) => {
      const lesson = catalog.pages.get(`${id}:${locale}`);
      if (!lesson) throw new Error(`Missing grammar lesson page: ${id}:${locale}`);
      return lesson.path;
    }, [...alternates]);
  } else {
    html = renderLessonPreview(
      { ...page, path: canonicalPath },
      lessonPreview(page),
      alternates.map(other =>
        `<link rel=alternate hreflang=${other.locale} href=${siteOrigin}${other.path}>`).join(''),
    );
  }
  if (!html) throw new Error(`Missing page HTML: ${page.id}`);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
