import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePublicFile, isFingerprintedAsset } from './public-files.mjs';
import { createReviewHandler, injectReviewBridge, isLocalReviewRequest, rewriteReviewLinks } from './review-server.mjs';
import { rebuildReviewPreview } from './review-rebuild.mjs';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };

// Preview emitted files, common headers and canonical slash redirects locally.
// Cloudflare is authoritative for edge caching, TLS and hostname matching.
export async function createPreviewServer({ review = false, reviewStore } = {}) {
  const rules = await readFile(path.join(root, '_headers'), 'utf8');
  const common = Object.fromEntries(rules.split(/\r?\n\r?\n/)[0].split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const colon = line.indexOf(':');
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }));
  const notFound = await readFile(path.join(root, '404.html'));
  // Match Cloudflare Static Assets' default when no custom rule is present.
  common['Cache-Control'] ||= 'public, max-age=0, must-revalidate';
  let reviewSeeds = null;
  const reviewHandler = review ? await createReviewHandler({ root: fileURLToPath(new URL('..', import.meta.url)), storePath: reviewStore, refreshPreview: async () => { reviewSeeds = await rebuildReviewPreview(); } }) : null;
  if (review) {
    common['X-Frame-Options'] = 'SAMEORIGIN';
    common['Content-Security-Policy'] = common['Content-Security-Policy'].replace("frame-ancestors 'none'", "frame-ancestors 'self'");
  }
  return http.createServer(async (request, response) => {
    const send = (status, body, headers = {}) => {
      response.writeHead(status, { ...common, 'Content-Type': 'text/html; charset=utf-8', ...headers });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    try {
      if (reviewHandler && await reviewHandler(request, response)) return;
      if (!['GET', 'HEAD'].includes(request.method)) return send(405, '', { Allow: 'GET, HEAD' });
      const url = new URL(request.url, 'http://local');
      const pathname = decodeURIComponent(url.pathname);
      const directory = pathname === '/index.html' ? '/' : pathname.endsWith('/index.html') ? pathname.slice(0, -10) : !path.extname(pathname) && !pathname.endsWith('/') ? `${pathname}/` : null;
      if (directory && resolvePublicFile(root, directory)) return send(pathname === '/index.html' ? 301 : 307, '', { Location: `${directory}${url.search}` });
      const absolute = resolvePublicFile(root, pathname);
      if (!absolute) return send(404, notFound);
      const info = await stat(absolute);
      if (!info.isFile()) return send(404, notFound);
      const headers = { 'Content-Type': types[path.extname(absolute)] || 'application/octet-stream' };
      if (isFingerprintedAsset(path.relative(root, absolute).split(path.sep).join('/'))) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      if (pathname.startsWith('/downloads/')) headers['Content-Disposition'] = 'attachment';
      if (path.extname(absolute) === '.mp3') {
        headers['Accept-Ranges'] = 'bytes';
        headers['Content-Length'] = info.size;
        const range = request.headers.range;
        if (range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          let start = match?.[1] ? Number(match[1]) : Math.max(0, info.size - Number(match?.[2]));
          let end = match?.[1] && match[2] ? Number(match[2]) : info.size - 1;
          if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size || (!match[1] && Number(match[2]) === 0)) {
            return send(416, '', { ...headers, 'Content-Length': 0, 'Content-Range': `bytes */${info.size}` });
          }
          end = Math.min(end, info.size - 1);
          headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
          headers['Content-Length'] = end - start + 1;
          const bytes = request.method === 'HEAD' ? '' : (await readFile(absolute)).subarray(start, end + 1);
          return send(206, bytes, headers);
        }
      }
      let body = await readFile(absolute);
      if (review && isLocalReviewRequest(request) && url.searchParams.has('__review') && path.extname(absolute) === '.html') {
        body = rewriteReviewLinks(body.toString('utf8'), request.url);
        // Local annotated legal previews use the dev response policy; public files retain their meta CSP.
        body = body.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
        body = injectReviewBridge(body, url.searchParams.get('__review'), reviewSeeds);
        headers['Cache-Control'] = 'no-store';
        headers['X-Robots-Tag'] = 'noindex, nofollow';
      }
      return send(200, body, headers);
    } catch (error) {
      if (error instanceof URIError) return send(400, 'Geçersiz adres.');
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return send(404, notFound);
      console.error(error);
      return send(500, 'Sayfa şu anda açılamıyor.');
    }
  });
}
