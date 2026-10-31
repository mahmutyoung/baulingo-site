import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import './build-fixture.mjs';
import { createPreviewServer } from '../scripts/server.mjs';
import { resolvePublicFile } from '../scripts/public-files.mjs';

test('responsive hero uses smaller candidates while keeping eager LCP loading', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  const hero = html.match(/<img class="hero-photo"[^>]+>/)[0];
  assert.match(hero, /srcset=/); assert.match(hero, /sizes=/); assert.match(hero, /fetchpriority="high"/);
  assert.doesNotMatch(hero, /loading="lazy"/);
  const candidates = hero.match(/srcset="([^"]+)"/)[1].split(',').map(s => s.trim().split(/\s+/));
  assert.deepEqual(candidates.map(([, width]) => width), ['480w', '800w', '1200w', '1594w']);
  for (const [url] of candidates) assert.ok((await stat(resolvePublicFile(path.resolve('dist'), new URL(url, 'https://baulingo.app').pathname))).size > 0);
  const small = await stat(resolvePublicFile(path.resolve('dist'), new URL(candidates[0][0], 'https://baulingo.app').pathname));
  assert.ok(small.size < 60_000, `480px hero is ${small.size} bytes`);
});

test('fonts are bounded and fingerprinted assets match their content hashes', async () => {
  for (const name of ['BaulingoSans-Regular', 'BaulingoSans-SemiBold', 'BaulingoSans-Bold']) assert.ok((await stat(`assets/${name}.woff2`)).size < 60_000);
  const css = await readFile('dist/style.css', 'utf8');
  const urls = [...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m => m[1]);
  assert.ok(urls.length >= 5);
  for (const url of urls.filter(url => !url.startsWith('data:'))) {
    const pathname = new URL(url, 'https://baulingo.app/style.css').pathname;
    assert.match(pathname, /^\/assets\/cache\//);
    const file = resolvePublicFile(path.resolve('dist'), pathname); assert.ok(file);
    const hash = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
    assert.ok(pathname.includes(`.${hash}.`));
  }
  for (const url of ['/assets/cache/.env.0123456789ab', '/assets/cache/unknown.0123456789ab.webp', '/assets/cache/cafe-hero.not-a-hash.webp', '/assets/cache/../private.0123456789ab.webp']) assert.equal(resolvePublicFile(path.resolve('dist'), url), null);
});

test('immutable caching applies only to fingerprinted assets', async () => {
  const server = await createPreviewServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const html = await (await fetch(origin)).text();
    const hero = html.match(/<img class="hero-photo"[^>]+src="([^"]+)"/)[1];
    const response = await fetch(new URL(hero, origin)); assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    const headerText = await readFile('dist/_headers', 'utf8');
    assert.doesNotMatch(headerText.split(/\r?\n\r?\n/)[0], /Cache-Control/i, 'Global cache rule must not conflict with immutable paths');
    assert.ok(headerText.includes(`${new URL(hero, origin).pathname}\n  Cache-Control: public, max-age=31536000, immutable`));
    assert.ok(headerText.split(/\r?\n/).filter(line => line.startsWith('/') || line.startsWith('https://')).length <= 100);
    for (const url of ['/', '/style.css', '/assets/cafe-hero.webp']) assert.doesNotMatch((await fetch(origin + url)).headers.get('cache-control'), /immutable/);
    const missing = await fetch(origin + '/assets/cache/cafe-hero.000000000000.webp');
    assert.equal(missing.status, 404);
    assert.doesNotMatch(missing.headers.get('cache-control'), /immutable/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
