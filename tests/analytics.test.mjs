import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';

test('GA4 consent module is present on learning pages, not loaded directly from templates', async () => {
  for (const file of ['index.html', 'en/index.html', 'konular/index.html', 'dtz-deneme-sinavi/index.html']) {
    const html = await readFile(`dist/${file}`, 'utf8');
    assert.match(html, /src="(?:\.\/|\/)src\/analytics\.js"/, file);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/, file);
  }
  const asset = await readFile('dist/src/analytics.js', 'utf8');
  assert.match(asset, /G-3XSNDN7FE4/);
  assert.match(asset, /choice === 'granted'/);
  assert.match(asset, /location\.hostname !== 'baulingo\.app'/);
  assert.match(asset, /allowedEvents = new Set/);
  assert.doesNotMatch(asset, /localStorage\.setItem\([^,]+,\s*JSON\.stringify\(attempt\)/);
});

test('the site permits only necessary GA4 endpoints and discloses opt-in collection', async () => {
  const [headers, homepage, privacy] = await Promise.all([
    readFile('dist/_headers', 'utf8'),
    readFile('dist/index.html', 'utf8'),
    readFile('dist/privacy/index.html', 'utf8'),
  ]);
  for (const content of [headers, homepage]) {
    assert.match(content, /www\.googletagmanager\.com/);
    assert.match(content, /www\.google-analytics\.com/);
    assert.match(content, /region1\.google-analytics\.com/);
    assert.match(content, /static\.cloudflareinsights\.com/);
  }
  assert.match(privacy, /Google Analytics 4/);
  assert.match(privacy, /ausdrücklich zustimmst/);
  assert.match(privacy, /Einwilligung/);
});
