import path from 'node:path';
import { topics } from '../src/topics.js';

// Explicit publication boundary: adding a file under assets/ never publishes it by accident.
export const publicFiles = [
  'index.html', 'style.css', 'app.js', '.nojekyll', 'privacy/index.html', 'impressum/index.html',
  'src/exercise.js', 'src/topics.js',
  'downloads/kafede-almanca.txt', 'downloads/artikeller-ilk-kelimeler.txt',
  'assets/logo.svg', 'assets/favicon.svg', 'assets/cafe-hero.webp', 'assets/resources-banner.webp',
  'assets/audio/einen-kaffee-bitte.mp3',
  ...['Newsreader-Bold', 'Newsreader-SemiBold', 'Lato-Regular', 'Lato-SemiBold', 'Lato-Bold'].map(name => `assets/${name}.woff2`),
  ...['Newsreader', 'Lato'].map(name => `assets/${name}-OFL.txt`),
  ...['arrow-right', 'book-open', 'caret-down', 'chat-circle', 'file-text', 'magnifying-glass', 'speaker-high'].map(name => `assets/icons/${name}.svg`),
  'assets/icons/LICENSE.txt',
];
export const generatedFiles = [
  '404.html', 'robots.txt', 'sitemap.xml', 'konular/index.html',
  ...topics.map(topic => `konular/${topic.id}/index.html`),
  'konular/kafede-siparis/index.html', 'kaynaklar/index.html',
];

export function resolvePublicFile(root, pathname) {
  if (pathname.includes('\\') || pathname.includes('\0')) return null;
  let relative = pathname.replace(/^\/+/, '') || 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) return null;
  const canonical = path.relative(root, absolute).split(path.sep).join('/');
  const allowed = publicFiles.includes(canonical) || generatedFiles.includes(canonical);
  return allowed ? absolute : null;
}
