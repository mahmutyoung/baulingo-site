import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import './build-fixture.mjs';
import { createPreviewServer } from '../scripts/server.mjs';
import { createReviewHandler } from '../scripts/review-server.mjs';

async function withServer(options, work) {
  const server = await createPreviewServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await work(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('review tools are development-only and excluded from static output', async () => {
  await withServer({}, async origin => {
    for (const route of ['/dev/review/', '/dev/review/api', '/dev/review/bridge.js']) assert.equal((await fetch(origin + route)).status, 404);
    assert.equal((await fetch(origin)).headers.get('x-frame-options'), 'DENY');
    assert.doesNotMatch(await (await fetch(origin + '/?__review=reading')).text(), /dev\/review\/bridge/);
  });
  const files = await readdir('dist', { recursive: true });
  assert.ok(!files.some(file => file.replaceAll('\\', '/').startsWith('dev/')));
  await withServer({ review: true }, async origin => {
    const response = await fetch(origin + '/dev/review/');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.match(await response.text(), /Review my work/);
    assert.equal((await fetch(origin)).headers.get('x-frame-options'), 'SAMEORIGIN');
    const foreignHostStatus = await new Promise((resolve, reject) => {
      const request = http.get(origin + '/dev/review/', { headers: { Host: 'untrusted.example' } }, response => { response.resume(); resolve(response.statusCode); });
      request.on('error', reject);
    });
    assert.equal(foreignHostStatus, 404);
  });
});

test('review notes persist and reject stale sources, foreign origins and oversized data', async () => {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'baulingo-review-'));
  const store = path.join(scratch, 'notes.json');
  try {
    await withServer({ review: true, reviewStore: store }, async origin => {
      const model = await (await fetch(origin + '/dev/review/api')).json();
      assert.ok(model.changes.length >= 2);
      const change = model.changes[0], step = change.steps[0];
      const payload = { changeId: change.id, stepId: step.id, sourceVersion: change.sourceVersion, status: 'changes', text: 'Please check the navigation.' };
      const post = (body, requestOrigin = origin) => fetch(origin + '/dev/review/api', { method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal((await post(payload, 'https://other.example')).status, 403);
      assert.equal((await post({ ...payload, text: 'x'.repeat(20000) })).status, 413);
      assert.equal((await post({ ...payload, sourceVersion: 'old' })).status, 409);
      assert.equal((await post({ ...payload, stepId: 'invented' })).status, 400);
      assert.equal((await post(payload)).status, 200);
      const saved = JSON.parse(await readFile(store, 'utf8'));
      assert.equal(saved.notes[0].text, payload.text);
      const after = await (await fetch(origin + '/dev/review/api')).json();
      assert.equal(after.notes[0].sourceVersion, change.sourceVersion);
      const targeted = { ...payload, component: { path: '/dtz-deneme-sinavi/', selector: '#dtz-before', label: 'Başlamadan önce' }, componentVersion: model.componentVersion };
      assert.equal((await post({ ...targeted, componentVersion: 'old' })).status, 409);
      assert.equal((await post({ ...targeted, component: { ...targeted.component, path: '/dev/review/' } })).status, 400);
      assert.equal((await post({ ...targeted, component: { ...targeted.component, path: '/privacy/../' } })).status, 400);
      const componentResponse = await post(targeted);
      assert.equal(componentResponse.status, 200);
      const componentNote = (await componentResponse.json()).note;
      assert.deepEqual(componentNote.component, targeted.component);
      assert.equal(componentNote.componentVersion, model.componentVersion);
      const edit = { action: 'edit-note', id: componentNote.id, expectedText: componentNote.text, text: 'Updated feedback' };
      assert.equal((await post(edit, 'https://other.example')).status, 403);
      assert.equal((await post(edit)).status, 200);
      assert.equal((await post(edit)).status, 409);
      const edited = JSON.parse(await readFile(store, 'utf8')).notes.find(note => note.id === componentNote.id);
      assert.equal(edited.text, 'Updated feedback');
      assert.deepEqual(edited.component, componentNote.component);
      assert.equal((await post({ action: 'delete-note', id: componentNote.id, expectedText: componentNote.text })).status, 409);
      assert.equal((await post({ action: 'delete-note', id: componentNote.id, expectedText: edited.text })).status, 200);
      assert.equal(JSON.parse(await readFile(store, 'utf8')).notes.length, 1);
      await writeFile(store, 'corrupt');
      assert.equal((await post(payload)).status, 409);
      assert.equal(await readFile(store, 'utf8'), 'corrupt');
    });
  } finally { await rm(scratch, { recursive: true, force: true }); }
});

test('walkthrough injects an isolated dev bridge without changing public HTML', async () => {
  await withServer({ review: true }, async origin => {
    const html = await (await fetch(origin + '/dtz-deneme-sinavi/?__review=writing')).text();
    assert.match(html, /src="\/dev\/review\/bridge.js"/);
    assert.match(html, /data-review-state=/);
    assert.match(html, /&quot;phase&quot;:&quot;writing&quot;/);
    const normal = await (await fetch(origin + '/dtz-deneme-sinavi/')).text();
    assert.doesNotMatch(normal, /dev\/review\/bridge/);
    assert.equal((await fetch(origin + '/dev/review/../../.env')).status, 404);
    assert.equal((await fetch(origin + '/dev/review/changes.json')).status, 404);
    const privacy = await (await fetch(origin + '/privacy/?__review=intro')).text();
    assert.ok(privacy.includes('href="/?__review=intro"'), 'Legal home link must retain review isolation');
    assert.match(privacy, /dev\/review\/bridge/);
    const normalPrivacy = await (await fetch(origin + '/privacy/')).text();
    assert.doesNotMatch(normalPrivacy, /dev\/review\/bridge/);
    assert.match(normalPrivacy, /http-equiv="Content-Security-Policy"/);
  });
});

test('review decisions require the displayed build to match current source', async () => {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'baulingo-review-source-'));
  const directory = path.join(scratch, 'dev/review');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(directory, { recursive: true });
  const catalog = [{ id: 'test', title: 'Test', files: ['page.txt'], steps: [{ id: 'page', path: '/' }] }];
  await writeFile(path.join(directory, 'changes.json'), JSON.stringify(catalog));
  await writeFile(path.join(scratch, 'page.txt'), 'old source');
  let rebuilt = false;
  const handler = await createReviewHandler({ root: scratch, storePath: path.join(scratch, 'notes.json'), refreshPreview: async () => { rebuilt = true; } });
  const server = http.createServer(async (req, res) => { if (!await handler(req, res)) { res.writeHead(404); res.end(); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const post = body => fetch(origin + '/dev/review/api', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    await writeFile(path.join(scratch, 'page.txt'), 'new source not built yet');
    const current = await (await fetch(origin + '/dev/review/api')).json();
    assert.equal(current.changes[0].previewStale, true);
    const decision = { changeId: 'test', stepId: 'page', sourceVersion: current.changes[0].sourceVersion, status: 'approved', text: '' };
    assert.equal((await post(decision)).status, 409);
    const refreshed = await post({ action: 'refresh' });
    assert.equal(refreshed.status, 200);
    assert.equal(rebuilt, true);
    assert.equal((await refreshed.json()).changes[0].previewStale, false);
    assert.equal((await post(decision)).status, 200);
    // A navigated component can depend on a shared file outside this stop's source list.
    await writeFile(path.join(scratch, 'style.css'), 'new shared style');
    const shared = await (await fetch(origin + '/dev/review/api')).json();
    assert.equal(shared.changes[0].previewStale, false);
    assert.equal(shared.componentPreviewStale, true);
    const target = { ...decision, component: { path: '/', selector: 'header', label: 'Header' }, componentVersion: shared.componentVersion };
    assert.equal((await post(target)).status, 409);
    await post({ action: 'refresh' });
    assert.equal((await post(target)).status, 200);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(scratch, { recursive: true, force: true }); }
});
