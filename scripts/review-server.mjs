import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { examData } from '../src/dtz/content.js';
import { createAttempt } from '../src/dtz/rules.js';
import { publicFiles, resolvePublicFile } from './public-files.mjs';

const allowedAssets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ...['review.js', 'bridge.js'].map(file => [`/${file}`, [file, 'text/javascript; charset=utf-8']]),
  ...['review.css', 'preview.css'].map(file => [`/${file}`, [file, 'text/css; charset=utf-8']]),
]);
const headers = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'Referrer-Policy': 'same-origin',
};
export function isLocalReviewRequest(request) {
  try { return ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(`http://${request.headers.host}`).hostname); }
  catch { return false; }
}

async function loadNotes(store) {
  try {
    const data = JSON.parse(await readFile(store, 'utf8'));
    if (data.version !== 1 || !Array.isArray(data.notes) || data.notes.some(n => !n || typeof n.id !== 'string' || typeof n.text !== 'string' || typeof n.sourceVersion !== 'string')) throw Error('Invalid review data');
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') return { version: 1, notes: [] };
    throw Error('Saved review notes could not be read. The file has been preserved; repair it before saving.');
  }
}

async function saveNotes(store, saved) {
  await mkdir(path.dirname(store), { recursive: true });
  const temporary = `${store}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, JSON.stringify(saved, null, 2) + '\n', { flag: 'wx' }); await rename(temporary, store); }
  finally { await unlink(temporary).catch(() => {}); }
}

async function model(root, store) {
  const catalog = JSON.parse(await readFile(path.join(root, 'dev/review/changes.json'), 'utf8'));
  const changes = await Promise.all(catalog.map(async change => {
    const hash = createHash('sha256').update(JSON.stringify(change));
    for (const file of change.files) hash.update(file).update(await readFile(path.join(root, file)));
    return { ...change, sourceVersion: hash.digest('hex') };
  }));
  // Component notes may target any public page, beyond the selected walkthrough.
  const componentHash = createHash('sha256');
  const sources = [...new Set([...publicFiles, 'src/dtz-study.js', 'scripts/pages.mjs', 'scripts/dtz-page.mjs', 'scripts/build.mjs', 'scripts/assets.mjs', ...catalog.flatMap(c => c.files)])].sort();
  for (const file of sources) {
    componentHash.update(file);
    try { componentHash.update(await readFile(path.join(root, file))); }
    catch (error) { if (error.code !== 'ENOENT') throw error; componentHash.update('missing'); }
  }
  let notes = [], storageError = '';
  try { notes = (await loadNotes(store)).notes; } catch (error) { storageError = error.message; }
  return { changes, notes, storageError, componentVersion: componentHash.digest('hex'), generatedAt: new Date().toISOString() };
}

export async function createReviewHandler({ root, storePath = path.join(root, '.dev/website-review.json'), refreshPreview = async () => {} }) {
  root = path.resolve(root);
  let writes = Promise.resolve();
  const initial = await model(root, storePath);
  let previewVersions = new Map(initial.changes.map(change => [change.id, change.sourceVersion]));
  let previewComponentVersion = initial.componentVersion;
  const workspace = async () => {
    const current = await model(root, storePath);
    current.changes = current.changes.map(change => ({ ...change, previewStale: previewVersions.get(change.id) !== change.sourceVersion }));
    current.componentPreviewStale = current.componentVersion !== previewComponentVersion;
    return current;
  };
  return async (request, response) => {
    const url = new URL(request.url, 'http://local');
    if (!url.pathname.startsWith('/dev/review')) return false;
    const send = (status, body, contentType = 'application/json; charset=utf-8', extra = {}) => {
      response.writeHead(status, { ...headers, 'Content-Type': contentType, ...extra });
      response.end(request.method === 'HEAD' ? undefined : typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
    };
    if (!isLocalReviewRequest(request)) { send(404, { error: 'Not found' }); return true; }
    if (url.pathname === '/dev/review') { send(307, '', 'text/plain', { Location: '/dev/review/' }); return true; }
    if (url.pathname === '/dev/review/api') {
      if (['GET', 'HEAD'].includes(request.method)) { send(200, await workspace()); return true; }
      if (request.method !== 'POST') { send(405, { error: 'Method not allowed' }); return true; }
      if (request.headers.origin !== `http://${request.headers.host}` || request.headers['content-type']?.split(';')[0] !== 'application/json') {
        send(403, { error: 'Only this local review page can save notes.' }); return true;
      }
      let bytes = 0, chunks = [];
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 16384) { request.resume(); send(413, { error: 'Keep feedback under 16 KB.' }); return true; }
        chunks.push(chunk);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { send(400, { error: 'Invalid feedback.' }); return true; }
      const write = async () => {
        if (body?.action === 'refresh') {
          const before = await model(root, storePath);
          await refreshPreview();
          const after = await model(root, storePath);
          previewComponentVersion = before.componentVersion === after.componentVersion ? after.componentVersion : '';
          previewVersions = new Map(after.changes.filter(change => before.changes.some(old => old.id === change.id && old.sourceVersion === change.sourceVersion)).map(change => [change.id, change.sourceVersion]));
          send(200, await workspace()); return;
        }
        if (body?.action === 'edit-note' || body?.action === 'delete-note') {
          if (typeof body.id !== 'string' || body.id.length > 100 || typeof body.expectedText !== 'string' || (body.action === 'edit-note' && (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 4000))) {
            send(400, { error: 'Invalid note.' }); return;
          }
          const saved = await loadNotes(storePath);
          const index = saved.notes.findIndex(note => note.id === body.id);
          if (index < 0) { send(404, { error: 'Note no longer exists. Refresh changes.' }); return; }
          if (saved.notes[index].text !== body.expectedText) { send(409, { error: 'This note changed elsewhere. Refresh changes before editing.' }); return; }
          const note = saved.notes[index];
          if (body.action === 'delete-note') saved.notes.splice(index, 1);
          else { note.text = body.text.trim(); note.updatedAt = new Date().toISOString(); }
          await saveNotes(storePath, saved);
          send(200, { note }); return;
        }
        const current = await workspace();
        const change = current.changes.find(c => c.id === body?.changeId);
        if (!change || !change.steps.some(step => step.id === body.stepId) || !['note', 'approved', 'changes'].includes(body.status) || typeof body.text !== 'string' || body.text.length > 4000 || (body.status === 'changes' && !body.text.trim())) {
          send(400, { error: 'Select a review stop and enter valid feedback (up to 4,000 characters).' }); return;
        }
        if (body.sourceVersion !== change.sourceVersion) { send(409, { error: 'The source changed. Refresh the review before saving. Your draft is still here.' }); return; }
        if (change.previewStale) { send(409, { error: 'The preview is older than the current source. Use Refresh changes to rebuild before saving. Your draft is still here.' }); return; }
        let component;
        if (body.component !== undefined) {
          const target = body.component;
          const valid = target && typeof target.path === 'string' && target.path.length <= 300 && /^\/(?!\/)/.test(target.path) && !/[?#%]/.test(target.path) && !target.path.split('/').includes('..') && resolvePublicFile(root, target.path)?.endsWith('.html') && typeof target.selector === 'string' && target.selector.length > 0 && target.selector.length <= 2000 && typeof target.label === 'string' && target.label.length > 0 && target.label.length <= 200;
          if (!valid) { send(400, { error: 'Choose a component on a public website page.' }); return; }
          if (body.componentVersion !== current.componentVersion || current.componentPreviewStale) { send(409, { error: 'Component source changed. Refresh changes before saving. Your draft is still here.' }); return; }
          component = { path: target.path, selector: target.selector, label: target.label };
        }
        if (current.storageError) { send(409, { error: current.storageError }); return; }
        const saved = await loadNotes(storePath);
        const note = { id: randomUUID(), changeId: change.id, stepId: body.stepId, sourceVersion: change.sourceVersion, status: body.status, text: body.text.trim(), createdAt: new Date().toISOString() };
        if (component) Object.assign(note, { component, componentVersion: current.componentVersion });
        saved.notes.push(note);
        await saveNotes(storePath, saved);
        send(200, { note });
      };
      const pending = writes.then(write);
      writes = pending.catch(() => {});
      try { await pending; } catch (error) {
        if (body?.action === 'refresh') {
          console.error('Local review rebuild failed:', error.message);
          send(500, { error: 'The preview could not be rebuilt. Check the local server output and try again. Your notes are preserved.' });
        } else send(500, { error: 'Feedback could not be saved. Your draft is still here; try again.' });
      }
      return true;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { send(405, { error: 'Method not allowed' }); return true; }
    const asset = allowedAssets.get(url.pathname.slice('/dev/review'.length));
    if (!asset) { send(404, { error: 'Not found' }); return true; }
    send(200, await readFile(path.join(root, 'dev/review', asset[0])), asset[1]);
    return true;
  };
}

