import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';

test('Sınavlar opens an exam overview with DTZ materials and audience guidance', async () => {
  const home = await readFile('dist/index.html','utf8');
  assert.match(home, /href="\/sinavlar\/">Sınavlar<\/a>/);
  const html = await readFile('dist/sinavlar/index.html','utf8');
  assert.match(html, /canonical" href="https:\/\/baulingo.app\/sinavlar\/"/);
  assert.match(html, /href="\/sinavlar\/" class="active" aria-current="page">Sınavlar/);
  assert.match(html, /id="dtz"/);
  assert.match(html, /href="\/dtz-deneme-sinavi\/"/);
  assert.match(html, /href="\/dtz-kelime-kalip-cumle\/"/);
  for(const exam of ['Goethe','telc','TestDaF','DSH','DTB'])assert.ok(html.includes(exam));
  assert.match(await readFile('dist/sitemap.xml','utf8'), /https:\/\/baulingo.app\/sinavlar\//);
});

test('review-requested printer example is removed from the study page', async () => {
  const html=await readFile('dist/dtz-kelime-kalip-cumle/index.html','utf8');
  assert.doesNotMatch(html,/Der neue Drucker funktioniert nicht\./);
  assert.match(html,/Mit \{ürün\} gibt es ein Problem\./);
});

test('homepage topic links navigate to pages and app information has its own page', async () => {
  const home = await readFile('dist/index.html', 'utf8');
  assert.match(home, /href="\/uygulama\/"/);
  assert.doesNotMatch(home, /href="\/konular\/articles\/"[^>]*data-topic/);
  const about = await readFile('dist/uygulama/index.html', 'utf8');
  assert.match(about, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.baulingo\.app/);
});

test('completed DTZ result does not offer a new attempt', async () => {
  const html = await readFile('dist/dtz-deneme-sinavi/index.html', 'utf8');
  assert.doesNotMatch(html, /Yeni deneme başlat/i);
});

test('topic practice starts a sentence suited to each topic', async () => {
  const { exercises, newExercise } = await import('../src/exercise.js');
  for (const id of ['articles', 'cases', 'word-order', 'doctor']) {
    assert.equal(newExercise(id).id, id);
    assert.ok(exercises[id].sentence);
  }
  const topic = await readFile('dist/konular/cases/index.html', 'utf8');
  assert.match(topic, /\/?\?practice=cases#alistirma/);
});
