import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { dtzMediaFiles } from '../scripts/public-files.mjs';
import { catalog, grammarIndexPages, lessonPages, readerPages } from '../src/publishing/catalog.ts';
import { outputFile, siteOrigin } from '../src/publishing/model.ts';

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
const alternateTag = /<link rel="?alternate"? hreflang="?(en|tr)"? href="?([^"\s>]+)"?>/g;
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

const candidateChanges = new Set(['index.html', 'sitemap.xml', ...candidatePages.map(page => outputFile(page.path))]);
let coreBytes = 0;
let mediaBytes = 0;
for (const file of files) {
  const output = path.join(candidate, file);
  if (!candidateChanges.has(file) && !/\.(?:js|css)$/.test(file)) {
    assert.deepEqual(await readFile(output), await readFile(path.join(legacy, file)), file);
  }
  const { size } = await stat(output);
  if (dtzMediaFiles.includes(file)) mediaBytes += size;
  else coreBytes += size;
}
assert.ok(coreBytes < 2_000_000, `${coreBytes} bytes exceeds the core output budget`);
assert.ok(mediaBytes < 10_000_000, `${mediaBytes} bytes exceeds the DTZ media budget`);
console.log(`Astro candidate parity checks passed (${coreBytes} core bytes, ${mediaBytes} DTZ media bytes).`);
