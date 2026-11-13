import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import './build-fixture.mjs';
import { writingLessons } from '../scripts/writing-content.mjs';
import { writingMarkdown } from '../scripts/writing-page.mjs';
import { taskHTML } from '../scripts/writing-task-page.mjs';
import { phraseSections } from '../scripts/writing-phrases.mjs';
import { resolvePublicFile } from '../scripts/public-files.mjs';

test('writing course preserves every original task model in discoverable static Turkish lessons', async () => {
  assert.equal(writingLessons.length, 24);
  assert.equal(writingLessons.flatMap(lesson => lesson.tasks).length, 47);
  const index = await readFile('dist/dtz-mektup-yazma/index.html', 'utf8');
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  for (const lesson of writingLessons) {
    const url = `/dtz-mektup-yazma/${lesson.id}/`;
    assert.ok(index.includes(url));
    assert.ok(sitemap.includes(url));
    const html = await readFile(`dist${url}index.html`, 'utf8');
    assert.ok(html.includes(lesson.title));
    assert.ok(html.includes(`https://baulingo.app${url}`));
    assert.match(html, /<html lang="tr">/);
    assert.match(html, lesson.reference ? /Kaynağı gözden geçirdim/ : /Dersi tamamladım/);
    for (const task of lesson.tasks) {
      assert.ok(html.includes(`data-task="${task.id}"`));
      assert.ok(html.includes(task.kind==='letter' ? `id="draft-${task.id}"` : `data-response="${task.id}:0"`));
      assert.ok(html.includes(`id="model-${task.id}"`));
    }
    assert.doesNotMatch(html, /30 Writing\/|window\.DTZ_BOOK|<script[^>]*>\s*\{/);
  }
  for (const file of ['index.html', 'sinavlar/index.html', 'konular/exams/index.html']) {
    assert.ok((await readFile(`dist/${file}`, 'utf8')).includes('/dtz-mektup-yazma/'));
  }
});

test('audited task types expose required choices and task-specific letter guidance', async () => {
  const first=await readFile('dist/dtz-mektup-yazma/kime-yaziyorum/index.html','utf8');
  assert.match(first, /data-task-kind="match"/);
  assert.match(first, /data-task-kind="choice"/);
  assert.doesNotMatch(first, /id="draft-c1-t[12]"/);
  assert.match(first, /data-stimulus/);
  const guided=await readFile('dist/dtz-mektup-yazma/rehberli-yazma/index.html','utf8');
  assert.match(guided, /data-plan-label/);
  assert.match(guided, /data-model-point/);
  assert.ok(guided.includes('Mevcut Almanca düzeyim'));
  const index=await readFile('dist/dtz-mektup-yazma/index.html','utf8');
  assert.match(index, /data-progress-bar max="22"/);
  assert.match(first, /data-outcome/);
  const simulation=await readFile('dist/dtz-mektup-yazma/deneme-1/index.html','utf8');
  assert.ok(simulation.indexOf('data-choice-brief')<simulation.indexOf('name="writing-task"'));
  assert.match(simulation, /Davet|Davete/);
});

test('all authored guidance has meaningful task points and annotated full letters', () => {
  for(const lesson of writingLessons) {
    assert.ok(lesson.outcome,lesson.id);
    for(const task of lesson.tasks) {
      assert.ok(task.kind && task.title,task.id);
      if(task.kind==='letter') {
        assert.equal(task.points.length,4,task.id);
        assert.ok(task.points.every(point=>point.label&&point.example&&point.meaning),task.id);
        const model=task.model.replace(/>\s*/g,' ').replace(/\s+/g,' ');
        assert.ok(task.points.every(point=>model.includes(point.example)),`${task.id}: annotated excerpt must exist in its model`);
      } else assert.ok(task.fields.length,task.id);
    }
  }
});

test('every phrase reference entry supplies a Turkish meaning and a contextual example', () => {
  const entries=phraseSections.flatMap(section=>section.rows);
  assert.equal(entries.length,64);
  assert.ok(entries.every(row=>row.de&&row.tr&&row.example&&row.meaning));
});

test('writing studio exposes a phrase toolbox while retaining the complete static reference', async () => {
  const guided = await readFile('dist/dtz-mektup-yazma/rehberli-yazma/index.html', 'utf8');
  assert.match(guided, /data-phrase-toolbox/);
  assert.match(guided, /href="\/dtz-mektup-yazma\/cumle-kaliplari\/"/);
  assert.ok(resolvePublicFile(process.cwd(), '/src/writing/studio.js'));
  const reference = await readFile('dist/dtz-mektup-yazma/cumle-kaliplari/index.html', 'utf8');
  for (const section of phraseSections) for (const row of section.rows) {
    assert.ok(reference.includes(row.de), row.de);
    assert.ok(reference.includes(row.tr), row.tr);
    assert.ok(reference.includes(row.meaning), row.meaning);
  }
});

test('short writing binds one revision field so the visible improvement cannot be lost', () => {
  const task=writingLessons[0].tasks.find(task=>task.id==='c1-t3');
  const html=taskHTML(task,0,false);
  assert.equal((html.match(/data-revised/g)||[]).length,1);
  assert.match(html,/id="revised-c1-t3" data-revised/);
});

test('writing assets are explicitly public and the source book stays private', () => {
  assert.ok(resolvePublicFile(process.cwd(), '/writing.css'));
  assert.ok(resolvePublicFile(process.cwd(), '/src/writing/player.js'));
  assert.equal(resolvePublicFile(process.cwd(), '/scripts/data/dtz-writing-book.json'), null);
});

test('book markdown cannot inject executable markup into static lessons', () => {
  const html = writingMarkdown('# <script>alert(1)</script>\n\n> <img src=x onerror=alert(1)>\n\n- `<svg onload=alert(1)>`');
  assert.doesNotMatch(html, /<(?:script|img|svg)\b/);
  assert.ok(html.includes('&lt;script&gt;'));
});

test('Turkish answer options keep Turkish pronunciation and the practice clock is not a live announcement', async () => {
  const html = await readFile('dist/dtz-mektup-yazma/gorevi-anlama/index.html', 'utf8');
  assert.match(html, /<span lang="tr">Hangisinin dört maddesine de somut yanıt verebilirim\?<\/span>/);
  const simulation = await readFile('dist/dtz-mektup-yazma/deneme-1/index.html', 'utf8');
  assert.match(simulation, /<output data-timer role="timer" aria-live="off"/);
});
