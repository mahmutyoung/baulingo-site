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
import { fingerprintAssets, rewriteAssetURLs } from './assets.mjs';

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

// These modules contain no multiline string literals. Preserve line breaks and tokens.
const compactModules = new Set([
  'src/analytics.js', 'app.js', 'src/sentence-builder.js', 'src/writing/player.js',
  'src/writing/activities.js', 'src/dtz/player.js', 'src/a1-test.js', 'src/dtz/german-resource.js',
  'src/language.js', 'src/dtz-study-filter.js', 'src/writing/studio.js', 'src/writing/letter-builder.js',
  'src/writing/letter-rules.js', 'src/writing/rules.js', 'src/dtz/rules.js',
  'src/mini-packs/routes.js', 'src/learning-text.js', 'src/topics.js',
]);
function compactModule(source) {
  if (source.includes('/*') || source.includes('\\\n') || source.split('\n').some(line => (line.match(/`/g) || []).length % 2)) return source;
  return source.split('\n').map(line => line.trimStart()).filter(line => !line.startsWith('//') && line.length).join('\n') + '\n';
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
    if (compactModules.has(file)) {
      const source = await readFile(path.join(root, file), 'utf8');
      await writeFile(path.join(output, file), compactModule(source));
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
  await writeFile(path.join(output, 'src/dtz/content.js'), `export const examData = ${JSON.stringify(examData)};\n`);
  for (const [file, html] of generatePages({ en, tr }, { en: grammarEn, tr: grammarTr })) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    // Compact repeated markup in the training pages while preserving their DOM.
    const compact = file === 'dtz-kelime-kalip-cumle/index.html'
      ? html.replace(/(\s(?:class|lang|scope|type|data-[a-z-]+))="([A-Za-z0-9_-]+)"/g, '$1=$2')
        .replace(/<\/(?:td|th)>(?=<(?:td|th)(?:[ >])|<\/tr>)/g, '')
        .replace(/<\/li>(?=<li[ >]|<\/[ou]l>)/g, '')
      : file === 'dtz-deneme-sinavi/index.html'
        ? html.replace(/(\s(?:class|lang|scope|type))="([A-Za-z0-9_-]+)"/g, '$1=$2')
        : file.startsWith('dtz-mektup-yazma/')
          ? html.replace(/(\s(?:class|scope|type|data-(?!(?:task|task-kind)=)[a-z-]+))="([A-Za-z0-9_-]+)"/g, '$1=$2')
            .replace(/ lang="de"/g, ' lang=de')
            .replace(/(\s(?:aria-describedby|aria-labelledby|for|id|name|rows|maxlength|data-response))="([A-Za-z0-9_:-]+)"/g, '$1=$2')
            .replace(/<\/option>(?=<option[ >]|<\/select>)/g, '')
            .replace(/<\/li>(?=<li[ >]|<\/[ou]l>)/g, '')
          : html;
    await writeFile(path.join(output, file), compact);
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
