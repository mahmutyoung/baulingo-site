import { copyFile, mkdir, mkdtemp, rename, rm, lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, constants as zlib } from 'node:zlib';
import { publicFiles, generatedFiles, fingerprintOnlyAssets, legacyAssetAliases } from './public-files.mjs';
import { build as buildAstro } from 'astro';
import { transform } from 'lightningcss';
import { build as bundle, minify } from 'vite';
import { dtzStudyArchive, fullStudyContent, renderNotFound } from './pages.mjs';
import { outputFile, sitemapXml } from '../src/publishing/model.ts';
import { dtzGermanArchives } from './dtz-hub.mjs';
import { writingBase, writingLessons } from './writing-content.mjs';
import { writingCourseNavigation } from './writing-page.mjs';
import { examData } from '../src/dtz/content.js';
import { catalog as publishing, coursePages as courseOverviews } from '../src/publishing/catalog.ts';
import { compactGeneratedHTML, fingerprintAssets, rewriteAssetURLs } from './assets.mjs';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const output = path.join(root, 'dist');
const miniPackLibraries = ['library', 'library-tr', 'grammar', 'grammar-tr'];
const learnerData = (name, extension) => `src/mini-packs/${name}.${extension}`;
// Choose the smallest standard gzip encoding; all variants decode to identical bytes.
function compactGzip(input) {
  const variants = [gzipSync(input, { level: 9 })];
  for (const memLevel of [8, 9]) for (const strategy of [zlib.Z_DEFAULT_STRATEGY, zlib.Z_FILTERED]) {
    variants.push(gzipSync(input, { level: 9, memLevel, strategy }));
  }
  return variants.reduce((best, candidate) => candidate.length < best.length ? candidate : best);
}

export async function build() {
  // Check every source and parent before copying; never follow a symlink outside this repo.
  for (const file of [...publicFiles, '_headers', '_redirects', 'src/analytics/schema.ts', ...miniPackLibraries.map(name => learnerData(name, 'json'))]) {
    let entry = path.join(root, file);
    while (entry !== root) {
      if ((await lstat(entry)).isSymbolicLink()) throw new Error(`Refusing to publish symlink: ${file}`);
      entry = path.dirname(entry);
    }
  }
  const scratch = path.join(root, '.dev');
  await mkdir(scratch, { recursive: true });
  if ((await lstat(scratch)).isSymbolicLink()) throw new Error('Refusing to stage through a symlink: .dev');
  const staging = await mkdtemp(path.join(scratch, 'release-'));
  try {
    await writeRelease(staging);
    await rm(output, { recursive: true, force: true });
    await rename(staging, output);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return output;
}

async function writeRelease(output) {
  process.env.ASTRO_TELEMETRY_DISABLED ??= '1';
  await buildAstro({ root, outDir: output, logLevel: 'warn' });
  const rendered = new Set([...publishing.paths.keys()].map(outputFile));
  const entries = await readdir(output, { recursive: true, withFileTypes: true });
  for (const entry of entries.filter(entry => !entry.isDirectory())) {
    const file = path.relative(output, path.join(entry.parentPath, entry.name)).split(path.sep).join('/');
    if (!entry.isFile() || !rendered.delete(file)) throw new Error(`Unexpected Astro output: ${file}`);
  }
  if (rendered.size) throw new Error(`Missing Astro output: ${[...rendered].join(', ')}`);
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
  await writeFile(path.join(output, '404.html'), renderNotFound());
  await writeFile(path.join(output, 'sitemap.xml'), sitemapXml(publishing.sitemapLocations()));

  const mapping = await fingerprintAssets(output);
  for (const file of [...publicFiles, ...generatedFiles].filter(name => name.endsWith('.html'))) {
    const target = path.join(output, file);
    const html = await readFile(target, 'utf8');
    const rewritten = rewriteAssetURLs(compactGeneratedHTML(file, html), mapping);
    if (rewritten !== html) await writeFile(target, rewritten);
  }

  // Compile allowlisted browser modules and CSS, retaining their public paths.
  for (const file of [...publicFiles, ...generatedFiles].filter(name => /\.(?:js|css)$/.test(name))) {
    const target = path.join(output, file);
    let source;
    if (file === 'src/analytics-contract.js') {
      const [result] = await bundle({
        root, configFile: false, publicDir: false, logLevel: 'warn', envDir: false,
        build: { lib: { entry: path.join(root, file), formats: ['es'] }, write: false, minify: false },
      });
      const [chunk] = result.output;
      if (result.output.length !== 1 || chunk.type !== 'chunk') throw new Error('Expected one compiled analytics contract.');
      source = chunk.code;
    } else source = await readFile(target, 'utf8');
    if (file.endsWith('.css')) {
      const { code } = transform({
        filename: file,
        code: Buffer.from(rewriteAssetURLs(source, mapping)),
        minify: true,
      });
      await writeFile(target, code);
    } else {
      const result = await minify(file, source, { compress: true, mangle: true });
      if (result.errors?.length) throw new Error(`Could not compile ${file}: ${JSON.stringify(result.errors)}`);
      await writeFile(target, result.code);
    }
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
