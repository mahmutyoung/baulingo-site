import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewServer } from '../scripts/server.mjs';
import './build-fixture.mjs';

test('production preview serves real pages, errors, headers and downloads', async () => {
  const server = await createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const get = route => fetch(`${origin}${route}`, { redirect: 'manual' });
  try {
    const home = await get('/');
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(home.headers.get('x-frame-options'), 'DENY');
    for (const route of ['/konular/cases/', '/kaynaklar/', '/privacy/', '/impressum/']) assert.equal((await get(route)).status, 200, route);
    for (const route of ['/missing', '/.git/config', '/assets/%2e%2e%2fREADME.md', '/_headers']) {
      const missing = await get(route);
      assert.equal(missing.status, 404, route);
      assert.match(await missing.text(), /Sayfa bulunamadı/);
    }
    assert.equal((await get('/bad%ZZ')).status, 400);
    const redirect = await get('/konular/cases?q=artikel');
    assert.equal(redirect.status, 307);
    assert.equal(redirect.headers.get('location'), '/konular/cases/?q=artikel');
    assert.equal((await get('/index.html')).headers.get('location'), '/');
    const download = await get('/downloads/kafede-almanca.txt');
    assert.match(download.headers.get('content-disposition'), /attachment/);
    assert.match(await download.text(), /KAFEDE/);
    assert.equal((await get('/assets/Lato-Regular.woff2')).headers.get('content-type'), 'font/woff2');
    assert.equal((await get('/assets/audio/einen-kaffee-bitte.mp3')).headers.get('content-type'), 'audio/mpeg');
    assert.equal((await fetch(origin, { method: 'HEAD' })).status, 200);
    assert.equal(await (await fetch(origin, { method: 'HEAD' })).text(), '');
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
