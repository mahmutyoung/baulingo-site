import type { APIRoute, GetStaticPaths } from 'astro';
import { englishPages } from '../../../scripts/english-pages.mjs';
import { renderGrammarIndex, renderLessonPreview } from '../../../scripts/lesson-pages.mjs';
import { catalog, grammarIndexLessons, grammarIndexPages, homeEn, lessonPages, lessonPreview } from '../../publishing/catalog.ts';
import { outputFile, siteOrigin } from '../../publishing/model.ts';
import type { PageRecord } from '../../publishing/model.ts';

export const getStaticPaths = (() => [homeEn, ...grammarIndexPages, ...lessonPages].map(page => ({
  params: { page: page.path.slice(1, -1) },
  props: { page },
}))) satisfies GetStaticPaths;

export const GET: APIRoute<{ page: PageRecord }> = ({ props: { page } }) => {
  const canonicalPath = catalog.canonical(page).path;
  const alternates = catalog.alternates(page);
  let html;
  if (page.id === homeEn.id) {
    html = englishPages({
      canonicalPath,
      index: page.index,
      alternateLinks: alternates.map(other =>
        `<link rel="alternate" hreflang="${other.locale}" href="${siteOrigin}${other.path}">`).join(''),
    }).get(outputFile(page.path));
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
