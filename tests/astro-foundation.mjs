import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { dtzMediaFiles } from '../scripts/public-files.mjs';
import { examData } from '../src/dtz/content.js';
import { writingBook } from '../scripts/writing-content.mjs';
import { catalog, coursePages, grammarIndexPages, lessonPages, readerPages } from '../src/publishing/catalog.ts';
import { outputFile, siteOrigin } from '../src/publishing/model.ts';
import { resourcePages } from '../src/publishing/resources.ts';
import { escapeLearningText } from '../src/learning-text.js';

const legacy = 'dist';
const candidate = '.dev/astro-dist';
const filesIn = async directory => (await readdir(directory, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => path.relative(directory, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
  .sort();

const files = await filesIn(candidate);
assert.deepEqual(files, await filesIn(legacy), 'The candidate must keep the legacy publication manifest');

const legacyHome = await readFile(path.join(legacy, 'index.html'), 'utf8');
const astroHome = await readFile(path.join(candidate, 'index.html'), 'utf8');
assert.match(astroHome, /<h1 id="intro">Almancada<br\s*\/?>aradığın cevap\.<\/h1>/);
assert.match(astroHome, /<html lang="tr">/);
assert.doesNotMatch(astroHome, /astro-island|<style\b|<script(?![^>]*\bsrc=)[^>]*>/i);

const tagsWithURLs = html => [...html.matchAll(/\b(?:href|src|action|srcset)="([^"]+)"/g)]
  .map(match => match[0]).sort();
assert.deepEqual(tagsWithURLs(astroHome), tagsWithURLs(legacyHome), 'Homepage URLs and responsive assets must match');
const metadata = html => html.match(/<meta\b[^>]*>|<title>[^<]+<\/title>/g).sort();
assert.deepEqual(metadata(astroHome), metadata(legacyHome), 'Homepage metadata and CSP must match');

const sitemapURLs = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url).sort();
const candidateSitemap = sitemapURLs(await readFile(path.join(candidate, 'sitemap.xml'), 'utf8'));
assert.deepEqual(candidateSitemap, sitemapURLs(await readFile(path.join(legacy, 'sitemap.xml'), 'utf8')));
assert.equal(new Set(candidateSitemap).size, candidateSitemap.length, 'No duplicate sitemap URLs');

const candidatePages = [...lessonPages, ...readerPages];
const alternateTag = /<link rel="?alternate"? hreflang="?(de|en|tr)"? href="?([^"\s>]+)"?>/g;
const learningResourceScope = ' itemscope itemtype="https://schema.org/WebPage https://schema.org/LearningResource"';
for (const level of ['a1', 'a2', 'b1']) {
  const routes = { en: `/en/german-${level}/`, tr: `/konular/almanca-${level}/` };
  for (const [locale, route] of Object.entries(routes)) {
    const page = catalog.paths.get(route);
    assert.ok(page?.collectionId, `Course overview must belong to a collection: ${route}`);
    const html = await readFile(path.join(candidate, outputFile(route)), 'utf8');
    const previous = await readFile(path.join(legacy, outputFile(route)), 'utf8');
    assert.deepEqual([...html.matchAll(alternateTag)].map(([, code, url]) => [code, url]),
      Object.entries(routes).map(([code, target]) => [code, siteOrigin + target]));
    assert.ok(html.includes(learningResourceScope));
    assert.ok(html.includes(`<h1 itemprop=name>${page.heading}</h1><p itemprop=description>${page.description}</p>`));
    const normalize = value => value.replace(alternateTag, '').replace(learningResourceScope, '')
      .replaceAll(/ itemprop=(?:name|description)/g, '').replaceAll(/<\/li>/g, '');
    assert.equal(normalize(html), normalize(previous), route);
    const links = [...html.matchAll(/<li><a href="([^"]+)"/g)].map(([, link]) => link);
    assert.deepEqual(links, catalog.collections.get(page.collectionId).contentIds
      .map(id => catalog.pages.get(`${id}:${locale}`).path));
  }
}
for (const page of [...candidatePages, ...grammarIndexPages]) {
  const html = await readFile(path.join(candidate, outputFile(page.path)), 'utf8');
  const alternates = [...html.matchAll(alternateTag)]
    .map(([, locale, url]) => [locale, url]);
  assert.deepEqual(alternates, catalog.alternates(page).map(other => [other.locale, siteOrigin + other.path]), page.path);
  assert.ok(html.includes(`rel="canonical" href="${siteOrigin}${page.path}"`), page.path);
  if (page.contentId) {
    const previous = await readFile(path.join(legacy, outputFile(page.path)), 'utf8');
    assert.equal(html.includes(' data-grammar>'), catalog.content.get(page.contentId).category === 'grammar');
    assert.equal(html.replace(alternateTag, '').replace(' data-grammar>', '>'), previous, `Static examples and markup on ${page.path}`);
  } else if (readerPages.includes(page)) {
    assert.ok(html.includes('data-reader') && html.includes('/src/mini-packs/player.js'), page.path);
  } else {
    const grammarLinks = lessonPages.filter(lesson => lesson.locale === page.locale &&
      catalog.content.get(lesson.contentId).category === 'grammar');
    assert.equal(grammarLinks.length, 53);
    for (const lesson of grammarLinks) assert.ok(html.includes(`href="${lesson.path}"`), lesson.path);
  }
}

