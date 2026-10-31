import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';
import { createPreviewServer } from '../scripts/server.mjs';
import { dtzWords, dtzPhrases, dtzSentences } from '../src/dtz-study.js';

test('DTZ landing page is indexable and contains the complete static simulation and discovery links', async () => {
  const html = await readFile('dist/dtz-deneme-sinavi/index.html', 'utf8');
  assert.match(html, /canonical" href="https:\/\/baulingo.app\/dtz-deneme-sinavi\/"/);
  assert.equal((html.match(/data-question="dtz-mock-01-q/g) || []).length, 45);
  assert.match(html, /data-phase="writing"/);
  assert.match(html, /data-phase="speaking"/);
  assert.match(html, /otomatik değerlendirilmez/);
  assert.match(html, /id="dtz-audio" preload="none" data-src=/);
  assert.doesNotMatch(html, /id="dtz-audio"[^>]*\ssrc=/);
  assert.match(await readFile('dist/index.html', 'utf8'), /href="\/dtz-deneme-sinavi\/"/);
  assert.match(await readFile('dist/sitemap.xml', 'utf8'), /https:\/\/baulingo.app\/dtz-deneme-sinavi\//);
});

test('DTZ study page is discoverable and keeps source statistics out of the page', async () => {
  const html = await readFile('dist/dtz-kelime-kalip-cumle/index.html', 'utf8');
  for (const id of ['kelimeler', 'kaliplar', 'cumleler']) {
    assert.ok(html.includes(`id="${id}"`));
    assert.ok((await readFile('dist/index.html', 'utf8')).includes(`/dtz-kelime-kalip-cumle/#${id}`));
  }
  assert.match(html, /DTZ’de çıkabilecek kelimeler/);
  assert.doesNotMatch(html, /Kaynak:|tekrar\/öğe|üzerinden yapılan analiz/);
  assert.match(await readFile('dist/sitemap.xml', 'utf8'), /dtz-kelime-kalip-cumle/);
});

test('study content has usable grammatical, topic and section metadata', () => {
  assert.deepEqual(new Set(dtzWords.map(word => word.type)), new Set(['isim', 'fiil', 'sifat', 'zarf']));
  for (const item of [...dtzWords, ...dtzPhrases, ...dtzSentences]) {
    assert.ok(item.topic && item.parts.length);
    assert.ok(item.parts.every(part => ['Hören', 'Lesen', 'Schreiben', 'Sprechen'].includes(part)));
    assert.doesNotMatch(item.text, /\b(?:Herr|Frau)\s+Klein\b/);
  }
  assert.ok(dtzWords.some(word => word.text === 'die Wohnung' && word.type === 'isim'));
  assert.ok(dtzPhrases.some(phrase => phrase.text === 'mit dem Bus'));
  assert.ok(!dtzPhrases.some(phrase => phrase.text.toLowerCase() === 'ich möchte'));
});

test('DTZ audio preview serves byte ranges and rejects unsatisfiable ranges', async () => {
  const server = await createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/assets/dtz/dtz-mock-01-listening.mp3`;
    const partial = await fetch(url, { headers: { Range: 'bytes=0-127' } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-type'), 'audio/mpeg');
    assert.match(partial.headers.get('content-range'), /^bytes 0-127\/\d+$/);
    assert.equal((await partial.arrayBuffer()).byteLength, 128);
    const invalid = await fetch(url, { headers: { Range: 'bytes=999999999-' } });
    assert.equal(invalid.status, 416);
    const suffix = await fetch(url, { headers: { Range: 'bytes=-64' } });
    assert.equal(suffix.status, 206);
    assert.equal((await suffix.arrayBuffer()).byteLength, 64);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.headers.get('accept-ranges'), 'bytes');
    assert.ok(Number(head.headers.get('content-length')) > 8_000_000);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