export function createReviewSeed(stage) {
  let state = null;
  if (['listening', 'reading', 'writing', 'speaking', 'result'].includes(stage)) {
    state = createAttempt(Date.now());
    state.phase = stage;
    state.listeningFinished = stage !== 'listening';
    state.deadline = stage === 'reading' ? Date.now() + 45 * 60_000 : stage === 'writing' ? Date.now() + 30 * 60_000 : null;
    if (['writing', 'speaking', 'result'].includes(stage)) state.writing = 'Guten Tag Herr Winter,\n\nvielen Dank für Ihre Nachricht. Ich kann am Samstag von 8 bis 13 Uhr arbeiten.\n\nFreundliche Grüße';
    if (stage === 'result') {
      for (const task of [...examData.listeningTasks, ...examData.readingTasks].filter(t => !t.isExample)) for (const q of task.questions) state.answers[q.id] = q.correctAnswer;
    }
  }
  return state;
}

export function injectReviewBridge(html, stage = 'intro', templates = null) {
  const state = templates ? structuredClone(templates[stage] ?? null) : createReviewSeed(stage);
  if (state) {
    state.startedAt = Date.now();
    state.deadline = state.phase === 'reading' ? Date.now() + 45 * 60_000 : state.phase === 'writing' ? Date.now() + 30 * 60_000 : null;
  }
  const value = JSON.stringify(state).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  // Synchronous external script runs before either product module initializes.
  return html.replace('</head>', `<link rel="stylesheet" href="/dev/review/preview.css"><script src="/dev/review/bridge.js" data-review-state="${value}"></script></head>`);
}

export function rewriteReviewLinks(html, requestURL) {
  const base = new URL(requestURL, 'http://local');
  return html.replace(/<a\b[^>]*>/gi, tag => {
    const match = /\bhref=(["'])(.*?)\1/i.exec(tag);
    if (!match || /\bdownload(?:\s|=|>)/i.test(tag)) return tag;
    const url = new URL(match[2].replaceAll('&amp;', '&'), base);
    if (url.origin !== base.origin || url.pathname.startsWith('/dev/')) return tag;
    url.searchParams.set('__review', 'intro');
    const href = `${url.pathname}${url.search}${url.hash}`.replaceAll('&', '&amp;');
    return tag.replace(match[0], `href="${href}"`);
  });
}
