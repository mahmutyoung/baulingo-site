import path from 'node:path';
import { topics } from '../src/topics.js';

// Approved separately from the 2 MB core site: loaded only by the DTZ experience.
export const dtzMediaFiles = [
  'assets/dtz/dtz-mock-01-listening.mp3',
  'assets/dtz/speaking-neighbor-help-a.webp', 'assets/dtz/speaking-neighbor-help-b.webp',
];

// Explicit publication boundary: adding a file under assets/ never publishes it by accident.
export const publicFiles = [
  'index.html', 'style.css', 'app.js', '.nojekyll', 'privacy/index.html', 'impressum/index.html',
  'src/exercise.js', 'src/topics.js', 'src/navigation.js',
  'dtz.css', 'src/dtz/content.js', 'src/dtz/rules.js', 'src/dtz/player.js', ...dtzMediaFiles,
  'assets/logo.svg', 'assets/favicon.svg', 'assets/cafe-hero.webp',
  ...[480, 800, 1200].map(width => `assets/cafe-hero-${width}.webp`),
  'assets/audio/einen-kaffee-bitte.mp3',
  ...['Newsreader-Bold', 'Newsreader-SemiBold', 'BaulingoSans-Regular', 'BaulingoSans-SemiBold', 'BaulingoSans-Bold'].map(name => `assets/${name}.woff2`),
  ...['Newsreader', 'BaulingoSans'].map(name => `assets/${name}-OFL.txt`),
  ...['arrow-right', 'book-open', 'caret-down', 'chat-circle', 'file-text', 'magnifying-glass', 'speaker-high'].map(name => `assets/icons/${name}.svg`),
  'assets/icons/LICENSE.txt',
];
export const generatedFiles = [
  '404.html', 'robots.txt', 'sitemap.xml', 'konular/index.html',
  ...topics.map(topic => `konular/${topic.id}/index.html`),
  'konular/kafede-siparis/index.html',
  'dtz-deneme-sinavi/index.html',
];

export const cacheableAssets = publicFiles.filter(file => file.startsWith('assets/') && /\.(?:woff2|webp|svg|mp3)$/.test(file) && !dtzMediaFiles.includes(file));
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
  const allowed = publicFiles.includes(canonical) || generatedFiles.includes(canonical) || isFingerprintedAsset(canonical);
  return allowed ? absolute : null;
}
