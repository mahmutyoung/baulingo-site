import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';
import { otherLanguagePath, preferredLanguage } from '../src/language-choice.js';

test('language choice respects saved preference and recognises English browser locales', () => {
  assert.equal(preferredLanguage('tr', ['en-US']), 'tr');
  assert.equal(preferredLanguage('en', ['tr-TR']), 'en');
  assert.equal(preferredLanguage(null, ['en-GB']), 'en');
  assert.equal(preferredLanguage(null, ['de-DE']), 'tr');
});

test('site language changes preserve the matching course, grammar page and help context', () => {
  assert.equal(otherLanguagePath('/konular/almanca-a2/', 'en'), '/en/german-a2/');
  assert.equal(otherLanguagePath('/en/german-b1/', 'tr'), '/konular/almanca-b1/');
  assert.equal(otherLanguagePath('/en/german-grammar/', 'tr', '#b1'), '/konular/almanca-gramer/#b1');
  assert.equal(otherLanguagePath('/dtz-mektup-yazma/kime-yaziyorum/', 'en'), '/en/dtz-exam/#writing-help');
  assert.equal(otherLanguagePath('/konular/almanca-a1-test/', 'en'), '/en/german-a1/');
  assert.equal(otherLanguagePath('/unknown/', 'tr'), '/?lang=tr');
});

test('English pages provide original English learning content and manual language links', async () => {
  const home = await readFile('dist/en/index.html', 'utf8');
  assert.match(home, /<html lang="en">/);
  assert.match(home, /English/);
  assert.match(home, /href="\/en\/word-order\/"/);
  assert.match(home, /href="\/\?lang=tr"[^>]*data-language-choice="tr"/);
  const topic = await readFile('dist/en/word-order/index.html', 'utf8');
  assert.match(topic, /finite verb/);
  assert.match(topic, /data-practice="en-word-order"/);
  assert.match(topic, /id="sentence-example"/);
  assert.match(await readFile('dist/index.html', 'utf8'), /href="\/en\/"[^>]*data-language-choice="en"/);
});

test('English section does not publish or link to an app page', async () => {
  const home = await readFile('dist/en/index.html', 'utf8');
  assert.doesNotMatch(home, /\/en\/app\//);
  assert.doesNotMatch(await readFile('dist/sitemap.xml', 'utf8'), /\/en\/app\//);
  await assert.rejects(readFile('dist/en/app/index.html', 'utf8'), { code: 'ENOENT' });
});

test('English homepage has crawlable learning paths and reciprocal language metadata', async () => {
  const home = await readFile('dist/en/index.html', 'utf8');
  assert.match(home, /<title>Learn German for Beginners: Grammar &amp; Everyday Phrases/);
  assert.equal((home.match(/<h1\b/g) || []).length, 1);
  for (const slug of ['articles', 'word-order', 'appointments']) assert.ok(home.includes(`href="/en/${slug}/"`));
  for (const file of ['dist/index.html', 'dist/en/index.html']) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /hreflang="en" href="https:\/\/baulingo.app\/en\/"/);
    assert.match(html, /hreflang="tr" href="https:\/\/baulingo.app\/"/);
  }
  assert.match(home, /property="og:url" content="https:\/\/baulingo.app\/en\/"/);
  assert.match(home, /<audio controls preload="none"/);
});
