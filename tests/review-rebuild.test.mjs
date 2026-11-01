import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicFiles } from '../scripts/public-files.mjs';
import { rebuildReviewPreview } from '../scripts/review-rebuild.mjs';

test('review refresh uses fresh generator modules and fresh DTZ sample answers', async () => {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'baulingo-review-build-'));
  try {
    const files = [...publicFiles, 'src/dtz-study.js', '_headers', '_redirects', 'package.json', ...['build', 'assets', 'public-files', 'pages', 'english-pages', 'study-page', 'sentence-meanings', 'dtz-page', 'review-build', 'review-server'].map(name => `scripts/${name}.mjs`)];
    for (const file of files) { await mkdir(path.dirname(path.join(scratch, file)), { recursive: true }); await copyFile(file, path.join(scratch, file)); }
    const worker = pathToFileURL(path.join(scratch, 'scripts/review-build.mjs'));
    const before = await rebuildReviewPreview(worker);
    const source = path.join(scratch, 'src/topics.js');
    await writeFile(source, (await readFile(source, 'utf8')).replace('İsimlerin cinsiyeti', 'Freshly rebuilt topic wording'));
    const contentPath = path.join(scratch, 'src/dtz/content.js');
    const content = await readFile(contentPath, 'utf8');
    const data = JSON.parse(content.slice(content.indexOf('export const examData = ') + 'export const examData = '.length).trim().replace(/;$/, ''));
    const question = data.listeningTasks.find(task => !task.isExample).questions[0];
    question.correctAnswer = (question.correctAnswer + 1) % question.choices.length;
    await writeFile(contentPath, `export const examData = ${JSON.stringify(data)};\n`);
    const after = await rebuildReviewPreview(worker);
    assert.match(await readFile(path.join(scratch, 'dist/konular/articles/index.html'), 'utf8'), /Freshly rebuilt topic wording/);
    assert.notEqual(before.result.answers[question.id], after.result.answers[question.id]);
    assert.equal(after.result.answers[question.id], question.correctAnswer);
  } finally { await rm(scratch, { recursive: true, force: true }); }
});
