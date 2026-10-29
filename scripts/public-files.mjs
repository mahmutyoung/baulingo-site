import path from 'node:path';

export const publicFiles = ['index.html', 'style.css', 'app.js', '.nojekyll'];
export const publicDirectories = ['assets', 'src', 'downloads', 'privacy'];

export function resolvePublicFile(root, pathname) {
  if (pathname.includes('\\') || pathname.includes('\0')) return null;
  let relative = pathname.replace(/^\/+/, '') || 'index.html';
  if (relative.endsWith('/')) relative += 'index.html';
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(`${root}${path.sep}`)) return null;
  const canonical = path.relative(root, absolute).split(path.sep).join('/');
  const allowed = publicFiles.includes(canonical)
    || publicDirectories.some(directory => canonical.startsWith(`${directory}/`));
  return allowed ? absolute : null;
}
