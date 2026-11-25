import type { APIRoute, GetStaticPaths } from 'astro';
import { englishPages } from '../../../scripts/english-pages.mjs';
import { renderLessonPreview } from '../../../scripts/lesson-pages.mjs';
import { catalog, homeEn, lessonPages, lessonPreview } from '../../publishing/catalog.ts';
import { outputFile, siteOrigin } from '../../publishing/model.ts';
import type { PageRecord } from '../../publishing/model.ts';

export const getStaticPaths = (() => [homeEn, ...lessonPages].map(page => ({
  params: { page: page.path.slice(1, -1) },
  props: { page },
}))) satisfies GetStaticPaths;

export const GET: APIRoute<{ page: PageRecord }> = ({ props: { page } }) => {
  const html = page.id === homeEn.id
    ? englishPages({
      canonicalPath: catalog.canonical(page).path,
      index: page.index,
      alternateLinks: catalog.alternates(page).map(other =>
        `<link rel="alternate" hreflang="${other.locale}" href="${siteOrigin}${other.path}">`).join(''),
    }).get(outputFile(page.path))
    : renderLessonPreview({ ...page, path: catalog.canonical(page).path }, lessonPreview(page));
  if (!html) throw new Error(`Missing page HTML: ${page.id}`);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
