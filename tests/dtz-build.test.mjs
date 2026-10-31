import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';
import { createPreviewServer } from '../scripts/server.mjs';

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
