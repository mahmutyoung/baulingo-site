import path from 'node:path';
import { topics } from '../src/topics.js';
import { writingLessons } from './writing-content.mjs';
import { dtzHubRoutes, dtzGermanArchives } from './dtz-hub.mjs';
import { courseRoutes } from './course-pages.mjs';
import { grammarPaths, lessonPaths } from '../src/mini-packs/routes.js';
import { englishLevelPaths } from './lesson-pages.mjs';

// Approved separately from the 2 MB core site: loaded only by the DTZ experience.
export const dtzMediaFiles = [
  'assets/dtz/dtz-mock-01-listening.mp3',
  'assets/dtz/speaking-neighbor-help-a.webp', 'assets/dtz/speaking-neighbor-help-b.webp',
];

// Explicit publication boundary: adding a file under assets/ never publishes it by accident.
export const publicFiles = [
  'index.html', 'style.css', 'app.js', 'src/learning-text.js', 'src/a1-test.js', '.nojekyll', 'privacy/index.html', 'impressum/index.html',
  'src/analytics.js', 'src/analytics-contract.js', 'src/analytics-attribution.js', 'src/exercise.js', 'src/english-exercises.js', 'src/sentence-builder.js', 'src/english-practice.js', 'src/topics.js', 'src/language.js', 'src/language-choice.js', 'src/navigation.js', 'src/dtz-study-filter.js',
  'en/mini-packs/index.html', 'konular/mini-paketler/index.html', 'src/mini-packs/style.css', 'src/mini-packs/answers.js',
  'src/mini-packs/icons.js', 'src/mini-packs/language.js', 'src/mini-packs/lesson.js', 'src/mini-packs/player.js', 'src/mini-packs/routes.js',

  'dtz.css', 'src/dtz/content.js', 'src/dtz/rules.js', 'src/dtz/player.js', 'src/dtz/german-resource.js', ...dtzMediaFiles,
  'writing.css', 'src/writing/rules.js', 'src/writing/player.js', 'src/writing/activities.js', 'src/writing/studio.js',
  'src/writing/letter-rules.js', 'src/writing/letter-builder.js', 'assets/writing-icons.svg', 'assets/Tabler-LICENSE.txt',
  'assets/logo.svg', 'assets/favicon.svg', 'assets/cafe-hero.webp',
  ...[480, 800].map(width => `assets/cafe-hero-${width}.webp`),
  'assets/audio/einen-kaffee-bitte.mp3',
  ...['Newsreader-Bold', 'Newsreader-SemiBold', 'BaulingoSans-Regular', 'BaulingoSans-SemiBold', 'BaulingoSans-Bold'].map(name => `assets/${name}.woff2`),
  ...['Newsreader', 'BaulingoSans'].map(name => `assets/${name}-OFL.txt`),
  ...['arrow-right', 'book-open', 'caret-down', 'chat-circle', 'file-text', 'magnifying-glass', 'speaker-high'].map(name => `assets/icons/${name}.svg`),
  'assets/icons/LICENSE.txt',
];
export const generatedFiles = [
  'src/mini-packs/library.gz', 'src/mini-packs/library-tr.gz',
  'src/mini-packs/grammar.gz', 'src/mini-packs/grammar-tr.gz', 'src/dtz/study-lists.gz',
  'src/writing/catalog.js',
  ...dtzHubRoutes.map(route => `${route.slice(1)}index.html`),
  ...courseRoutes.map(route => `${route.slice(1)}index.html`),
  ...[...englishLevelPaths, ...grammarPaths, ...lessonPaths].map(route => `${route.slice(1)}index.html`),
  ...dtzGermanArchives.map(([file]) => file),
  'en/index.html', 'en/word-order/index.html', 'en/articles/index.html', 'en/appointments/index.html',
  '404.html', 'robots.txt', 'sitemap.xml', 'sinavlar/index.html', 'konular/index.html', 'uygulama/index.html',
  ...topics.map(topic => `konular/${topic.id}/index.html`),
  'konular/kafede-siparis/index.html',
  'dtz-deneme-sinavi/index.html', 'dtz-kelime-kalip-cumle/index.html',
  'dtz-mektup-yazma/index.html', ...writingLessons.map(lesson => `dtz-mektup-yazma/${lesson.id}/index.html`),
];

export const cacheableAssets = publicFiles.filter(file => file.startsWith('assets/') && /\.(?:woff2|webp|svg|mp3)$/.test(file) && !dtzMediaFiles.includes(file));
// Assets are emitted once, with exact 200 rewrites retaining mutable URLs.
export const fingerprintOnlyAssets = cacheableAssets;
export const legacyAssetAliases = { 'assets/cafe-hero-1200.webp': 'assets/cafe-hero.webp' };
export function cachedAssetPath(source, hash) {
  const extension = path.posix.extname(source);
  return `assets/cache/${source.slice('assets/'.length, -extension.length)}.${hash}${extension}`;
}
const cachePatterns = cacheableAssets.map(source => new RegExp(`^${cachedAssetPath(source, 'HASH').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('HASH', '[a-f0-9]{12}')}$`));
export const isFingerprintedAsset = relative => cachePatterns.some(pattern => pattern.test(relative));

export function resolvePublicFile(root, pathname) {
  if (pathname.includes('\\') || pathname.includes('\0')) return null;
  let relative = pathname.replace(/^\/+/, '') || 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) return null;
  const canonical = path.relative(root, absolute).split(path.sep).join('/');
  const allowed = publicFiles.includes(canonical) || generatedFiles.includes(canonical) || Object.hasOwn(legacyAssetAliases, canonical) || isFingerprintedAsset(canonical);
  return allowed ? absolute : null;
}
