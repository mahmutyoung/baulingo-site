import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';
import { turkishLessonPath } from '../src/mini-packs/routes.js';

test('Turkish course levels expose their complete lesson lists and a sample exercise in static HTML', async () => {
  const source = JSON.parse(await readFile('src/mini-packs/library-tr.json', 'utf8'));
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  for (const level of ['A1', 'A2', 'B1']) {
    const route = `/konular/almanca-${level.toLowerCase()}/`;
    const html = await readFile('dist' + route + 'index.html', 'utf8');
    const lessons = source.filter(({ pack }) => pack.cefr === level);
    assert.ok(html.includes(`<h1>Almanca ${level} Kursu</h1>`));
    assert.ok(sitemap.includes('https://baulingo.app' + route + '</loc>'));
    const list = html.match(/<ol class="topic-index">([\s\S]+?)<\/ol>/)[1];
    assert.deepEqual([...list.matchAll(/href="([^"]+)"/g)].map(match => match[1]), lessons.map(({ pack }) => turkishLessonPath(pack.id)));
    assert.match(html, /<summary>Cevabı gör<\/summary>/);
  }
});

test('A1 practice questions each have three choices, a Turkish explanation and a real course lesson', async () => {
  const html = await readFile('dist/konular/almanca-a1-test/index.html', 'utf8');
  const a1 = JSON.parse(await readFile('src/mini-packs/library-tr.json', 'utf8'))
    .filter(({ pack }) => pack.cefr === 'A1').map(({ pack }) => turkishLessonPath(pack.id));
  const questions = [...html.matchAll(/<fieldset data-answer="([0-2])">([\s\S]*?)<\/fieldset>/g)];
  assert.equal(questions.length, 12);
  for (const [, answer, question] of questions) {
    assert.deepEqual([...question.matchAll(/type="radio"[^>]+value="([0-2])"/g)].map(match => match[1]), ['0', '1', '2']);
    assert.ok(question.includes(`value="${answer}"`));
    assert.match(question, /<p data-explanation>[^<]+/);
    assert.ok(a1.includes(question.match(/data-review-lesson><a href="([^"]+)"/)[1]));
  }
  assert.match(html, /rel="canonical" href="https:\/\/baulingo\.app\/konular\/almanca-a1-test\/"/);
});
