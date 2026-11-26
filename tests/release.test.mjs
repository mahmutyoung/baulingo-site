import test from 'node:test';
import './build-fixture.mjs';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fingerprintOnlyAssets, generatedFiles, isFingerprintedAsset, publicFiles } from '../scripts/public-files.mjs';
import { examData } from '../src/dtz/content.js';
import { writingBook } from '../scripts/writing-content.mjs';
import { catalog, grammarIndexPages, lessonPages, readerPages } from '../src/publishing/catalog.ts';
import { outputFile, siteOrigin } from '../src/publishing/model.ts';
import { resourcePages } from '../src/publishing/resources.ts';
import { escapeLearningText } from '../src/learning-text.js';

const output = 'dist';
const filesIn = async directory => (await readdir(directory, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => path.relative(directory, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
  .sort();

test('release artifact contains exactly the public files, generated routes and fingerprinted assets', async () => {
  const files = await filesIn(output);
  const fingerprinted = files.filter(isFingerprintedAsset);
  assert.equal(fingerprinted.length, fingerprintOnlyAssets.length);
  const expected = [
    ...publicFiles.filter(file => !fingerprintOnlyAssets.includes(file)),
    ...generatedFiles, ...fingerprinted, '_headers', '_redirects',
  ];
  assert.deepEqual(files, expected.sort());

  const home = await readFile(path.join(output, 'index.html'), 'utf8');
  assert.match(home, /<html lang="tr">/);
  assert.doesNotMatch(home, /astro-island|<style\b|<script(?![^>]*\bsrc=)[^>]*>/i);
});

test('release pages expose catalog canonicals, locales, crawlable links and learning metadata', async () => {
  const sitemapURLs = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  const sitemap = sitemapURLs(await readFile(path.join(output, 'sitemap.xml'), 'utf8'));
  assert.deepEqual(sitemap, catalog.sitemapLocations());
  assert.equal(new Set(sitemap).size, sitemap.length, 'No duplicate sitemap URLs');

  const alternateTag = /<link rel="?alternate"? hreflang="?(de|en|tr)"? href="?([^"\s>]+)"?>/g;
  const learningResourceScope = ' itemscope itemtype="https://schema.org/WebPage https://schema.org/LearningResource"';
  for (const level of ['a1', 'a2', 'b1']) {
    const routes = { en: `/en/german-${level}/`, tr: `/konular/almanca-${level}/` };
    for (const [locale, route] of Object.entries(routes)) {
      const page = catalog.paths.get(route);
      assert.ok(page?.collectionId, `Course overview must belong to a collection: ${route}`);
      const html = await readFile(path.join(output, outputFile(route)), 'utf8');
      assert.deepEqual([...html.matchAll(alternateTag)].map(([, code, url]) => [code, url]),
        Object.entries(routes).map(([code, target]) => [code, siteOrigin + target]));
      assert.ok(html.includes(learningResourceScope));
      assert.ok(html.includes(`<h1 itemprop=name>${page.heading}</h1><p itemprop=description>${page.description}</p>`));
      const links = [...html.matchAll(/<li><a href="([^"]+)"/g)].map(([, link]) => link);
      assert.deepEqual(links, catalog.collections.get(page.collectionId).contentIds
        .map(id => catalog.pages.get(`${id}:${locale}`).path));
    }
  }
  for (const page of [...lessonPages, ...readerPages, ...grammarIndexPages]) {
    const html = await readFile(path.join(output, outputFile(page.path)), 'utf8');
    if (page.contentId) {
      assert.equal(html.includes(' data-grammar>'), catalog.content.get(page.contentId).category === 'grammar');
    } else if (readerPages.includes(page)) {
      assert.ok(html.includes('data-reader') && html.includes('/src/mini-packs/player.js'), page.path);
    } else {
      const grammarLinks = lessonPages.filter(lesson => lesson.locale === page.locale &&
        catalog.content.get(lesson.contentId).category === 'grammar');
      assert.equal(grammarLinks.length, 53);
      for (const lesson of grammarLinks) assert.ok(html.includes(`href="${lesson.path}"`), lesson.path);
    }
  }

  const a1Test = catalog.paths.get('/konular/almanca-a1-test/');
  assert.ok(a1Test?.contentId, 'The A1 practice test must have a stable content ID');
  const structuredData = /<meta itemprop=name content="([^"]+)"><meta itemprop=inLanguage content=(de|en|tr)>/;
  for (const url of sitemap) {
    const route = new URL(url).pathname;
    const page = catalog.paths.get(route);
    assert.ok(page?.index && page.sitemap, `Every indexed route must have a catalog page: ${route}`);
    const html = await readFile(path.join(output, outputFile(route)), 'utf8');
    assert.match(html, new RegExp(`<html lang="?${page.locale}"?>`), route);
    assert.ok(html.includes(`rel="canonical" href="${url}"`), route);
    assert.doesNotMatch(html, /<meta name="?robots"? content="?noindex/i, route);
    assert.deepEqual([...html.matchAll(alternateTag)].map(([, locale, href]) => [locale, href]),
      catalog.alternates(page).map(other => [other.locale, siteOrigin + other.path]), route);
  }
  for (const page of [a1Test, ...resourcePages.filter(page => page.contentId || page.collectionId)]) {
    const html = await readFile(path.join(output, outputFile(page.path)), 'utf8');
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
    const html = await readFile(path.join(output, outputFile(route)), 'utf8');
    assert.equal(mock.contentId, catalog.paths.get(trMock).contentId);
    assert.deepEqual([...html.matchAll(alternateTag)].map(([, code, url]) => [code, url]), mockLinks);
  }
  const mockExample = examData.readingTasks.find(task => task.isExample && task.reference);
  const deMockHTML = await readFile(path.join(output, outputFile(deMock)), 'utf8');
  assert.ok(deMockHTML.includes(mockExample.questions[0].prompt));
  const deWritingHTML = await readFile(path.join(output, outputFile(deWriting)), 'utf8');
  for (const { slug } of writingBook.chapters) {
    assert.ok(deWritingHTML.includes(`href="#${slug}"`) && deWritingHTML.includes(`id="${slug}"`), slug);
  }
  assert.match(deWritingHTML, /Sehr geehrte Damen und Herren,/);
});

test('published DTZ player data retains the scoring contract', async () => {
  const playerData = (await import('../dist/src/dtz/content.js')).examData;
  for (const section of ['listeningTasks', 'readingTasks']) {
    const questions = examData[section].filter(task => !task.isExample).flatMap(task => task.questions);
    assert.deepEqual(playerData[section].flatMap(task => task.questions),
      questions.map(({ id, choices, correctAnswer }) => ({ id, choices, correctAnswer })));
  }
});
