import { copyFile, mkdir, rm, lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, constants as zlib } from 'node:zlib';
import { publicFiles, generatedFiles, fingerprintOnlyAssets, legacyAssetAliases } from './public-files.mjs';
import { dtzStudyArchive, fullStudyContent, generatePages } from './pages.mjs';
import { dtzGermanArchives } from './dtz-hub.mjs';
import { writingBase, writingLessons } from './writing-content.mjs';
import { writingCourseNavigation } from './writing-page.mjs';
import { examData } from '../src/dtz/content.js';
import { catalog as publishing, coursePages as courseOverviews } from '../src/publishing/catalog.ts';
import { compactGeneratedHTML, fingerprintAssets, rewriteAssetURLs } from './assets.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = path.resolve(root, 'dist');
const miniPackLibraries = ['library', 'library-tr', 'grammar', 'grammar-tr'];
const learnerData = (name, extension) => `src/mini-packs/${name}.${extension}`;
if (output !== path.join(root, 'dist') || path.dirname(output) !== root) throw new Error('Invalid build output directory.');
// Choose the smallest standard gzip encoding; all variants decode to identical bytes.
function compactGzip(input) {
  const variants = [gzipSync(input, { level: 9 })];
  for (const memLevel of [8, 9]) for (const strategy of [zlib.Z_DEFAULT_STRATEGY, zlib.Z_FILTERED]) {
    variants.push(gzipSync(input, { level: 9, memLevel, strategy }));
  }
  return variants.reduce((best, candidate) => candidate.length < best.length ? candidate : best);
}

