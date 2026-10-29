import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePublicFile } from './public-files.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const flag = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const port = Number(flag('--port', process.env.PORT || 4173));
const host = flag('--host', '127.0.0.1');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };

http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const absolute = resolvePublicFile(root, pathname);
    if (!absolute) { response.writeHead(404).end('Sayfa bulunamadı.'); return; }
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (!(await stat(absolute)).isFile()) { response.writeHead(404).end('Sayfa bulunamadı.'); return; }
    const headers = { 'Content-Type': types[path.extname(absolute)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (relative.startsWith('downloads/')) headers['Content-Disposition'] = `attachment; filename="${path.basename(relative)}"`;
    response.writeHead(200, headers);
    response.end(request.method === 'HEAD' ? undefined : await readFile(absolute));
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end('Sayfa bulunamadı.');
  }
}).listen(port, host, () => console.log(`Baulingo preview: http://${host}:${port}`));
