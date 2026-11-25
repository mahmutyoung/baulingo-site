import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { dtzMediaFiles } from '../scripts/public-files.mjs';

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

const candidateChanges = new Set(['index.html', 'style.css', 'sitemap.xml']);
let coreBytes = 0;
let mediaBytes = 0;
for (const file of files) {
  const output = path.join(candidate, file);
  if (!candidateChanges.has(file)) {
    assert.deepEqual(await readFile(output), await readFile(path.join(legacy, file)), file);
  }
  const { size } = await stat(output);
  if (dtzMediaFiles.includes(file)) mediaBytes += size;
  else coreBytes += size;
}
assert.ok(coreBytes < 2_000_000, `${coreBytes} bytes exceeds the core output budget`);
assert.ok(mediaBytes < 10_000_000, `${mediaBytes} bytes exceeds the DTZ media budget`);
console.log(`Astro candidate parity checks passed (${coreBytes} core bytes, ${mediaBytes} DTZ media bytes).`);