// Reviewed browser modules: preserve multiline template lines, line breaks and tokens.
const compactModules = new Set([
  'src/analytics.js', 'app.js', 'src/sentence-builder.js', 'src/writing/player.js',
  'src/mini-packs/player.js',
  'src/writing/activities.js', 'src/dtz/player.js', 'src/a1-test.js', 'src/dtz/german-resource.js',
  'src/language.js', 'src/dtz-study-filter.js', 'src/writing/studio.js', 'src/writing/letter-builder.js',
  'src/writing/letter-rules.js', 'src/writing/rules.js', 'src/dtz/rules.js',
  'src/mini-packs/routes.js', 'src/learning-text.js', 'src/topics.js',
]);
function compactModule(source) {
  if (source.includes('/*') || source.includes('\\\n')) return source;
  let template = false;
  const lines = [];
  for (const line of source.split('\n')) {
    const wasTemplate = template;
    if ((line.match(/`/g) || []).length % 2) template = !template;
    if (wasTemplate || template) lines.push(line);
    else if (line.trim() && !line.trimStart().startsWith('//')) lines.push(line.trimStart());
  }
  return template ? source : lines.join('\n') + '\n';
}

// Compact public stylesheets, preserving quoted strings and comments.
function compactStyle(source) {
  return source.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/)|\s*([{};])\s*|:\s+/g,
    (match, literal, punctuation) => literal || punctuation || ':');
}

export async function build() {
  // Check every source and parent before copying; never follow a symlink outside this repo.
  for (const file of [...publicFiles, '_headers', '_redirects', ...miniPackLibraries.map(name => learnerData(name, 'json'))]) {
    let entry = path.join(root, file);
    while (entry !== root) {
      if ((await lstat(entry)).isSymbolicLink()) throw new Error(`Refusing to publish symlink: ${file}`);
      entry = path.dirname(entry);
    }
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of [...publicFiles, '_headers', '_redirects']) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    if (file === 'src/analytics.js') {
      const source = await readFile(path.join(root, file), 'utf8');
      const writingContent = new Set(publishing.collections.get('dtz-writing-tr').contentIds);
      const writingSlugs = [];
      const pages = Object.fromEntries([...publishing.paths.values()].flatMap(page => {
        const content = page.contentId && publishing.content.get(page.contentId);
        if (content?.format === 'mini_pack') return [];
        const slug = page.path.startsWith(writingBase) && page.path.slice(writingBase.length, -1);
        if (slug && content?.format === 'writing' && writingContent.has(content.id) &&
          content.id === 'dtz-writing-' + slug && page.locale === 'tr' && page.id === content.id + ':tr') {
          writingSlugs.push(slug);
          return [];
        }
        const level = content?.level ?? courseOverviews.find(course => course.id === page.id)?.level;
        const row = [page.id, page.locale, page.contentId, content?.format, page.collectionId, level];
        while (row.at(-1) === undefined) row.pop();
        return [[page.path, row]];
      }));
      await writeFile(path.join(output, file), source
        .replace('const publishedPages = {};', () => `const publishedPages = ${JSON.stringify(pages)};`)
        .replace('const writingLessonSlugs = [];', () => `const writingLessonSlugs = ${JSON.stringify(writingSlugs)};`));
    } else if (compactModules.has(file)) {
      const source = await readFile(path.join(root, file), 'utf8');
      await writeFile(path.join(output, file), compactModule(source));
    } else if (file.endsWith('.css')) {
      const source = await readFile(path.join(root, file), 'utf8');
      await writeFile(path.join(output, file), compactStyle(source));
    } else await copyFile(path.join(root, file), path.join(output, file));
  }
  // Each reader fetches only the selected track and language.
  const [en, tr, grammarEn, grammarTr] = await Promise.all(miniPackLibraries.map(async name =>
    JSON.parse(await readFile(path.join(root, learnerData(name, 'json')), 'utf8'))));
  const tracks = [withGrammarLinks(en, grammarEn), withGrammarLinks(tr, grammarTr), grammarEn, grammarTr];
  for (const [index, name] of miniPackLibraries.entries()) {
    await writeFile(path.join(output, learnerData(name, 'gz')), compactGzip(JSON.stringify(tracks[index])));
  }
  for (const [file, render] of dtzGermanArchives) {
    await writeFile(path.join(output, file), compactGzip(render()));
  }
  await writeFile(path.join(output, dtzStudyArchive), compactGzip(fullStudyContent()));
  const catalog = Object.fromEntries(writingLessons.map(({ id, reference, tasks }) =>
    [id, { reference: !!reference, tasks: tasks.map(({ id }) => ({ id })) }]));
  await writeFile(path.join(output, 'src/writing/catalog.js'), `export const writingCourse = ${JSON.stringify(catalog)};\nexport const writingNavigation = ${JSON.stringify(writingCourseNavigation(writingBase))};\n`);
  // The static HTML carries the exam text and media. The player needs only scoring and export data.
  const scoringTasks = tasks => tasks.filter(task => !task.isExample).map(task => ({
    questions: task.questions.map(({ id, choices, correctAnswer }) => ({ id, choices, correctAnswer })),
  }));
  const playerExam = {
    id: examData.id,
    listeningTasks: scoringTasks(examData.listeningTasks),
    readingTasks: scoringTasks(examData.readingTasks),
    writingPrompts: examData.writingPrompts.map(({ id, title }) => ({ id, title })),
  };
  await writeFile(path.join(output, 'src/dtz/content.js'), `export const examData = ${JSON.stringify(playerExam)};\n`);
  for (const [file, html] of generatePages({ en, tr }, { en: grammarEn, tr: grammarTr })) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await writeFile(path.join(output, file), compactGeneratedHTML(file, html));
  }
  const mapping = await fingerprintAssets(output);
  for (const file of [...publicFiles, ...generatedFiles].filter(name => /\.(?:html|css)$/.test(name))) {
    const target = path.join(output, file);
    await writeFile(target, rewriteAssetURLs(await readFile(target, 'utf8'), mapping));
  }
  // Cloudflare exact internal rewrites preserve old URLs without duplicate files.
  const aliases = [
    ...fingerprintOnlyAssets.map(source => [source, source]),
    ...Object.entries(legacyAssetAliases),
  ].map(([source, target]) => `/${source} /${mapping.get(target)} 200`).join('\n');
  await writeFile(path.join(output, '_redirects'), `${await readFile(path.join(root, '_redirects'), 'utf8')}\n${aliases}\n`);
  for (const source of fingerprintOnlyAssets) await rm(path.join(output, source));
  // Cloudflare's default revalidation remains on mutable URLs. Exact paths avoid
  // conflicting Cache-Control rules and never give missing hashes a year-long TTL.
  const headerPath = path.join(output, '_headers');
  const immutableRules = [...mapping.values()].map(file => `/${file}\n  Cache-Control: public, max-age=31536000, immutable`).join('\n\n');
  await writeFile(headerPath, `${await readFile(headerPath, 'utf8')}\n\n${immutableRules}\n`);
  return output;
}
function withGrammarLinks(course, grammar) {
  const related = new Map();
  for (const { pack, title, related: [practice] } of grammar) {
    const links = related.get(practice.id) ?? [];
    links.push({ id: pack.id, title });
    related.set(practice.id, links);
  }
  return course.map(record => related.has(record.pack.id)
    ? { ...record, related: related.get(record.pack.id) }
    : record);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
  console.log(`Built public files in ${output}`);
}
