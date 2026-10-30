import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import './build-fixture.mjs';
import { topics } from '../src/topics.js';

const read = file => readFile(path.join('dist', file), 'utf8');

test('homepage keeps approved copy and offers real topic and resource links', async () => {
  const html = await read('index.html');
  assert.match(html, /Almancada<br>aradığın cevap\./);
  assert.match(html, /<a [^>]*href="\/konular\/cases\/"[^>]*data-topic="cases"/);
  assert.match(html, /action="\/konular\/"/);
  assert.match(html, /href="\/kaynaklar\/"/);
  assert.match(html, /rel="canonical" href="https:\/\/baulingo.app\/"/);
});

test('every topic is readable without JavaScript and has its own canonical URL', async () => {
  for (const topic of topics) {
    const html = await read(`konular/${topic.id}/index.html`);
    assert.ok(html.includes(topic.title));
    for (const text of topic.paragraphs) assert.ok(html.includes(text));
    assert.ok(html.includes(`https://baulingo.app/konular/${topic.id}/`));
  }
  assert.match(await read('kaynaklar/index.html'), /downloads\/kafede-almanca.txt/);
  assert.match(await read('konular/kafede-siparis/index.html'), /Einen Kaffee, bitte\./);
});

test('deployment includes discovery, real 404 handling and security headers', async () => {
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/baulingo.app\/sitemap.xml/);
  const sitemap = await read('sitemap.xml');
  for (const topic of topics) assert.ok(sitemap.includes(`/konular/${topic.id}/`));
  assert.match(await read('404.html'), /Sayfa bulunamadı/);
  const headers = await read('_headers');
  for (const header of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'frame-ancestors']) assert.ok(headers.includes(header));
  const config = JSON.parse(await readFile('wrangler.json', 'utf8'));
  assert.equal(config.assets.directory, './dist');
  assert.equal(config.assets.not_found_handling, '404-page');
});

test('public build excludes source artwork, raw fonts and private files and stays under 2 MB', async () => {
  let bytes = 0;
  for (const file of await readdir('dist', { recursive: true })) {
    const info = await stat(path.join('dist', file));
    if (!info.isFile()) continue;
    assert.doesNotMatch(file, /(?:\.png|\.ttf|\.md|\.test\.mjs|package\.json|\.env)$/);
    bytes += info.size;
  }
  assert.ok(bytes < 2_000_000, `${bytes} bytes exceeds the public payload budget`);
});

test('all built HTML references resolve to public output, including nested pages and 404', async () => {
  const files = await readdir('dist', { recursive: true });
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const html = await read(file);
    const base = new URL(file.replaceAll('\\', '/'), 'https://baulingo.app/');
    for (const match of html.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
      const url = new URL(match[1], base);
      if (url.origin !== base.origin) continue;
      const relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      const target = relative.endsWith('/') ? `${relative}index.html` : relative;
      assert.ok((await stat(path.join('dist', target))).isFile(), `${file}: ${match[1]}`);
    }
  }
});
