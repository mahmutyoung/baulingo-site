import { cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build as buildAstro } from 'astro';
import { transform } from 'lightningcss';
import { minify } from 'vite';
import { build as buildLegacy } from './build.mjs';
import { rewriteAssetURLs } from './assets.mjs';
import { generatedFiles, isFingerprintedAsset, publicFiles } from './public-files.mjs';
import { grammarPaths, lessonPaths, readerPath } from '../src/mini-packs/routes.js';
import { catalog } from '../src/publishing/catalog.ts';
import { outputFile, siteOrigin, sitemapXml } from '../src/publishing/model.ts';

const candidate = fileURLToPath(new URL('../.dev/astro-dist', import.meta.url));
const legacyOwnedPaths = new Set(['/', '/en/', readerPath('en'), readerPath('tr'), ...grammarPaths, ...lessonPaths]);
if (catalog.paths.size !== legacyOwnedPaths.size || [...catalog.paths.keys()].some(route => !legacyOwnedPaths.has(route))) {
  throw new Error('Publishing metadata must preserve the existing homepage and mini-pack paths');
}
const rendered = new Set([...catalog.paths.keys()].map(outputFile));
const legacy = await buildLegacy();
await buildAstro({});

// Reuse only the legacy builder's public artifact during the incremental cutover.
await cp(legacy, candidate, {
  recursive: true,
  filter: source => !rendered.has(path.relative(legacy, source).split(path.sep).join('/')),
});

const redirects = await readFile(path.join(legacy, '_redirects'), 'utf8');
const fingerprints = new Map();
for (const line of redirects.trim().split(/\r?\n/)) {
  const [source, target, status] = line.trim().split(/\s+/);
  if (status === '200' && isFingerprintedAsset(target.slice(1))) {
    fingerprints.set(source.slice(1), target.slice(1));
  }
}
for (const file of rendered) {
  const target = path.join(candidate, file);
  const html = await readFile(target, 'utf8');
  const rewritten = rewriteAssetURLs(html, fingerprints);
  if (rewritten !== html) await writeFile(target, rewritten);
}

// Until all route families migrate, keep the unmodeled routes from the legacy sitemap.
const legacySitemap = await readFile(path.join(legacy, 'sitemap.xml'), 'utf8');
const unmodeled = [...legacySitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url)
  .filter(url => !catalog.paths.has(url.slice(siteOrigin.length)));
await writeFile(path.join(candidate, 'sitemap.xml'), sitemapXml([...unmodeled, ...catalog.sitemapLocations()]));

// Compile only allowlisted browser assets, retaining their URLs and module boundaries.
for (const file of [...publicFiles, ...generatedFiles].filter(name => /\.(?:js|css)$/.test(name))) {
  const source = publicFiles.includes(file) ? new URL(`../${file}`, import.meta.url) : path.join(legacy, file);
  const text = await readFile(source, 'utf8');
  if (file.endsWith('.css')) {
    const { code } = transform({
      filename: file,
      code: Buffer.from(rewriteAssetURLs(text, fingerprints)),
      minify: true,
    });
    await writeFile(path.join(candidate, file), code);
  } else {
    const result = await minify(file, text, { compress: true, mangle: true });
    if (result.errors?.length) throw new Error(`Could not compile ${file}: ${JSON.stringify(result.errors)}`);
    await writeFile(path.join(candidate, file), result.code);
  }
}
console.log(`Built Astro candidate in ${candidate}`);