const candidateChanges = new Set(['index.html', 'sitemap.xml', ...[...candidatePages, ...coursePages].map(page => outputFile(page.path))]);
const a1Test = catalog.paths.get('/konular/almanca-a1-test/');
assert.ok(a1Test?.contentId, 'The A1 practice test must have a stable content ID');
const a1Output = outputFile(a1Test.path);
candidateChanges.add(a1Output);
const a1HTML = await readFile(path.join(candidate, a1Output), 'utf8');
const structuredData = /<meta itemprop=name content="([^"]+)"><meta itemprop=inLanguage content=(de|en|tr)>/;
const withoutSchema = html => html.replace(learningResourceScope, '').replace(structuredData, '');
assert.equal(withoutSchema(a1HTML), await readFile(path.join(legacy, a1Output), 'utf8'), 'A1 test questions, answers and controls');
assert.equal([...a1HTML.matchAll(/<fieldset data-answer=/g)].length, 12);
for (const url of candidateSitemap) {
  const route = new URL(url).pathname;
  const page = catalog.paths.get(route);
  assert.ok(page?.index && page.sitemap, `Every indexed route must have a catalog page: ${route}`);
  const html = await readFile(path.join(candidate, outputFile(route)), 'utf8');
  assert.match(html, new RegExp(`<html lang="?${page.locale}"?>`), route);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), route);
  assert.doesNotMatch(html, /<meta name="?robots"? content="?noindex/i, route);
}
for (const page of [a1Test, ...resourcePages.filter(page => page.contentId || page.collectionId)]) {
  const html = await readFile(path.join(candidate, outputFile(page.path)), 'utf8');
  const schema = html.match(structuredData);
  const heading = html.match(/<h1>([^]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.deepEqual(schema?.slice(1), [escapeLearningText(page.heading), page.locale], page.path);
  assert.ok(html.includes(learningResourceScope + '>' + schema[0]), page.path);
  assert.equal(heading, schema[1], `Visible and structured headings on ${page.path}`);
}
const trMock = '/dtz-deneme-sinavi/';
const deMock = '/de/dtz-pruefung/modelltest/';
const deWriting = '/de/dtz-pruefung/schreiben/';
const mockLinks = [
  ['de', siteOrigin + deMock], ['tr', siteOrigin + trMock],
];
for (const route of [deMock, trMock]) {
  const mock = catalog.paths.get(route);
  const html = await readFile(path.join(candidate, outputFile(route)), 'utf8');
  assert.equal(mock.contentId, catalog.paths.get(trMock).contentId);
  assert.deepEqual([...html.matchAll(alternateTag)].map(([, code, url]) => [code, url]), mockLinks);
}
const mockExample = examData.readingTasks.find(task => task.isExample && task.reference);
const deMockHTML = await readFile(path.join(candidate, outputFile(deMock)), 'utf8');
assert.ok(deMockHTML.includes(mockExample.questions[0].prompt) && deMockHTML.includes('Beispielantwort:'));
const deWritingHTML = await readFile(path.join(candidate, outputFile(deWriting)), 'utf8');
for (const { slug } of writingBook.chapters) {
  assert.ok(deWritingHTML.includes(`href="#${slug}"`) && deWritingHTML.includes(`id="${slug}"`), slug);
}
assert.match(deWritingHTML, /Sehr geehrte Damen und Herren,/);
const playerData = (await import('../.dev/astro-dist/src/dtz/content.js')).examData;
for (const section of ['listeningTasks', 'readingTasks']) {
  const questions = examData[section].filter(task => !task.isExample).flatMap(task => task.questions);
  assert.deepEqual(playerData[section].flatMap(task => task.questions),
    questions.map(({ id, choices, correctAnswer }) => ({ id, choices, correctAnswer })));
}
let coreBytes = 0;
let mediaBytes = 0;
for (const file of files) {
  const output = path.join(candidate, file);
  if (!candidateChanges.has(file) && !/\.(?:js|css)$/.test(file)) {
    if (resourcePages.some(page => outputFile(page.path) === file)) {
      const html = withoutSchema(await readFile(output, 'utf8'));
      const previous = await readFile(path.join(legacy, file), 'utf8');
      assert.equal(file === outputFile(trMock) ? html.replace(alternateTag, '') : html, previous, file);
    } else {
      assert.deepEqual(await readFile(output), await readFile(path.join(legacy, file)), file);
    }
  }
  const { size } = await stat(output);
  if (dtzMediaFiles.includes(file)) mediaBytes += size;
  else coreBytes += size;
}
assert.ok(coreBytes < 2_000_000, `${coreBytes} bytes exceeds the core output budget`);
assert.ok(mediaBytes < 10_000_000, `${mediaBytes} bytes exceeds the DTZ media budget`);
console.log(`Astro candidate parity checks passed (${coreBytes} core bytes, ${mediaBytes} DTZ media bytes).`);
