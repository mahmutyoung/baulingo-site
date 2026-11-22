import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import './build-fixture.mjs';
import { resolvePublicFile } from '../scripts/public-files.mjs';
import { matchesAnswer } from '../src/mini-packs/answers.js';

test('English Topics links to every level of the public mini-pack library', async () => {
  const home = await readFile('dist/en/index.html', 'utf8');
  assert.match(home, /href="\/en\/mini-packs\/"/);
  const root = resolve('dist');
  const page = resolvePublicFile(root, '/en/mini-packs/');
  const data = resolvePublicFile(root, '/src/mini-packs/library.gz');
  assert.ok(page && data);
  assert.match(await readFile(page, 'utf8'), /<html lang="en">/);
  const library = JSON.parse(gunzipSync(await readFile(data)));
  assert.deepEqual(Object.fromEntries(['A1', 'A2', 'B1'].map(level =>
    [level, library.filter(({ pack }) => pack.cefr === level).length])), { A1: 17, A2: 22, B1: 28 });
  assert.equal(new Set(library.map(({ pack }) => pack.id)).size, 67);
  for (const { pack } of library) {
    assert.deepEqual(pack.exercises.map(exercise => exercise.stage), ['recognize', 'build', 'produce'], pack.id);
    assert.ok(pack.cefr === 'B1' ? pack.scenario : pack.challenge, pack.id);
  }
  assert.equal(library.find(({ pack }) => pack.id === 'DE-B1-017').pack.scenario.routes.length, 2);
  assert.match(await readFile('dist/sitemap.xml', 'utf8'), /\/en\/mini-packs\//);
});

test('mini-pack answers match the authored options after German normalization', () => {
  assert.ok(matchesAnswer('  SCHO\u0308N   GUT! ', ['Schön gut']));
  assert.equal(matchesAnswer('Schoen gut.', ['Schön gut']), false);
  assert.equal(matchesAnswer('   ', ['']), false);
});

test('Turkish Topics exposes the independent Turkish samples for every lesson', async () => {
  const root = resolve('dist');
  const topics = await readFile('dist/konular/index.html', 'utf8');
  assert.match(topics, /href="\/konular\/mini-paketler\/"/);
  const page = resolvePublicFile(root, '/konular/mini-paketler/');
  const archive = resolvePublicFile(root, '/src/mini-packs/library-tr.gz');
  assert.ok(page && archive);
  assert.match(await readFile(page, 'utf8'), /<html lang="tr">/);
  const turkish = JSON.parse(gunzipSync(await readFile(archive)));
  const english = JSON.parse(gunzipSync(await readFile('dist/src/mini-packs/library.gz')));
  assert.deepEqual(turkish.map(({ pack }) => pack.id), english.map(({ pack }) => pack.id));
  for (const { pack } of turkish) {
    assert.ok(pack.vocabulary.every(word => word.tr && word.example.tr && !('en' in word)), pack.id);
    assert.deepEqual(pack.exercises.map(exercise => exercise.stage), ['recognize', 'build', 'produce'], pack.id);
    assert.ok((pack.scenario?.task ?? pack.challenge).example.tr, pack.id);
  }
  assert.equal(turkish[0].pack.title, 'Kendini tanıt');
  assert.equal(turkish.find(({ pack }) => pack.id === 'DE-B1-017').pack.scenario.routes.length, 2);
  assert.match(await readFile('dist/sitemap.xml', 'utf8'), /\/konular\/mini-paketler\//);
});
