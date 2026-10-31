// Explicit, opt-in content export. Normal builds never read the app repository.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = path.resolve(process.argv[2] || path.join(root, '../german-exam-app'));
const sourcePath = 'src/features/mock-exam/dtzMockExam.ts';
const source = await readFile(path.join(sourceRoot, sourcePath), 'utf8');
const media = {
  '../../../assets/dtz-mock-01/dtz-mock-01-listening.mp3': '/assets/dtz/dtz-mock-01-listening.mp3',
  '../../../assets/dtz-mock-01/images/speaking-neighbor-help-a.webp': '/assets/dtz/speaking-neighbor-help-a.webp',
  '../../../assets/dtz-mock-01/images/speaking-neighbor-help-b.webp': '/assets/dtz/speaking-neighbor-help-b.webp',
};
const js = stripTypeScriptTypes(source, { mode: 'strip' }).replace(/require\('([^']+)'\)/g, (_, original) => {
  if (!media[original]) throw new Error(`Unexpected source asset: ${original}`);
  return JSON.stringify(media[original]);
});
if (/\brequire\s*\(|\bimport\s/.test(js)) throw new Error('Unexpected dependency in exam content export.');
const content = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const examData = {
  id: 'dtz-mock-01',
  listeningAudio: content.listeningExamAudio,
  listeningTasks: content.listeningTasks,
  readingTasks: content.readingTasks,
  writingPrompts: content.writingPrompts,
  speakingPicturePrompts: content.speakingPicturePrompts,
  speakingPlanningPoints: content.speakingPlanningPoints,
};
for (const [section, expected] of [['listening', 20], ['reading', 25]]) {
  const questions = examData[`${section}Tasks`].filter(t => !t.isExample).flatMap(t => t.questions);
  if (questions.length !== expected || questions.some(q => !q.choices[q.correctAnswer])) throw new Error(`Invalid ${section} export.`);
}
await mkdir(path.join(root, 'src/dtz'), { recursive: true });
await mkdir(path.join(root, 'assets/dtz'), { recursive: true });
await writeFile(path.join(root, 'src/dtz/content.js'), `// Controlled export of original Baulingo Mock Exam 01. Regenerate with scripts/import-dtz.mjs.\nexport const examData = ${JSON.stringify(examData, null, 2)};\n`);
const hashes = { [sourcePath]: createHash('sha256').update(source).digest('hex') };
for (const [original, destination] of Object.entries(media)) {
  const relative = original.replace('../../../', '');
  const sourceFile = path.join(sourceRoot, relative);
  await copyFile(sourceFile, path.join(root, destination.slice(1)));
  hashes[relative] = createHash('sha256').update(await readFile(sourceFile)).digest('hex');
}
await mkdir(path.join(root, 'docs/content'), { recursive: true });
await writeFile(path.join(root, 'docs/content/dtz-source.json'), JSON.stringify({ source: 'german-exam-app', exam: examData.id, importedAt: new Date().toISOString(), hashes }, null, 2) + '\n');
console.log('Exported 45 scored items, examples, writing/speaking prompts and three explicit DTZ media files.');
