import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import './build-fixture.mjs';

const read = file => readFile('dist/' + file, 'utf8');

test('DTZ hub links to the complete German test and course and to English and Turkish help', async () => {
  const hub = await read('de/dtz-pruefung/index.html');
  assert.match(hub, /<html lang="de">/);
  assert.match(hub, /href="\/de\/dtz-pruefung\/modelltest\/"/);
  assert.match(hub, /href="\/de\/dtz-pruefung\/schreiben\/"/);
  assert.match(hub, /href="\/en\/dtz-exam\/"/);
  assert.match(hub, /href="\/dtz-sinavi\/"/);
  const english = await read('en/dtz-exam/index.html');
  assert.match(english, /<html lang="en">/);
  assert.match(english, /href="\/de\/dtz-pruefung\/schreiben\/"/);
  const turkish = await read('sinavlar/index.html');
  assert.match(turkish, /href="\/de\/dtz-pruefung\/"/);
  const sitemap = await read('sitemap.xml');
  for (const route of ['/de/dtz-pruefung/', '/de/dtz-pruefung/modelltest/', '/de/dtz-pruefung/schreiben/', '/en/dtz-exam/']) {
    assert.ok(sitemap.includes('https://baulingo.app' + route + '</loc>'), route);
  }
});

test('German test and writing course retain all scored questions and original writing activities', async () => {
  const testPage = gunzipSync(await readFile('dist/src/dtz/modelltest-de.gz')).toString();
  assert.equal((testPage.match(/data-review=/g) ?? []).length, 45);
  assert.match(testPage, /Modelltest starten/);
  assert.match(testPage, /data-phase="speaking"/);
  assert.doesNotMatch(testPage, /Denemeye başla|Almanca yanıtın/);
  const course = gunzipSync(await readFile('dist/src/dtz/schreiben-de.gz')).toString();
  assert.equal((course.match(/data-chapter=/g) ?? []).length, 15);
  assert.equal((course.match(/data-writing-response=/g) ?? []).length, 47);
  assert.match(course, /Selbstkontrolle/);
  assert.match(course, /Modell A erst nach Selbstkontrolle zeigen/);
});
