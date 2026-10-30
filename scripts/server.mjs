import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePublicFile } from './public-files.mjs';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };

// Preview emitted files, common headers and canonical slash redirects locally.
// Cloudflare is authoritative for edge caching, TLS and hostname matching.
export async function createPreviewServer() {
  const rules = await readFile(path.join(root, '_headers'), 'utf8');
  const common = Object.fromEntries(rules.split(/\r?\n\r?\n/)[0].split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const colon = line.indexOf(':');
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }));
  const notFound = await readFile(path.join(root, '404.html'));
  return http.createServer(async (request, response) => {
    const send = (status, body, headers = {}) => {
      response.writeHead(status, { ...common, 'Content-Type': 'text/html; charset=utf-8', ...headers });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    try {
      if (!['GET', 'HEAD'].includes(request.method)) return send(405, '', { Allow: 'GET, HEAD' });
      const url = new URL(request.url, 'http://local');
      const pathname = decodeURIComponent(url.pathname);
      const directory = pathname === '/index.html' ? '/' : pathname.endsWith('/index.html') ? pathname.slice(0, -10) : !path.extname(pathname) && !pathname.endsWith('/') ? `${pathname}/` : null;
      if (directory && resolvePublicFile(root, directory)) return send(pathname === '/index.html' ? 301 : 307, '', { Location: `${directory}${url.search}` });
      const absolute = resolvePublicFile(root, pathname);
      if (!absolute) return send(404, notFound);
      if (!(await stat(absolute)).isFile()) return send(404, notFound);
      const headers = { 'Content-Type': types[path.extname(absolute)] || 'application/octet-stream' };
      if (pathname.startsWith('/downloads/')) headers['Content-Disposition'] = 'attachment';
      return send(200, await readFile(absolute), headers);
    } catch (error) {
      if (error instanceof URIError) return send(400, 'Geçersiz adres.');
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return send(404, notFound);
      console.error(error);
      return send(500, 'Sayfa şu anda açılamıyor.');
    }
  });
}
